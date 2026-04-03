"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "@/hooks/use-toast";
import { UserPlus, Trash2, Crown, CheckCircle2, Clock } from "lucide-react";

interface Member {
  id: string;
  role: string;
  user: { id: string; name: string | null; email: string; image: string | null };
}

interface SearchUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  avatarUrl: string;
}

interface ClientInvitation {
  id: string;
  email: string;
  inviterName: string | null;
  createdAt: string;
  joined: boolean;
}

interface MemberListProps {
  projectId: string;
  members: Member[];
  currentUserId: string;
  isAdmin: boolean;
  canManageClients: boolean;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const ROLE_LABELS: Record<string, string> = {
  OWNER: "Owner", ADMIN: "Admin", MEMBER: "Member",
  VIEWER: "Viewer", RANK1: "Admin", CLIENT: "Client",
};

export function MemberList({ projectId, members, currentUserId, isAdmin, canManageClients }: MemberListProps) {
  const router = useRouter();

  // ── team member invite ────────────────────────────────────────
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchUser[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<Member | null>(null);
  const [transferTarget, setTransferTarget] = useState<Member | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // ── client invite ─────────────────────────────────────────────
  const { data: clients = [], mutate: mutateClients } = useSWR<ClientInvitation[]>(
    canManageClients ? `/api/projects/${projectId}/clients` : null,
    fetcher
  );
  const [clientEmail, setClientEmail] = useState("");
  const [clientLoading, setClientLoading] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<ClientInvitation | null>(null);
  const [revokeLoading, setRevokeLoading] = useState(false);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setShowSuggestions(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (email.trim().length < 1) { setSuggestions([]); setShowSuggestions(false); return; }
    debounceRef.current = setTimeout(async () => {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(email)}&projectId=${projectId}`);
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data);
        setShowSuggestions(data.length > 0);
      }
    }, 200);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [email, projectId]);

  function selectSuggestion(user: SearchUser) {
    setEmail(user.email);
    setSuggestions([]);
    setShowSuggestions(false);
  }

  async function inviteMember(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setShowSuggestions(false);
    try {
      const res = await fetch(`/api/projects/${projectId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast({ title: "Member added!", description: `${email} added to the project.` });
      setEmail("");
      router.refresh();
    } catch (err) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Failed to add member", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function confirmRemove() {
    if (!removeTarget) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/members`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: removeTarget.user.id }),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Member removed" });
      router.refresh();
    } catch {
      toast({ title: "Failed to remove member", variant: "destructive" });
    } finally {
      setActionLoading(false);
      setRemoveTarget(null);
    }
  }

  async function confirmTransfer() {
    if (!transferTarget) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/members`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newOwnerId: transferTarget.user.id }),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Ownership transferred" });
      router.refresh();
    } catch {
      toast({ title: "Failed to transfer ownership", variant: "destructive" });
    } finally {
      setActionLoading(false);
      setTransferTarget(null);
    }
  }

  async function inviteClient(e: React.FormEvent) {
    e.preventDefault();
    if (!clientEmail.trim()) return;
    setClientLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/clients`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: clientEmail.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast({ title: "Client invited", description: `${clientEmail} can now sign in and access this project.` });
      setClientEmail("");
      mutateClients();
    } catch (err) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Failed to invite client", variant: "destructive" });
    } finally {
      setClientLoading(false);
    }
  }

  async function revokeClient() {
    if (!revokeTarget) return;
    setRevokeLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/clients/${revokeTarget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast({ title: "Client access revoked" });
      mutateClients();
      router.refresh();
    } catch {
      toast({ title: "Failed to revoke access", variant: "destructive" });
    } finally {
      setRevokeLoading(false);
      setRevokeTarget(null);
    }
  }

  const teamMembers = members.filter((m) => m.user.email.endsWith("@punchteam.com"));
  const clientMembers = members.filter((m) => !m.user.email.endsWith("@punchteam.com"));

  return (
    <>
      {/* ── Team Members ── */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Team Members</h2>
        <div className="space-y-3 mb-6">
          {teamMembers.map((member) => (
            <div key={member.id} className="flex items-center gap-3">
              <UserAvatar name={member.user.name} email={member.user.email} image={member.user.image} className="h-8 w-8" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{member.user.name || member.user.email}</p>
                <p className="text-xs text-muted-foreground truncate">{member.user.email}</p>
              </div>
              <Badge variant="outline" className="text-xs">{ROLE_LABELS[member.role] ?? member.role}</Badge>
              {isAdmin && member.user.id !== currentUserId && member.role !== "OWNER" && (
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-yellow-500"
                    onClick={() => setTransferTarget(member)} title="Transfer ownership">
                    <Crown className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => setRemoveTarget(member)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>

        {isAdmin && (
          <div ref={wrapperRef} className="relative">
            <form onSubmit={inviteMember} className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  placeholder="Search by name or email…"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  autoComplete="off"
                />
                {showSuggestions && (
                  <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-lg border bg-popover shadow-lg overflow-hidden">
                    {suggestions.map((user) => (
                      <button key={user.id} type="button" onClick={() => selectSuggestion(user)}
                        className="flex items-center gap-3 w-full px-3 py-2.5 text-left hover:bg-accent transition-colors">
                        <UserAvatar name={user.name} email={user.email} image={user.image} avatarUrl={user.avatarUrl} className="h-7 w-7" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{user.name ?? user.email}</p>
                          {user.name && <p className="text-xs text-muted-foreground truncate">{user.email}</p>}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Button type="submit" disabled={loading || !email.trim()}>
                <UserPlus className="h-4 w-4 mr-2" />Add
              </Button>
            </form>
          </div>
        )}
      </div>

      {/* ── Client Access ── */}
      {canManageClients && (
        <div className="mt-10">
          <h2 className="text-lg font-semibold mb-1">Client Access</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Invited clients can sign in with their Google account and manage their own tasks on this project.
          </p>

          {/* Existing CLIENT members (already joined) */}
          {clientMembers.length > 0 && (
            <div className="space-y-3 mb-4">
              {clientMembers.map((member) => {
                const inv = clients.find((c) => c.email === member.user.email);
                return (
                  <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                    <UserAvatar name={member.user.name} email={member.user.email} image={member.user.image} className="h-8 w-8" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{member.user.name || member.user.email}</p>
                      <p className="text-xs text-muted-foreground truncate">{member.user.email}</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-green-500">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Joined</span>
                    </div>
                    {inv && (
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => setRevokeTarget(inv)} title="Revoke access">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Pending invitations (invited but not yet signed in) */}
          {clients.filter((c) => !c.joined && !clientMembers.some((m) => m.user.email.toLowerCase() === c.email.toLowerCase())).length > 0 && (
            <div className="space-y-2 mb-4">
              {clients.filter((c) => !c.joined && !clientMembers.some((m) => m.user.email.toLowerCase() === c.email.toLowerCase())).map((inv) => (
                <div key={inv.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card/50">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{inv.email}</p>
                    <p className="text-xs text-muted-foreground">Invitation pending</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => setRevokeTarget(inv)} title="Revoke invitation">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Invite form */}
          <form onSubmit={inviteClient} className="flex gap-2">
            <Input
              type="email"
              placeholder="client@example.com"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={clientLoading || !clientEmail.trim()}>
              <UserPlus className="h-4 w-4 mr-2" />Invite
            </Button>
          </form>
        </div>
      )}

      {/* Dialogs */}
      <ConfirmDialog
        open={!!removeTarget}
        onOpenChange={(open) => { if (!open) setRemoveTarget(null); }}
        title={`Remove ${removeTarget?.user.name ?? removeTarget?.user.email ?? "member"}?`}
        description="They will lose access to this project immediately. You can re-add them later."
        confirmLabel="Remove member"
        variant="danger"
        loading={actionLoading}
        onConfirm={confirmRemove}
      />

      <ConfirmDialog
        open={!!transferTarget}
        onOpenChange={(open) => { if (!open) setTransferTarget(null); }}
        title={`Transfer ownership to ${transferTarget?.user.name ?? transferTarget?.user.email ?? "member"}?`}
        description="They will become the new project owner. Your role will change to Member."
        confirmLabel="Transfer ownership"
        variant="warning"
        loading={actionLoading}
        onConfirm={confirmTransfer}
      />

      <ConfirmDialog
        open={!!revokeTarget}
        onOpenChange={(open) => { if (!open) setRevokeTarget(null); }}
        title="Revoke client access?"
        description={`${revokeTarget?.email} will no longer be able to sign in and access this project.`}
        confirmLabel="Revoke access"
        variant="danger"
        loading={revokeLoading}
        onConfirm={revokeClient}
      />
    </>
  );
}

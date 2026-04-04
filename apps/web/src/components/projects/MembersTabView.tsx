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
import { UserPlus, Trash2, CheckCircle2, Clock, Crown } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Admin", PROJECT_MANAGER: "Project Manager", MEMBER: "Member", CLIENT: "Client",
};

interface Member {
  id: string;
  role: string;
  user: { id: string; name: string | null; email: string; image: string | null };
}

interface SearchUser {
  id: string; name: string | null; email: string; image: string | null; avatarUrl: string;
}

interface ClientInvitation {
  id: string; email: string; inviterName: string | null; createdAt: string; joined: boolean;
}

interface MembersTabViewProps {
  projectId: string;
  projectOwnerId: string;
  allMembers: Member[];
  currentUserId: string;
  currentUserRole: string;
  filter: "team" | "clients";
}

export function MembersTabView({ projectId, projectOwnerId, allMembers, currentUserId, currentUserRole, filter }: MembersTabViewProps) {
  const router = useRouter();
  const canManage = currentUserRole === "ADMIN" || currentUserRole === "PROJECT_MANAGER";
  const canManageClients = canManage;
  const isAdmin = currentUserRole === "ADMIN";

  const teamMembers = allMembers.filter((m) => m.role !== "CLIENT");
  const clientMembers = allMembers.filter((m) => m.role === "CLIENT");

  // ── Team member invite ────────────────────────────────────────────
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchUser[]>([]);
  const [showSugg, setShowSugg] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<Member | null>(null);
  const [transferTarget, setTransferTarget] = useState<Member | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setShowSugg(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!email.trim()) { setSuggestions([]); setShowSugg(false); return; }
    debounceRef.current = setTimeout(async () => {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(email)}&projectId=${projectId}`);
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data);
        setShowSugg(data.length > 0);
      }
    }, 200);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [email, projectId]);

  async function inviteMember(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setShowSugg(false);
    try {
      const res = await fetch(`/api/projects/${projectId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast({ title: "Member added", description: `${email} added to the project.` });
      setEmail("");
      router.refresh();
    } catch (err) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Failed to add member", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function removeMember() {
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

  async function transferOwnership() {
    if (!transferTarget) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/members`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newOwnerId: transferTarget.user.id }),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Ownership transferred", description: `${transferTarget.user.name ?? transferTarget.user.email} is now the project owner.` });
      router.refresh();
    } catch {
      toast({ title: "Failed to transfer ownership", variant: "destructive" });
    } finally {
      setActionLoading(false);
      setTransferTarget(null);
    }
  }

  // ── Client invite ─────────────────────────────────────────────────
  const { data: clients = [], mutate: mutateClients } = useSWR<ClientInvitation[]>(
    canManageClients ? `/api/projects/${projectId}/clients` : null,
    fetcher
  );
  const [clientEmail, setClientEmail] = useState("");
  const [clientLoading, setClientLoading] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<string | null>(null);
  const [revokeLoading, setRevokeLoading] = useState(false);

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

  async function revokeClient(id: string) {
    setRevokeLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/clients/${id}`, { method: "DELETE" });
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

  // ── Render: Team ──────────────────────────────────────────────────
  if (filter === "team") {
    return (
      <div className="p-6 max-w-xl space-y-6">
        <div>
          <h2 className="text-lg font-semibold">Team Members</h2>
          <p className="text-sm text-muted-foreground">{teamMembers.length} member{teamMembers.length !== 1 ? "s" : ""}</p>
        </div>

        {canManage && (
          <div ref={wrapperRef} className="relative">
            <form onSubmit={inviteMember} className="flex gap-2">
              <Input
                type="text"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowSugg(true)}
                className="flex-1"
                autoComplete="off"
              />
              <Button type="submit" disabled={loading || !email.trim()}>
                <UserPlus className="h-4 w-4 mr-1" />
                {loading ? "Adding..." : "Add"}
              </Button>
            </form>
            {showSugg && (
              <div className="absolute top-full left-0 right-0 z-10 mt-1 rounded-md border bg-popover shadow-lg overflow-hidden">
                {suggestions.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-accent text-left"
                    onMouseDown={(e) => { e.preventDefault(); setEmail(u.email); setSuggestions([]); setShowSugg(false); }}
                  >
                    <UserAvatar name={u.name} email={u.email} image={u.image} className="h-6 w-6" />
                    <span>{u.name ?? u.email}</span>
                    <span className="text-muted-foreground ml-auto text-xs">{u.email}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="space-y-2">
          {teamMembers.map((m) => {
            const isOwner = m.user.id === projectOwnerId;
            return (
              <div key={m.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                <UserAvatar name={m.user.name} email={m.user.email} image={m.user.image} className="h-8 w-8 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{m.user.name ?? m.user.email}</p>
                  <p className="text-xs text-muted-foreground truncate">{m.user.email}</p>
                </div>
                {isOwner && (
                  <Badge variant="secondary" className="text-xs shrink-0">Owner</Badge>
                )}
                {isAdmin && !isOwner && (m.role === "ADMIN" || m.role === "PROJECT_MANAGER") && (
                  <Button
                    variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-yellow-500 shrink-0"
                    onClick={() => setTransferTarget(m)}
                    title="Make project owner"
                  >
                    <Crown className="h-3.5 w-3.5" />
                  </Button>
                )}
                {canManage && m.user.id !== currentUserId && (
                  <Button
                    variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive shrink-0"
                    onClick={() => setRemoveTarget(m)}
                    title="Remove member"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        {removeTarget && (
          <ConfirmDialog
            open
            onOpenChange={(o) => !o && setRemoveTarget(null)}
            title="Remove member?"
            description={`${removeTarget.user.name ?? removeTarget.user.email} will lose access to this project.`}
            confirmLabel="Remove"
            variant="danger"
            loading={actionLoading}
            onConfirm={removeMember}
          />
        )}
        {transferTarget && (
          <ConfirmDialog
            open
            onOpenChange={(o) => !o && setTransferTarget(null)}
            title="Transfer project ownership?"
            description={`${transferTarget.user.name ?? transferTarget.user.email} will become the new project owner.`}
            confirmLabel="Transfer ownership"
            variant="warning"
            loading={actionLoading}
            onConfirm={transferOwnership}
          />
        )}
      </div>
    );
  }

  // ── Render: Clients ───────────────────────────────────────────────
  const revokeTargetData = clients.find((c) => c.id === revokeTarget);

  return (
    <div className="p-6 max-w-xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Clients</h2>
        <p className="text-sm text-muted-foreground">Clients can view and submit tasks on this project.</p>
      </div>

      {canManageClients && (
        <form onSubmit={inviteClient} className="flex gap-2">
          <Input
            type="email"
            placeholder="Client email address"
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={clientLoading || !clientEmail.trim()}>
            <UserPlus className="h-4 w-4 mr-1" />
            {clientLoading ? "Inviting..." : "Invite"}
          </Button>
        </form>
      )}

      <div className="space-y-2">
        {/* Active CLIENT members */}
        {clientMembers.map((m) => (
          <div key={m.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
            <UserAvatar name={m.user.name} email={m.user.email} image={m.user.image} className="h-8 w-8 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{m.user.name ?? m.user.email}</p>
              <p className="text-xs text-muted-foreground truncate">{m.user.email}</p>
            </div>
            <Badge variant="secondary" className="text-xs shrink-0 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />Joined
            </Badge>
            {canManageClients && (
              <Button
                variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive shrink-0"
                onClick={() => setRevokeTarget(m.id)}
                title="Revoke access"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        ))}

        {/* Pending invitations — exclude any email already shown as joined above */}
        {clients.filter((c) => !c.joined && !clientMembers.some(
          (m) => m.user.email.toLowerCase() === c.email.toLowerCase()
        )).map((inv) => (
          <div key={inv.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card opacity-70">
            <UserAvatar name={null} email={inv.email} image={null} className="h-8 w-8 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{inv.email}</p>
              <p className="text-xs text-muted-foreground">Invited by {inv.inviterName ?? "—"}</p>
            </div>
            <Badge variant="outline" className="text-xs shrink-0 flex items-center gap-1">
              <Clock className="h-3 w-3" />Pending
            </Badge>
            {canManageClients && (
              <Button
                variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive shrink-0"
                onClick={() => setRevokeTarget(inv.id)}
                title="Revoke invitation"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        ))}

        {clientMembers.length === 0 && clients.filter((c) => !c.joined && !clientMembers.some((m) => m.user.email.toLowerCase() === c.email.toLowerCase())).length === 0 && (
          <p className="text-sm text-muted-foreground py-8 text-center">No clients yet.</p>
        )}
      </div>

      {revokeTarget && revokeTargetData && (
        <ConfirmDialog
          open
          onOpenChange={(o) => !o && setRevokeTarget(null)}
          title="Revoke client access?"
          description={`${revokeTargetData.email} will lose access to this project.`}
          confirmLabel="Revoke"
          variant="danger"
          loading={revokeLoading}
          onConfirm={() => revokeClient(revokeTarget)}
        />
      )}
    </div>
  );
}

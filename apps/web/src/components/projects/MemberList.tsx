"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "@/hooks/use-toast";
import { UserPlus, Trash2, Crown } from "lucide-react";

interface Member {
  id: string;
  role: string;
  user: { id: string; name: string | null; email: string; image: string | null };
}

interface MemberListProps {
  projectId: string;
  members: Member[];
  currentUserId: string;
  isAdmin: boolean;
}

export function MemberList({ projectId, members, currentUserId, isAdmin }: MemberListProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<Member | null>(null);
  const [transferTarget, setTransferTarget] = useState<Member | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  async function inviteMember(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
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
      toast({ title: "Ownership transferred", description: `${transferTarget.user.name ?? transferTarget.user.email} is now the owner.` });
      router.refresh();
    } catch {
      toast({ title: "Failed to transfer ownership", variant: "destructive" });
    } finally {
      setActionLoading(false);
      setTransferTarget(null);
    }
  }

  const roleColors: Record<string, "default" | "secondary" | "outline"> = {
    OWNER: "default",
    ADMIN: "secondary",
    MEMBER: "outline",
    VIEWER: "outline",
    RANK1: "default",
  };

  return (
    <>
      <div>
        <h2 className="text-lg font-semibold mb-4">Team Members</h2>
        <div className="space-y-3 mb-6">
          {members.map((member) => (
            <div key={member.id} className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={member.user.image ?? undefined} />
                <AvatarFallback className="text-xs">
                  {member.user.name?.charAt(0).toUpperCase() ?? "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{member.user.name || member.user.email}</p>
                <p className="text-xs text-muted-foreground truncate">{member.user.email}</p>
              </div>
              <Badge variant={roleColors[member.role] || "outline"} className="text-xs">
                {member.role}
              </Badge>
              {isAdmin && member.user.id !== currentUserId && member.role !== "OWNER" && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-yellow-500"
                    onClick={() => setTransferTarget(member)}
                    title="Transfer ownership to this member"
                  >
                    <Crown className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => setRemoveTarget(member)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>

        {isAdmin && (
          <form onSubmit={inviteMember} className="flex gap-2">
            <Input
              placeholder="colleague@punchteam.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className="flex-1"
            />
            <Button type="submit" disabled={loading || !email.trim()}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </form>
        )}
      </div>

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
        description="They will become the new project owner. Your role will change to Member. This can be reversed by the new owner or an admin."
        confirmLabel="Transfer ownership"
        variant="warning"
        loading={actionLoading}
        onConfirm={confirmTransfer}
      />
    </>
  );
}

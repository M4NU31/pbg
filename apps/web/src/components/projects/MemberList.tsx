"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { UserPlus, Trash2 } from "lucide-react";

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

  async function removeMember(userId: string) {
    if (!confirm("Remove this member?")) return;
    try {
      const res = await fetch(`/api/projects/${projectId}/members`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Member removed" });
      router.refresh();
    } catch {
      toast({ title: "Failed to remove member", variant: "destructive" });
    }
  }

  const roleColors: Record<string, "default" | "secondary" | "outline"> = {
    OWNER: "default",
    ADMIN: "secondary",
    MEMBER: "outline",
    VIEWER: "outline",
  };

  return (
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
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive"
                onClick={() => removeMember(member.user.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
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
  );
}

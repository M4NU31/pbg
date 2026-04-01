"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ROLE_LABELS: Record<string, string> = {
  RANK1: "Rank 1 — Admin",
  RANK2: "Rank 2 — Project Manager",
  RANK3: "Rank 3 — Member",
};

const ROLE_BADGE: Record<string, string> = {
  RANK1: "bg-primary/20 text-primary border-0",
  RANK2: "bg-blue-500/20 text-blue-400 border-0",
  RANK3: "bg-zinc-500/20 text-zinc-400 border-0",
};

interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  systemRole: string;
  ownedProjects: string | null;
}

export function UserRoleManager({ users, currentUserId }: { users: User[]; currentUserId: string }) {
  const router = useRouter();
  const [saving, setSaving] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleRoleChange(userId: string, newRole: string) {
    setSaving(userId);
    await fetch("/api/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, newRole }),
    });
    setSaving(null);
    router.refresh();
  }

  async function handleDelete(user: User) {
    const projectWarning = user.ownedProjects
      ? `\n\nThis user owns: ${user.ownedProjects}\nThose projects will lose their owner.`
      : "";
    if (!confirm(`Remove "${user.name ?? user.email}" from the system?${projectWarning}`)) return;
    setDeleting(user.id);
    await fetch("/api/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id }),
    });
    setDeleting(null);
    router.refresh();
  }

  return (
    <div className="space-y-3">
      {users.map((user) => {
        const initials = user.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) ?? "?";
        const isSelf = user.id === currentUserId;
        const busy = saving === user.id || deleting === user.id;

        return (
          <div key={user.id} className="flex items-center gap-4 p-4 rounded-lg border bg-card">
            <Avatar className="h-9 w-9 shrink-0">
              <AvatarImage src={user.image ?? undefined} />
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name ?? "—"}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              {user.ownedProjects && (
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  Owns: {user.ownedProjects}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {isSelf ? (
                <Badge className={ROLE_BADGE[user.systemRole] ?? ""}>
                  {ROLE_LABELS[user.systemRole] ?? user.systemRole}
                </Badge>
              ) : (
                <Select
                  defaultValue={user.systemRole}
                  onValueChange={(val) => handleRoleChange(user.id, val)}
                  disabled={busy}
                >
                  <SelectTrigger className="w-48 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RANK1">Rank 1 — Admin</SelectItem>
                    <SelectItem value="RANK2">Rank 2 — Project Manager</SelectItem>
                    <SelectItem value="RANK3">Rank 3 — Member</SelectItem>
                  </SelectContent>
                </Select>
              )}

              {!isSelf && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(user)}
                  disabled={busy}
                  title="Remove user"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

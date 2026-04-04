"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Trash2, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Admin",
  PROJECT_MANAGER: "Project Manager",
  MEMBER: "Member",
};

const ROLE_BADGE: Record<string, string> = {
  ADMIN: "bg-primary/20 text-primary border-0",
  PROJECT_MANAGER: "bg-blue-500/20 text-blue-400 border-0",
  MEMBER: "bg-zinc-500/20 text-zinc-400 border-0",
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
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
    );
  }, [users, search]);

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

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    await fetch("/api/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: deleteTarget.id }),
    });
    setDeleting(false);
    setDeleteTarget(null);
    router.refresh();
  }

  return (
    <>
      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* User list */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No users found</p>
        )}

        {filtered.map((user) => {
          const isSelf = user.id === currentUserId;
          const busy = saving === user.id;

          return (
            <div key={user.id} className="flex items-center gap-4 p-4 rounded-lg border bg-card">
              <UserAvatar name={user.name} email={user.email} image={user.image} className="h-10 w-10" />

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{user.name ?? "—"}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                {user.ownedProjects && (
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    Owns: {user.ownedProjects}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {isSelf ? (
                  <Badge className={ROLE_BADGE[user.systemRole] ?? ""}>
                    {ROLE_LABELS[user.systemRole] ?? user.systemRole}
                  </Badge>
                ) : (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Role</span>
                    <Select
                      key={user.systemRole}
                      defaultValue={user.systemRole}
                      onValueChange={(val) => handleRoleChange(user.id, val)}
                      disabled={busy}
                    >
                      <SelectTrigger className="w-44 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        <SelectItem value="PROJECT_MANAGER">Project Manager</SelectItem>
                        <SelectItem value="MEMBER">Member</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {!isSelf && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive mt-4"
                    onClick={() => setDeleteTarget(user)}
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

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title={`Remove ${deleteTarget?.name ?? deleteTarget?.email ?? "user"}?`}
        description="This will permanently remove this user and all their memberships. They can sign in again to create a new account."
        detail={
          deleteTarget?.ownedProjects
            ? `⚠️ This user owns the following projects: ${deleteTarget.ownedProjects}. Transfer ownership of those projects first, or they will lose their owner.`
            : undefined
        }
        confirmLabel="Remove user"
        variant="danger"
        loading={deleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}

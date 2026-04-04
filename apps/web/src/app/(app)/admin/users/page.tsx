import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSystemRole } from "@/lib/auth-helpers";
import { query } from "@/lib/db";
import { gravatarUrl } from "@/lib/gravatar";
import { notFound } from "next/navigation";
import { UserRoleManager } from "@/components/admin/UserRoleManager";

/** Normalize legacy role values to the new role system */
const ROLE_MIGRATION: Record<string, string> = {
  RANK1: "ADMIN",
  RANK2: "PROJECT_MANAGER",
  RANK3: "MEMBER",
};

function normalizeRole(role: string | null | undefined): string {
  if (!role) return "MEMBER";
  return ROLE_MIGRATION[role] ?? role;
}

const BOOTSTRAP_ADMIN_EMAIL = "manuel@punchteam.com";

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const systemRole = await getSystemRole(session.user.id, session.user.email);
  if (systemRole !== "ADMIN") notFound();

  const users = await query<Record<string, unknown>>(
    `SELECT u.id, u.name, u.email, u.image, u.systemRole, u.createdAt,
     (SELECT GROUP_CONCAT(p.name ORDER BY p.name SEPARATOR ', ')
      FROM Project p WHERE p.ownerId = u.id AND p.archivedAt IS NULL) as ownedProjects
     FROM User u
     WHERE u.email LIKE '%@punchteam.com'
     ORDER BY u.createdAt DESC`
  );

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Manage Users</h1>
        <p className="text-muted-foreground">Change user roles and access levels.</p>
      </div>
      <UserRoleManager
        users={(users as any[]).map((u) => ({
          ...u,
          image: (u.image as string | null) ?? gravatarUrl(u.email as string),
          // Bootstrap admin is always ADMIN; normalize all legacy RANK values
          systemRole: u.email === BOOTSTRAP_ADMIN_EMAIL
            ? "ADMIN"
            : normalizeRole(u.systemRole as string | null),
        }))}
        currentUserId={session.user.id}
      />
    </div>
  );
}

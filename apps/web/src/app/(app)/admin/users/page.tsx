import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSystemRole } from "@/lib/auth-helpers";
import { query } from "@/lib/db";
import { notFound } from "next/navigation";
import { UserRoleManager } from "@/components/admin/UserRoleManager";

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const systemRole = await getSystemRole(session.user.id, session.user.email);
  if (systemRole !== "RANK1") notFound();

  const users = await query<Record<string, unknown>>(
    `SELECT id, name, email, image, systemRole, createdAt FROM User ORDER BY createdAt DESC`
  );

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Manage Users</h1>
        <p className="text-muted-foreground">Change user roles and access levels.</p>
      </div>
      <UserRoleManager
        users={users as { id: string; name: string | null; email: string; image: string | null; systemRole: string }[]}
        currentUserId={session.user.id}
      />
    </div>
  );
}

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSystemRole } from "@/lib/auth-helpers";
import { query, parseJson } from "@/lib/db";
import { DashboardClient } from "@/components/projects/DashboardClient";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const systemRole = await getSystemRole(session.user.id, session.user.email);
  const isAdmin = systemRole === "ADMIN";
  const canCreateProjects = systemRole === "ADMIN" || systemRole === "PROJECT_MANAGER";

  const rows = await query<Record<string, unknown>>(
    isAdmin
      ? `SELECT 'ADMIN' as role,
         p.id, p.name, p.description, p.siteUrl, p.embedKey, p.allowedDomains, p.ownerId, p.screenshotAt, p.createdAt, p.updatedAt,
         (SELECT COUNT(*) FROM Task WHERE projectId = p.id) as taskCount,
         (SELECT COUNT(*) FROM ProjectMember WHERE projectId = p.id) as memberCount,
         (SELECT COUNT(*) FROM Comment c JOIN Task t ON c.taskId = t.id WHERE t.projectId = p.id) as commentCount,
         u.name as ownerName, u.image as ownerImage
         FROM Project p
         JOIN User u ON p.ownerId = u.id
         WHERE p.archivedAt IS NULL
         ORDER BY p.updatedAt DESC`
      : `SELECT pm.role,
         p.id, p.name, p.description, p.siteUrl, p.embedKey, p.allowedDomains, p.ownerId, p.screenshotAt, p.createdAt, p.updatedAt,
         (SELECT COUNT(*) FROM Task WHERE projectId = p.id) as taskCount,
         (SELECT COUNT(*) FROM ProjectMember WHERE projectId = p.id) as memberCount,
         (SELECT COUNT(*) FROM Comment c JOIN Task t ON c.taskId = t.id WHERE t.projectId = p.id) as commentCount,
         u.name as ownerName, u.image as ownerImage
         FROM ProjectMember pm
         JOIN Project p ON pm.projectId = p.id
         JOIN User u ON p.ownerId = u.id
         WHERE pm.userId = ? AND p.archivedAt IS NULL
         ORDER BY p.updatedAt DESC`,
    isAdmin ? [] : [session.user.id]
  );

  const projects = rows.map((row) => ({
    id: row.id as string,
    name: row.name as string,
    description: (row.description as string | null) ?? null,
    siteUrl: (row.siteUrl as string | null) ?? null,
    embedKey: row.embedKey as string,
    allowedDomains: parseJson(row.allowedDomains),
    ownerId: row.ownerId as string,
    screenshotAt: (row.screenshotAt as Date | null) ?? null,
    createdAt: row.createdAt as Date,
    updatedAt: row.updatedAt as Date,
    _count: {
      tasks: Number(row.taskCount),
      members: Number(row.memberCount),
      comments: Number(row.commentCount),
    },
    owner: { name: row.ownerName as string, image: (row.ownerImage as string | null) ?? null },
    role: row.role as string,
  }));

  return (
    <DashboardClient
      projects={projects}
      canCreateProjects={canCreateProjects}
      systemRole={systemRole}
      currentUserId={session.user.id}
      userName={session.user.name}
    />
  );
}

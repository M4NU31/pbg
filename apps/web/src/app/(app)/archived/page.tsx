import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSystemRole } from "@/lib/auth-helpers";
import { query, parseJson } from "@/lib/db";
import { ArchivedProjectCard } from "@/components/projects/ArchivedProjectCard";

export default async function ArchivedPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const systemRole = await getSystemRole(session.user.id, session.user.email);
  const isRank1 = systemRole === "RANK1";

  const rows = await query<Record<string, unknown>>(
    isRank1
      ? `SELECT p.id, p.name, p.description, p.ownerId, p.archivedAt,
         (SELECT COUNT(*) FROM Task WHERE projectId = p.id) as taskCount,
         u.name as ownerName
         FROM Project p
         JOIN User u ON p.ownerId = u.id
         WHERE p.archivedAt IS NOT NULL
         ORDER BY p.archivedAt DESC`
      : `SELECT p.id, p.name, p.description, p.ownerId, p.archivedAt,
         (SELECT COUNT(*) FROM Task WHERE projectId = p.id) as taskCount,
         u.name as ownerName
         FROM ProjectMember pm
         JOIN Project p ON pm.projectId = p.id
         JOIN User u ON p.ownerId = u.id
         WHERE pm.userId = ? AND p.archivedAt IS NOT NULL
         ORDER BY p.archivedAt DESC`,
    isRank1 ? [] : [session.user.id]
  );

  const projects = rows.map((row) => ({
    id: row.id as string,
    name: row.name as string,
    description: (row.description as string | null) ?? null,
    ownerId: row.ownerId as string,
    archivedAt: row.archivedAt as Date,
    taskCount: Number(row.taskCount),
    ownerName: row.ownerName as string,
  }));

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Archived Projects</h1>
        <p className="text-muted-foreground">Projects that have been archived and are no longer active.</p>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <h2 className="text-xl font-semibold mb-2">No archived projects</h2>
          <p className="text-muted-foreground">Archived projects will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ArchivedProjectCard
              key={project.id}
              project={project}
              systemRole={systemRole}
              currentUserId={session.user.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

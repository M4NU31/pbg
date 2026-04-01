import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query, parseJson } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { Plus } from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const rows = await query<Record<string, unknown>>(
    `SELECT pm.role,
     p.id, p.name, p.description, p.embedKey, p.allowedDomains, p.ownerId, p.createdAt, p.updatedAt,
     (SELECT COUNT(*) FROM Task WHERE projectId = p.id) as taskCount,
     (SELECT COUNT(*) FROM ProjectMember WHERE projectId = p.id) as memberCount,
     u.name as ownerName, u.image as ownerImage
     FROM ProjectMember pm
     JOIN Project p ON pm.projectId = p.id
     JOIN User u ON p.ownerId = u.id
     WHERE pm.userId = ?
     ORDER BY p.updatedAt DESC`,
    [session.user.id]
  );

  const projects = rows.map((row) => ({
    id: row.id as string,
    name: row.name as string,
    description: (row.description as string | null) ?? null,
    embedKey: row.embedKey as string,
    allowedDomains: parseJson(row.allowedDomains),
    ownerId: row.ownerId as string,
    createdAt: row.createdAt as Date,
    updatedAt: row.updatedAt as Date,
    _count: { tasks: Number(row.taskCount), members: Number(row.memberCount) },
    owner: { name: row.ownerName as string, image: (row.ownerImage as string | null) ?? null },
    role: row.role as string,
  }));

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {session.user.name?.split(" ")[0]}
          </p>
        </div>
        <Button asChild>
          <Link href="/projects/new">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Link>
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-6xl mb-4">🐛</div>
          <h2 className="text-xl font-semibold mb-2">No projects yet</h2>
          <p className="text-muted-foreground mb-6">
            Create your first project to start collecting feedback.
          </p>
          <Button asChild>
            <Link href="/projects/new">
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}

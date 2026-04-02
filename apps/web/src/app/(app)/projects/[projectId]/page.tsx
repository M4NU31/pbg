import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { queryOne, query } from "@/lib/db";
import { gravatarUrl } from "@/lib/gravatar";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { KanbanBoard } from "@/components/board/KanbanBoard";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const ADMIN_EMAIL = "manuel@punchteam.com";
  const isAdmin = session.user.email === ADMIN_EMAIL;

  const memberRow = isAdmin
    ? await queryOne<Record<string, unknown>>(
        `SELECT NULL as id, 'ADMIN' as role,
         p.id as p_id, p.name as p_name, p.description as p_description
         FROM Project p WHERE p.id = ?`,
        [projectId]
      )
    : await queryOne<Record<string, unknown>>(
        `SELECT pm.id, pm.role,
         p.id as p_id, p.name as p_name, p.description as p_description
         FROM ProjectMember pm JOIN Project p ON pm.projectId = p.id
         WHERE pm.projectId = ? AND pm.userId = ?`,
        [projectId, session.user.id]
      );

  if (!memberRow) notFound();

  const memberUsers = await query<Record<string, unknown>>(
    `SELECT u.id, u.name, u.email, u.image
     FROM ProjectMember pm JOIN User u ON pm.userId = u.id
     WHERE pm.projectId = ?`,
    [projectId]
  );

  const project = {
    id: memberRow.p_id as string,
    name: memberRow.p_name as string,
    description: (memberRow.p_description as string | null) ?? null,
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-8 py-4 border-b">
        <div>
          <h1 className="text-xl font-bold">{project.name}</h1>
          {project.description && (
            <p className="text-sm text-muted-foreground">{project.description}</p>
          )}
        </div>
      </div>
      <Suspense>
        <KanbanBoard
          projectId={project.id}
          members={memberUsers.map((u) => ({
            id: u.id as string,
            name: (u.name as string | null) ?? null,
            email: u.email as string,
            image: (u.image as string | null) ?? gravatarUrl(u.email as string),
          }))}
          currentUserId={session.user.id}
          currentUserRole={memberRow.role as string}
        />
      </Suspense>
    </div>
  );
}

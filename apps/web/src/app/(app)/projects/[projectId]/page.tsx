import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { KanbanBoard } from "@/components/board/KanbanBoard";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const member = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: { projectId, userId: session.user.id },
    },
    include: { project: { include: { members: { include: { user: true } } } } },
  });

  if (!member) notFound();

  const project = member.project;

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
      <KanbanBoard
        projectId={project.id}
        members={project.members.map((m) => m.user)}
        currentUserId={session.user.id}
        currentUserRole={member.role}
      />
    </div>
  );
}

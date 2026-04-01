import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { EmbedSnippet } from "@/components/projects/EmbedSnippet";
import { MemberList } from "@/components/projects/MemberList";
import { ProjectSettingsForm } from "@/components/projects/ProjectSettingsForm";
import { Separator } from "@/components/ui/separator";

export default async function ProjectSettingsPage({
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
    include: {
      project: {
        include: {
          members: {
            include: { user: { select: { id: true, name: true, email: true, image: true } } },
          },
        },
      },
    },
  });

  if (!member) notFound();

  const project = member.project;
  const isAdmin = member.role === "OWNER" || member.role === "ADMIN";

  const embedUrl = `${process.env.NEXT_PUBLIC_APP_URL}/embed/punchbug.js`;

  return (
    <div className="p-8 max-w-2xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold">Project Settings</h1>
        <p className="text-muted-foreground">Manage {project.name}</p>
      </div>

      <Separator />

      <EmbedSnippet embedKey={project.embedKey} embedUrl={embedUrl} />

      <Separator />

      {isAdmin && (
        <>
          <ProjectSettingsForm project={project} />
          <Separator />
        </>
      )}

      <MemberList
        projectId={project.id}
        members={project.members}
        currentUserId={session.user.id}
        isAdmin={isAdmin}
      />
    </div>
  );
}

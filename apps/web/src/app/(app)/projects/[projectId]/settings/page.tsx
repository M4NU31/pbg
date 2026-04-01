import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { queryOne, query, parseJson } from "@/lib/db";
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

  const memberRow = await queryOne<Record<string, unknown>>(
    `SELECT pm.id, pm.role,
     p.id as p_id, p.name as p_name, p.description as p_description,
     p.embedKey as p_embedKey, p.allowedDomains as p_allowedDomains
     FROM ProjectMember pm JOIN Project p ON pm.projectId = p.id
     WHERE pm.projectId = ? AND pm.userId = ?`,
    [projectId, session.user.id]
  );

  if (!memberRow) notFound();

  const memberRows = await query<Record<string, unknown>>(
    `SELECT pm.id, pm.projectId, pm.userId, pm.role, pm.joinedAt,
     u.id as u_id, u.name as u_name, u.email as u_email, u.image as u_image
     FROM ProjectMember pm JOIN User u ON pm.userId = u.id
     WHERE pm.projectId = ?
     ORDER BY pm.joinedAt ASC`,
    [projectId]
  );

  const project = {
    id: memberRow.p_id as string,
    name: memberRow.p_name as string,
    description: (memberRow.p_description as string | null) ?? null,
    embedKey: memberRow.p_embedKey as string,
    allowedDomains: parseJson(memberRow.p_allowedDomains),
    members: memberRows.map((row) => ({
      id: row.id as string,
      projectId: row.projectId as string,
      userId: row.userId as string,
      role: row.role as string,
      joinedAt: row.joinedAt as Date,
      user: {
        id: row.u_id as string,
        name: (row.u_name as string | null) ?? null,
        email: row.u_email as string,
        image: (row.u_image as string | null) ?? null,
      },
    })),
  };

  const isAdmin = memberRow.role === "OWNER" || memberRow.role === "ADMIN";
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

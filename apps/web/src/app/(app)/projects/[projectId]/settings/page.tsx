import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { queryOne } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { EmbedSnippet } from "@/components/projects/EmbedSnippet";
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

  const ADMIN_EMAIL = "manuel@punchteam.com";
  const isSuperAdmin = session.user.email === ADMIN_EMAIL;

  const memberRow = isSuperAdmin
    ? await queryOne<Record<string, unknown>>(
        `SELECT NULL as id, 'ADMIN' as role,
         p.id as p_id, p.name as p_name, p.description as p_description,
         p.embedKey as p_embedKey, p.siteUrl as p_siteUrl
         FROM Project p WHERE p.id = ?`,
        [projectId]
      )
    : await queryOne<Record<string, unknown>>(
        `SELECT pm.id, pm.role,
         p.id as p_id, p.name as p_name, p.description as p_description,
         p.embedKey as p_embedKey, p.siteUrl as p_siteUrl
         FROM ProjectMember pm JOIN Project p ON pm.projectId = p.id
         WHERE pm.projectId = ? AND pm.userId = ?`,
        [projectId, session.user.id]
      );

  if (!memberRow) notFound();

  // Redirect clients
  const isClientEmail = !session.user.email?.endsWith("@punchteam.com");
  if (isClientEmail || (memberRow.role as string) === "CLIENT") redirect(`/projects/${projectId}`);

  const project = {
    id: memberRow.p_id as string,
    name: memberRow.p_name as string,
    description: (memberRow.p_description as string | null) ?? null,
    embedKey: memberRow.p_embedKey as string,
    siteUrl: (memberRow.p_siteUrl as string | null) ?? null,
  };

  const isAdmin = memberRow.role === "ADMIN" || memberRow.role === "PROJECT_MANAGER";
  const embedUrl = `${process.env.NEXT_PUBLIC_APP_URL}/embed/punchbug.js`;

  return (
    <div className="p-8 max-w-2xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold">Project Settings</h1>
        <p className="text-muted-foreground">Manage {project.name}</p>
      </div>

      <Separator />

      <EmbedSnippet embedKey={project.embedKey} embedUrl={embedUrl} />

      {isAdmin && (
        <>
          <Separator />
          <ProjectSettingsForm project={project} />
        </>
      )}
    </div>
  );
}

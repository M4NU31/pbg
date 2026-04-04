import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { queryOne, query } from "@/lib/db";
import { gravatarUrl } from "@/lib/gravatar";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { ProjectTabs } from "@/components/board/ProjectTabs";

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
         p.id as p_id, p.name as p_name, p.description as p_description, p.ownerId as p_ownerId
         FROM Project p WHERE p.id = ?`,
        [projectId]
      )
    : await queryOne<Record<string, unknown>>(
        `SELECT pm.id, pm.role,
         p.id as p_id, p.name as p_name, p.description as p_description, p.ownerId as p_ownerId
         FROM ProjectMember pm JOIN Project p ON pm.projectId = p.id
         WHERE pm.projectId = ? AND pm.userId = ?`,
        [projectId, session.user.id]
      );

  if (!memberRow) notFound();

  const memberRows = await query<Record<string, unknown>>(
    `SELECT pm.id, pm.role, u.id as u_id, u.name as u_name, u.email as u_email, u.image as u_image, u.systemRole as u_systemRole
     FROM ProjectMember pm JOIN User u ON pm.userId = u.id
     WHERE pm.projectId = ?
     ORDER BY pm.joinedAt ASC`,
    [projectId]
  );

  const project = {
    id: memberRow.p_id as string,
    name: memberRow.p_name as string,
    description: (memberRow.p_description as string | null) ?? null,
    ownerId: memberRow.p_ownerId as string,
  };

  // All project members (internal + clients) — used for assignee picker and @mentions
  const members = memberRows.map((u) => ({
    id: u.u_id as string,
    name: (u.u_name as string | null) ?? null,
    email: u.u_email as string,
    image: (u.u_image as string | null) ?? gravatarUrl(u.u_email as string),
  }));

  const ROLE_NORM: Record<string, string> = {
    RANK1: "ADMIN", RANK2: "PROJECT_MANAGER", RANK3: "MEMBER", OWNER: "PROJECT_MANAGER",
  };
  const BOOTSTRAP_ADMIN = "manuel@punchteam.com";

  const allMembers = memberRows.map((row) => {
    const email = row.u_email as string;
    let effectiveRole: string;
    if (!email.endsWith("@punchteam.com")) {
      effectiveRole = "CLIENT";
    } else if (email === BOOTSTRAP_ADMIN) {
      effectiveRole = "ADMIN";
    } else {
      const raw = row.u_systemRole as string | null;
      effectiveRole = raw ? (ROLE_NORM[raw] ?? raw) : "MEMBER";
    }
    return {
      id: row.id as string,
      role: effectiveRole,
      user: {
        id: row.u_id as string,
        name: (row.u_name as string | null) ?? null,
        email,
        image: (row.u_image as string | null) ?? gravatarUrl(email),
      },
    };
  });

  return (
    <div className="flex flex-col h-full">
      <Suspense>
        <ProjectTabs
          projectId={project.id}
          projectName={project.name}
          projectDescription={project.description}
          projectOwnerId={project.ownerId}
          members={members}
          allMembers={allMembers}
          currentUserId={session.user.id}
          currentUserRole={memberRow.role as string}
        />
      </Suspense>
    </div>
  );
}

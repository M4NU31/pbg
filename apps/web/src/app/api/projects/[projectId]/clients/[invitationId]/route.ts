import { NextRequest, NextResponse } from "next/server";
import { queryOne, execute } from "@/lib/db";
import { requireAuth, requireProjectAccess, canManageProject } from "@/lib/auth-helpers";

type Params = { params: Promise<{ projectId: string; invitationId: string }> };

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { projectId, invitationId } = await params;
  const { error, session } = await requireAuth();
  if (error) return error;

  const { error: accessError, member } = await requireProjectAccess(session!.user.id, projectId);
  if (accessError) return accessError;

  if (!canManageProject(member!.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Try ClientInvitation.id first
  const inv = await queryOne<{ email: string }>(
    `SELECT email FROM ClientInvitation WHERE id = ? AND projectId = ?`,
    [invitationId, projectId]
  );

  let email: string;

  if (inv) {
    email = inv.email;
    await execute(`DELETE FROM ClientInvitation WHERE id = ?`, [invitationId]);
  } else {
    // Fall back: treat the id as a ProjectMember.id (joined client with no invitation record)
    const pm = await queryOne<{ email: string }>(
      `SELECT u.email FROM ProjectMember pm
       JOIN User u ON pm.userId = u.id
       WHERE pm.id = ? AND pm.projectId = ?`,
      [invitationId, projectId]
    );
    if (!pm) return NextResponse.json({ error: "Not found" }, { status: 404 });
    email = pm.email;
    // Also clean up any invitation record for this email if one exists
    await execute(
      `DELETE FROM ClientInvitation WHERE projectId = ? AND LOWER(email) = LOWER(?)`,
      [projectId, email]
    );
  }

  // Remove the project membership
  await execute(
    `DELETE pm FROM ProjectMember pm
     JOIN User u ON pm.userId = u.id
     WHERE pm.projectId = ? AND LOWER(u.email) = LOWER(?)`,
    [projectId, email]
  );

  return new NextResponse(null, { status: 204 });
}

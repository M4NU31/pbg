import { NextRequest, NextResponse } from "next/server";
import { queryOne, execute } from "@/lib/db";
import { requireAuth, requireProjectAccess, getSystemRole } from "@/lib/auth-helpers";

type Params = { params: Promise<{ projectId: string; invitationId: string }> };

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { projectId, invitationId } = await params;
  const { error, session } = await requireAuth();
  if (error) return error;

  const { error: accessError, member } = await requireProjectAccess(session!.user.id, projectId);
  if (accessError) return accessError;

  const role = member!.role;
  let allowed = role === "OWNER" || role === "ADMIN" || role === "RANK1";
  if (!allowed) {
    const systemRole = await getSystemRole(session!.user.id, session!.user.email);
    allowed = systemRole === "RANK2";
  }
  if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const inv = await queryOne<{ email: string }>(
    `SELECT email FROM ClientInvitation WHERE id = ? AND projectId = ?`,
    [invitationId, projectId]
  );
  if (!inv) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Remove the invitation
  await execute(`DELETE FROM ClientInvitation WHERE id = ?`, [invitationId]);

  // Also remove their CLIENT membership if they have one
  await execute(
    `DELETE pm FROM ProjectMember pm
     JOIN User u ON pm.userId = u.id
     WHERE pm.projectId = ? AND pm.role = 'CLIENT' AND u.email = ?`,
    [projectId, inv.email]
  );

  return new NextResponse(null, { status: 204 });
}

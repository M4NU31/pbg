import { NextRequest, NextResponse } from "next/server";
import { queryOne } from "@/lib/db";
import { requireAuth, requireProjectAccess, canManageProject } from "@/lib/auth-helpers";
import { sendClientInvite } from "@/lib/send-invite";

type Params = { params: Promise<{ projectId: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { projectId } = await params;
  const { error, session } = await requireAuth();
  if (error) return error;

  const { error: accessError, member } = await requireProjectAccess(session!.user.id, projectId);
  if (accessError) return accessError;
  if (!canManageProject(member!.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  // Verify the client is actually invited to this project
  const invitation = await queryOne<{ id: string }>(
    `SELECT id FROM ClientInvitation WHERE projectId = ? AND LOWER(email) = LOWER(?)`,
    [projectId, email]
  );
  if (!invitation) return NextResponse.json({ error: "Client not found" }, { status: 404 });

  const project = await queryOne<{ name: string }>(`SELECT name FROM Project WHERE id = ?`, [projectId]);

  await sendClientInvite(
    email.toLowerCase(),
    project?.name ?? "a project",
    session!.user.name || session!.user.email || "Your project manager",
  );

  return NextResponse.json({ ok: true });
}

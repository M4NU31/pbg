import { NextRequest, NextResponse } from "next/server";
import { query, queryOne, execute } from "@/lib/db";
import { requireAuth, requireProjectAccess } from "@/lib/auth-helpers";
import { randomUUID } from "crypto";

type Params = { params: Promise<{ projectId: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { projectId } = await params;
  const { error, session } = await requireAuth();
  if (error) return error;

  const { error: accessError } = await requireProjectAccess(
    session!.user.id,
    projectId
  );
  if (accessError) return accessError;

  const rows = await query<Record<string, unknown>>(
    `SELECT pm.*, u.id as u_id, u.name as u_name, u.email as u_email, u.image as u_image
     FROM ProjectMember pm JOIN User u ON pm.userId = u.id
     WHERE pm.projectId = ?
     ORDER BY pm.joinedAt ASC`,
    [projectId]
  );

  return NextResponse.json(
    rows.map((row) => ({
      id: row.id, projectId: row.projectId, userId: row.userId, role: row.role, joinedAt: row.joinedAt,
      user: { id: row.u_id, name: row.u_name, email: row.u_email, image: row.u_image },
    }))
  );
}

export async function POST(req: NextRequest, { params }: Params) {
  const { projectId } = await params;
  const { error, session } = await requireAuth();
  if (error) return error;

  const { error: accessError, member } = await requireProjectAccess(
    session!.user.id,
    projectId
  );
  if (accessError) return accessError;

  if (member!.role !== "OWNER" && member!.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { email, role = "MEMBER" } = body;

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const userToInvite = await queryOne<Record<string, unknown>>(
    `SELECT id, name, email, image FROM User WHERE email = ?`,
    [email]
  );
  if (!userToInvite) {
    return NextResponse.json({ error: "User not found. They must sign in first." }, { status: 404 });
  }

  const existing = await queryOne(
    `SELECT id FROM ProjectMember WHERE projectId = ? AND userId = ?`,
    [projectId, userToInvite.id]
  );
  if (existing) {
    return NextResponse.json({ error: "User is already a member" }, { status: 409 });
  }

  const memberId = randomUUID();
  await execute(
    `INSERT INTO ProjectMember (id, projectId, userId, role, joinedAt) VALUES (?, ?, ?, ?, NOW())`,
    [memberId, projectId, userToInvite.id, role]
  );

  const row = await queryOne<Record<string, unknown>>(
    `SELECT pm.*, u.id as u_id, u.name as u_name, u.email as u_email, u.image as u_image
     FROM ProjectMember pm JOIN User u ON pm.userId = u.id
     WHERE pm.id = ?`,
    [memberId]
  );

  return NextResponse.json(
    {
      id: row!.id, projectId: row!.projectId, userId: row!.userId, role: row!.role, joinedAt: row!.joinedAt,
      user: { id: row!.u_id, name: row!.u_name, email: row!.u_email, image: row!.u_image },
    },
    { status: 201 }
  );
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { projectId } = await params;
  const { error, session } = await requireAuth();
  if (error) return error;

  const { error: accessError, member } = await requireProjectAccess(
    session!.user.id,
    projectId
  );
  if (accessError) return accessError;

  if (member!.role !== "OWNER" && member!.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId } = await req.json();

  const targetMember = await queryOne<Record<string, unknown>>(
    `SELECT id, role FROM ProjectMember WHERE projectId = ? AND userId = ?`,
    [projectId, userId]
  );

  if (!targetMember) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  if (targetMember.role === "OWNER") {
    return NextResponse.json({ error: "Cannot remove project owner" }, { status: 400 });
  }

  await execute(`DELETE FROM ProjectMember WHERE projectId = ? AND userId = ?`, [projectId, userId]);
  return new NextResponse(null, { status: 204 });
}

import { NextRequest, NextResponse } from "next/server";
import { query, queryOne, execute } from "@/lib/db";
import { requireAuth, requireProjectAccess, canManageProject } from "@/lib/auth-helpers";
import { randomUUID } from "crypto";

type Params = { params: Promise<{ projectId: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { projectId } = await params;
  const { error, session } = await requireAuth();
  if (error) return error;

  const { error: accessError, member } = await requireProjectAccess(session!.user.id, projectId);
  if (accessError) return accessError;

  if (!canManageProject(member!.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const rows = await query<Record<string, unknown>>(
    `SELECT ci.id, ci.email, ci.createdAt, u.name as inviterName
     FROM ClientInvitation ci
     LEFT JOIN User u ON ci.invitedById = u.id
     WHERE ci.projectId = ?
     ORDER BY ci.createdAt DESC`,
    [projectId]
  );

  // Also return which emails have already joined (have a CLIENT member row)
  const joined = await query<{ email: string }>(
    `SELECT u.email FROM ProjectMember pm JOIN User u ON pm.userId = u.id
     WHERE pm.projectId = ? AND pm.role = 'CLIENT'`,
    [projectId]
  );
  const joinedEmails = new Set(joined.map((r) => r.email));

  return NextResponse.json(
    rows.map((r) => ({
      id: r.id,
      email: r.email,
      inviterName: r.inviterName,
      createdAt: r.createdAt,
      joined: joinedEmails.has(r.email as string),
    }))
  );
}

export async function POST(req: NextRequest, { params }: Params) {
  const { projectId } = await params;
  const { error, session } = await requireAuth();
  if (error) return error;

  const { error: accessError, member } = await requireProjectAccess(session!.user.id, projectId);
  if (accessError) return accessError;

  if (!canManageProject(member!.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { email } = await req.json();
  if (!email?.trim() || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Don't invite internal domain users as clients
  if (normalizedEmail.endsWith("@punchteam.com")) {
    return NextResponse.json({ error: "Internal team members are added via the Members section" }, { status: 400 });
  }

  const existing = await queryOne(
    `SELECT id FROM ClientInvitation WHERE projectId = ? AND email = ?`,
    [projectId, normalizedEmail]
  );
  if (existing) return NextResponse.json({ error: "This email is already invited" }, { status: 409 });

  const id = randomUUID();
  await execute(
    `INSERT INTO ClientInvitation (id, projectId, email, invitedById, createdAt) VALUES (?, ?, ?, ?, NOW())`,
    [id, projectId, normalizedEmail, session!.user.id]
  );

  // If user already exists in the system, auto-provision their membership
  const existingUser = await queryOne<{ id: string }>(
    `SELECT id FROM User WHERE email = ?`,
    [normalizedEmail]
  );
  if (existingUser) {
    const memberExists = await queryOne(
      `SELECT id FROM ProjectMember WHERE projectId = ? AND userId = ?`,
      [projectId, existingUser.id]
    );
    if (!memberExists) {
      await execute(
        `INSERT INTO ProjectMember (id, projectId, userId, role, joinedAt) VALUES (?, ?, ?, 'CLIENT', NOW())`,
        [randomUUID(), projectId, existingUser.id]
      );
    }
  }

  return NextResponse.json({ id, email: normalizedEmail, joined: !!existingUser }, { status: 201 });
}

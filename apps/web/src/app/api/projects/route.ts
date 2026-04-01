import { NextRequest, NextResponse } from "next/server";
import { query, queryOne, withTransaction, connExecute, parseJson } from "@/lib/db";
import { requireAuth, getSystemRole } from "@/lib/auth-helpers";
import { generateEmbedKey } from "@/lib/utils";
import { randomUUID } from "crypto";

export async function GET() {
  const { error, session } = await requireAuth();
  if (error) return error;

  const rows = await query<Record<string, unknown>>(
    `SELECT pm.role,
     p.id, p.name, p.description, p.embedKey, p.allowedDomains, p.ownerId, p.createdAt, p.updatedAt,
     (SELECT COUNT(*) FROM Task WHERE projectId = p.id) as taskCount,
     (SELECT COUNT(*) FROM ProjectMember WHERE projectId = p.id) as memberCount,
     u.name as ownerName, u.image as ownerImage
     FROM ProjectMember pm
     JOIN Project p ON pm.projectId = p.id
     JOIN User u ON p.ownerId = u.id
     WHERE pm.userId = ?
     ORDER BY p.updatedAt DESC`,
    [session!.user.id]
  );

  return NextResponse.json(
    rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      embedKey: row.embedKey,
      allowedDomains: parseJson(row.allowedDomains),
      ownerId: row.ownerId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      _count: { tasks: Number(row.taskCount), members: Number(row.memberCount) },
      owner: { name: row.ownerName, image: row.ownerImage },
      role: row.role,
    }))
  );
}

export async function POST(req: NextRequest) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const systemRole = await getSystemRole(session!.user.id, session!.user.email);
  if (systemRole === "RANK3") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { name, description } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "Project name is required" }, { status: 400 });
  }

  const projectId = randomUUID();
  const memberId = randomUUID();
  const embedKey = generateEmbedKey();
  const userId = session!.user.id;

  await withTransaction(async (conn) => {
    await connExecute(
      conn,
      `INSERT INTO Project (id, name, description, embedKey, allowedDomains, ownerId, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, '[]', ?, NOW(), NOW())`,
      [projectId, name.trim(), description?.trim() || null, embedKey, userId]
    );
    await connExecute(
      conn,
      `INSERT INTO ProjectMember (id, projectId, userId, role, joinedAt) VALUES (?, ?, ?, 'OWNER', NOW())`,
      [memberId, projectId, userId]
    );
  });

  const project = await queryOne<Record<string, unknown>>(
    `SELECT * FROM Project WHERE id = ?`,
    [projectId]
  );

  return NextResponse.json(
    { ...project, allowedDomains: parseJson(project!.allowedDomains) },
    { status: 201 }
  );
}

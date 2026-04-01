import { NextRequest, NextResponse } from "next/server";
import { execute, queryOne } from "@/lib/db";
import { requireAuth, requireProjectAccess } from "@/lib/auth-helpers";

type Params = { params: Promise<{ projectId: string; columnId: string }> };

async function guardOwner(session: NonNullable<any>, projectId: string) {
  const { error, member } = await requireProjectAccess(session.user.id, projectId);
  if (error) return error;
  if (member!.role !== "OWNER" && member!.role !== "ADMIN" && member!.role !== "RANK1") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { projectId, columnId } = await params;
  const { error, session } = await requireAuth();
  if (error) return error;
  const forbidden = await guardOwner(session!, projectId);
  if (forbidden) return forbidden;

  const { name } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });

  await execute(`UPDATE BoardColumn SET name = ? WHERE id = ? AND projectId = ?`, [name.trim(), columnId, projectId]);
  const col = await queryOne(`SELECT * FROM BoardColumn WHERE id = ?`, [columnId]);
  return NextResponse.json(col);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { projectId, columnId } = await params;
  const { error, session } = await requireAuth();
  if (error) return error;
  const forbidden = await guardOwner(session!, projectId);
  if (forbidden) return forbidden;

  // Move tasks in this column to the first other column
  const firstOther = await queryOne<{ id: string }>(
    `SELECT id FROM BoardColumn WHERE projectId = ? AND id != ? ORDER BY position ASC LIMIT 1`,
    [projectId, columnId]
  );
  if (firstOther) {
    await execute(`UPDATE Task SET columnId = ? WHERE columnId = ?`, [firstOther.id, columnId]);
  } else {
    await execute(`UPDATE Task SET columnId = NULL WHERE columnId = ?`, [columnId]);
  }

  await execute(`DELETE FROM BoardColumn WHERE id = ? AND projectId = ?`, [columnId, projectId]);
  return new NextResponse(null, { status: 204 });
}

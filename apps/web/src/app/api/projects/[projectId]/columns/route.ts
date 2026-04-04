import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/lib/db";
import { requireAuth, requireProjectAccess } from "@/lib/auth-helpers";
import { randomUUID } from "crypto";

type Params = { params: Promise<{ projectId: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { projectId } = await params;
  const { error, session } = await requireAuth();
  if (error) return error;
  const { error: ae } = await requireProjectAccess(session!.user.id, projectId);
  if (ae) return ae;

  const cols = await query<Record<string, unknown>>(
    `SELECT id, projectId, name, position, createdAt FROM BoardColumn WHERE projectId = ? ORDER BY position ASC`,
    [projectId]
  );
  return NextResponse.json(cols);
}

export async function POST(req: NextRequest, { params }: Params) {
  const { projectId } = await params;
  const { error, session } = await requireAuth();
  if (error) return error;
  const { error: ae, member } = await requireProjectAccess(session!.user.id, projectId);
  if (ae) return ae;
  if (member!.role !== "ADMIN" && member!.role !== "PROJECT_MANAGER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { name } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });

  const [maxRow] = await query<{ maxPos: number }>(
    `SELECT COALESCE(MAX(position), -1) as maxPos FROM BoardColumn WHERE projectId = ?`,
    [projectId]
  );

  const id = randomUUID();
  await execute(
    `INSERT INTO BoardColumn (id, projectId, name, position, createdAt) VALUES (?, ?, ?, ?, NOW())`,
    [id, projectId, name.trim(), (maxRow.maxPos ?? -1) + 1]
  );
  return NextResponse.json({ id, projectId, name: name.trim(), position: (maxRow.maxPos ?? -1) + 1 }, { status: 201 });
}

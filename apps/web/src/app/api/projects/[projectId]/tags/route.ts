import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/lib/db";
import { requireAuth, requireProjectAccess } from "@/lib/auth-helpers";
import { randomUUID } from "crypto";

type Params = { params: Promise<{ projectId: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { projectId } = await params;
  const { error, session } = await requireAuth();
  if (error) return error;

  const { error: accessError } = await requireProjectAccess(session!.user.id, projectId);
  if (accessError) return accessError;

  try {
    const tags = await query<{ id: string; name: string; color: string }>(
      `SELECT id, name, color FROM Tag WHERE projectId = ? ORDER BY name ASC`,
      [projectId]
    );
    return NextResponse.json(tags);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  const { projectId } = await params;
  const { error, session } = await requireAuth();
  if (error) return error;

  const { error: accessError, member } = await requireProjectAccess(session!.user.id, projectId);
  if (accessError) return accessError;

  if (member!.role === "CLIENT" || member!.role === "VIEWER") {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  const { name, color } = await req.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const id = randomUUID();
  await execute(
    `INSERT INTO Tag (id, projectId, name, color, createdAt) VALUES (?, ?, ?, ?, NOW())`,
    [id, projectId, name.trim(), color || "#6366f1"]
  );

  return NextResponse.json({ id, name: name.trim(), color: color || "#6366f1" }, { status: 201 });
}

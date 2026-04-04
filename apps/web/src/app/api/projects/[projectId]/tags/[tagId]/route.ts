import { NextRequest, NextResponse } from "next/server";
import { execute } from "@/lib/db";
import { requireAuth, requireProjectAccess } from "@/lib/auth-helpers";

type Params = { params: Promise<{ projectId: string; tagId: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const { projectId, tagId } = await params;
  const { error, session } = await requireAuth();
  if (error) return error;

  const { error: accessError, member } = await requireProjectAccess(session!.user.id, projectId);
  if (accessError) return accessError;

  if (member!.role === "CLIENT" || member!.role === "VIEWER") {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  const { name, color } = await req.json();
  const setParts: string[] = [];
  const vals: unknown[] = [];

  if (name !== undefined) { setParts.push("name = ?"); vals.push(name.trim()); }
  if (color !== undefined) { setParts.push("color = ?"); vals.push(color); }

  if (!setParts.length) return NextResponse.json({ error: "Nothing to update" }, { status: 400 });

  vals.push(tagId, projectId);
  await execute(`UPDATE Tag SET ${setParts.join(", ")} WHERE id = ? AND projectId = ?`, vals);

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { projectId, tagId } = await params;
  const { error, session } = await requireAuth();
  if (error) return error;

  const { error: accessError, member } = await requireProjectAccess(session!.user.id, projectId);
  if (accessError) return accessError;

  if (member!.role === "CLIENT" || member!.role === "VIEWER") {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  // TaskTag rows removed via CASCADE
  await execute(`DELETE FROM Tag WHERE id = ? AND projectId = ?`, [tagId, projectId]);
  return new NextResponse(null, { status: 204 });
}

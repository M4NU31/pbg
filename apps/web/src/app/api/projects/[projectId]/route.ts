import { NextRequest, NextResponse } from "next/server";
import { execute, queryOne, parseJson } from "@/lib/db";
import { requireAuth, requireProjectAccess } from "@/lib/auth-helpers";

type Params = { params: Promise<{ projectId: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { projectId } = await params;
  const { error, session } = await requireAuth();
  if (error) return error;

  const { error: accessError, member } = await requireProjectAccess(
    session!.user.id,
    projectId
  );
  if (accessError) return accessError;

  return NextResponse.json(member!.project);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { projectId } = await params;
  const { error, session } = await requireAuth();
  if (error) return error;

  const { error: accessError, member } = await requireProjectAccess(
    session!.user.id,
    projectId
  );
  if (accessError) return accessError;

  if (member!.role === "MEMBER" || member!.role === "VIEWER" || member!.role === "RANK3") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { name, description, allowedDomains } = body;

  const setParts: string[] = [];
  const vals: unknown[] = [];

  if (name) { setParts.push("name = ?"); vals.push(name.trim()); }
  if (description !== undefined) { setParts.push("description = ?"); vals.push(description?.trim() || null); }
  if (allowedDomains !== undefined) { setParts.push("allowedDomains = ?"); vals.push(JSON.stringify(allowedDomains)); }
  setParts.push("updatedAt = NOW()");
  vals.push(projectId);

  await execute(`UPDATE Project SET ${setParts.join(", ")} WHERE id = ?`, vals);

  const project = await queryOne<Record<string, unknown>>(
    `SELECT * FROM Project WHERE id = ?`,
    [projectId]
  );

  return NextResponse.json({ ...project, allowedDomains: parseJson(project!.allowedDomains) });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { projectId } = await params;
  const { error, session } = await requireAuth();
  if (error) return error;

  const { error: accessError, member } = await requireProjectAccess(
    session!.user.id,
    projectId
  );
  if (accessError) return accessError;

  if (member!.role !== "OWNER" && member!.role !== "RANK1") {
    return NextResponse.json({ error: "Only the owner can delete a project" }, { status: 403 });
  }

  await execute(`DELETE FROM Project WHERE id = ?`, [projectId]);
  return new NextResponse(null, { status: 204 });
}

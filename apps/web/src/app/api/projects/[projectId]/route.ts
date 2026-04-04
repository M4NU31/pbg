import { NextRequest, NextResponse } from "next/server";
import { execute, queryOne, parseJson } from "@/lib/db";
import { requireAuth, requireProjectAccess, canManageProject } from "@/lib/auth-helpers";
import { deleteScreenshot } from "@/lib/screenshot";

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

  if (!canManageProject(member!.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { name, description, siteUrl, allowedDomains } = body;

  const setParts: string[] = [];
  const vals: unknown[] = [];

  if (name) { setParts.push("name = ?"); vals.push(name.trim()); }
  if (description !== undefined) { setParts.push("description = ?"); vals.push(description?.trim() || null); }
  if (siteUrl !== undefined) { setParts.push("siteUrl = ?"); vals.push(siteUrl?.trim() || null); }
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

  // Only system Admin can delete projects — Project Managers cannot
  if (member!.role !== "ADMIN") {
    return NextResponse.json({ error: "Only an Admin can delete projects" }, { status: 403 });
  }

  await execute(`DELETE FROM Project WHERE id = ?`, [projectId]);
  await deleteScreenshot(projectId);
  return new NextResponse(null, { status: 204 });
}

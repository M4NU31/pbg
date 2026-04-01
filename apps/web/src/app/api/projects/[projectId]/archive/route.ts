import { NextRequest, NextResponse } from "next/server";
import { execute, queryOne } from "@/lib/db";
import { requireAuth, getSystemRole } from "@/lib/auth-helpers";

type Params = { params: Promise<{ projectId: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  const { projectId } = await params;
  const { error, session } = await requireAuth();
  if (error) return error;

  const systemRole = await getSystemRole(session!.user.id, session!.user.email);

  if (systemRole === "RANK3") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (systemRole === "RANK2") {
    const project = await queryOne<{ ownerId: string }>(
      `SELECT ownerId FROM Project WHERE id = ?`,
      [projectId]
    );
    if (!project || project.ownerId !== session!.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  await execute(`UPDATE Project SET archivedAt = NOW() WHERE id = ?`, [projectId]);
  return new NextResponse(null, { status: 204 });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { projectId } = await params;
  const { error, session } = await requireAuth();
  if (error) return error;

  const systemRole = await getSystemRole(session!.user.id, session!.user.email);

  if (systemRole === "RANK3") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (systemRole === "RANK2") {
    const project = await queryOne<{ ownerId: string }>(
      `SELECT ownerId FROM Project WHERE id = ?`,
      [projectId]
    );
    if (!project || project.ownerId !== session!.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  await execute(`UPDATE Project SET archivedAt = NULL WHERE id = ?`, [projectId]);
  return new NextResponse(null, { status: 204 });
}

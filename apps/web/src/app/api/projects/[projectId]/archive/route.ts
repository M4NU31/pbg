import { NextRequest, NextResponse } from "next/server";
import { execute, queryOne } from "@/lib/db";
import { requireAuth, requireProjectAccess } from "@/lib/auth-helpers";

type Params = { params: Promise<{ projectId: string }> };

async function guardArchive(userId: string, projectId: string) {
  const { error, member } = await requireProjectAccess(userId, projectId);
  if (error) return { error, member: null };

  if (member!.role === "MEMBER" || member!.role === "CLIENT") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }), member: null };
  }

  // Project Manager can only archive projects they own
  if (member!.role === "PROJECT_MANAGER") {
    const project = await queryOne<{ ownerId: string }>(
      `SELECT ownerId FROM Project WHERE id = ?`,
      [projectId]
    );
    if (!project || project.ownerId !== userId) {
      return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }), member: null };
    }
  }

  return { error: null, member };
}

export async function POST(_req: NextRequest, { params }: Params) {
  const { projectId } = await params;
  const { error, session } = await requireAuth();
  if (error) return error;

  const { error: guardError } = await guardArchive(session!.user.id, projectId);
  if (guardError) return guardError;

  await execute(`UPDATE Project SET archivedAt = NOW() WHERE id = ?`, [projectId]);
  return new NextResponse(null, { status: 204 });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { projectId } = await params;
  const { error, session } = await requireAuth();
  if (error) return error;

  const { error: guardError } = await guardArchive(session!.user.id, projectId);
  if (guardError) return guardError;

  await execute(`UPDATE Project SET archivedAt = NULL WHERE id = ?`, [projectId]);
  return new NextResponse(null, { status: 204 });
}

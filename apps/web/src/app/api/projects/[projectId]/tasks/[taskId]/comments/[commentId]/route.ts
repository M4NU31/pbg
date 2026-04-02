import { NextRequest, NextResponse } from "next/server";
import { execute, queryOne } from "@/lib/db";
import { requireAuth, requireProjectAccess } from "@/lib/auth-helpers";

type Params = { params: Promise<{ projectId: string; taskId: string; commentId: string }> };

async function guardComment(
  userId: string,
  projectId: string,
  commentId: string
) {
  const comment = await queryOne<{ id: string; authorId: string | null }>(
    `SELECT id, authorId FROM Comment WHERE id = ?`,
    [commentId]
  );
  if (!comment) return { error: NextResponse.json({ error: "Not found" }, { status: 404 }), comment: null };

  const { error: accessError, member } = await requireProjectAccess(userId, projectId);
  if (accessError) return { error: accessError, comment: null };

  const isAuthor = comment.authorId === userId;
  const canManage = isAuthor || member!.role === "OWNER" || member!.role === "ADMIN" || member!.role === "RANK1";
  if (!canManage) return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }), comment: null };

  return { error: null, comment };
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { projectId, taskId, commentId } = await params;
  const { error: authError, session } = await requireAuth();
  if (authError) return authError;

  const { error, comment } = await guardComment(session!.user.id, projectId, commentId);
  if (error) return error;

  const { body } = await req.json();
  if (!body?.trim()) return NextResponse.json({ error: "Body is required" }, { status: 400 });

  await execute(
    `UPDATE Comment SET body = ?, updatedAt = NOW() WHERE id = ?`,
    [body.trim(), commentId]
  );

  return NextResponse.json({ id: commentId, body: body.trim() });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { projectId, taskId, commentId } = await params;
  const { error: authError, session } = await requireAuth();
  if (authError) return authError;

  const { error } = await guardComment(session!.user.id, projectId, commentId);
  if (error) return error;

  await execute(`DELETE FROM Comment WHERE id = ?`, [commentId]);
  return new NextResponse(null, { status: 204 });
}

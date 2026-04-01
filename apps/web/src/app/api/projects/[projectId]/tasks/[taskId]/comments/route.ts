import { NextRequest, NextResponse } from "next/server";
import { query, queryOne, withTransaction, connExecute } from "@/lib/db";
import { requireAuth, requireProjectAccess } from "@/lib/auth-helpers";
import { gravatarUrl } from "@/lib/gravatar";
import { randomUUID } from "crypto";

type Params = { params: Promise<{ projectId: string; taskId: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { projectId, taskId } = await params;
  const { error, session } = await requireAuth();
  if (error) return error;

  const { error: accessError } = await requireProjectAccess(
    session!.user.id,
    projectId
  );
  if (accessError) return accessError;

  const rows = await query<Record<string, unknown>>(
    `SELECT c.*, u.id as au_id, u.name as au_name, u.image as au_image, u.email as au_email
     FROM Comment c LEFT JOIN User u ON c.authorId = u.id
     WHERE c.taskId = ? ORDER BY c.createdAt ASC`,
    [taskId]
  );

  return NextResponse.json(
    rows.map((c) => ({
      id: c.id, taskId: c.taskId, authorId: c.authorId, guestName: c.guestName,
      body: c.body, createdAt: c.createdAt, updatedAt: c.updatedAt,
      author: c.au_id ? { id: c.au_id, name: c.au_name, email: c.au_email, image: (c.au_image as string | null) ?? gravatarUrl(c.au_email as string) } : null,
    }))
  );
}

export async function POST(req: NextRequest, { params }: Params) {
  const { projectId, taskId } = await params;
  const { error, session } = await requireAuth();
  if (error) return error;

  const { error: accessError } = await requireProjectAccess(
    session!.user.id,
    projectId
  );
  if (accessError) return accessError;

  const body = await req.json();
  const { body: commentBody } = body;

  if (!commentBody?.trim()) {
    return NextResponse.json({ error: "Comment body is required" }, { status: 400 });
  }

  const commentId = randomUUID();
  const activityId = randomUUID();
  const userId = session!.user.id;
  const actorName = session!.user.name || session!.user.email || "Unknown";

  await withTransaction(async (conn) => {
    await connExecute(
      conn,
      `INSERT INTO Comment (id, taskId, authorId, body, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [commentId, taskId, userId, commentBody.trim()]
    );
    await connExecute(
      conn,
      `INSERT INTO Activity (id, taskId, actorId, actorName, type, createdAt) VALUES (?, ?, ?, ?, 'COMMENT_ADDED', NOW())`,
      [activityId, taskId, userId, actorName]
    );
  });

  const row = await queryOne<Record<string, unknown>>(
    `SELECT c.*, u.id as au_id, u.name as au_name, u.image as au_image, u.email as au_email
     FROM Comment c LEFT JOIN User u ON c.authorId = u.id
     WHERE c.id = ?`,
    [commentId]
  );

  return NextResponse.json(
    {
      id: row!.id, taskId: row!.taskId, authorId: row!.authorId, guestName: row!.guestName,
      body: row!.body, createdAt: row!.createdAt, updatedAt: row!.updatedAt,
      author: row!.au_id ? { id: row!.au_id, name: row!.au_name, image: row!.au_image } : null,
    },
    { status: 201 }
  );
}

import { NextRequest, NextResponse } from "next/server";
import { query, queryOne, execute, withTransaction, connExecute } from "@/lib/db";
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

  const row = await queryOne<Record<string, unknown>>(
    `SELECT t.*,
     u1.id as a_id, u1.name as a_name, u1.image as a_image, u1.email as a_email,
     u2.id as c_id, u2.name as c_name
     FROM Task t
     LEFT JOIN User u1 ON t.assigneeId = u1.id
     LEFT JOIN User u2 ON t.creatorId = u2.id
     WHERE t.id = ? AND t.projectId = ?`,
    [taskId, projectId]
  );

  if (!row) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  const [comments, attachments, activities] = await Promise.all([
    query<Record<string, unknown>>(
      `SELECT c.*, u.id as au_id, u.name as au_name, u.image as au_image, u.email as au_email
       FROM Comment c LEFT JOIN User u ON c.authorId = u.id
       WHERE c.taskId = ? ORDER BY c.createdAt ASC`,
      [taskId]
    ),
    query<Record<string, unknown>>(
      `SELECT * FROM Attachment WHERE taskId = ? ORDER BY createdAt ASC`,
      [taskId]
    ),
    query<Record<string, unknown>>(
      `SELECT * FROM Activity WHERE taskId = ? ORDER BY createdAt DESC`,
      [taskId]
    ),
  ]);

  return NextResponse.json({
    ...row,
    assignee: row.a_id ? { id: row.a_id, name: row.a_name, email: row.a_email, image: (row.a_image as string | null) ?? gravatarUrl(row.a_email as string) } : null,
    creator: row.c_id ? { id: row.c_id, name: row.c_name } : null,
    comments: comments.map((c) => ({
      id: c.id, taskId: c.taskId, authorId: c.authorId, guestName: c.guestName,
      body: c.body, createdAt: c.createdAt, updatedAt: c.updatedAt,
      author: c.au_id ? { id: c.au_id, name: c.au_name, email: c.au_email, image: (c.au_image as string | null) ?? gravatarUrl(c.au_email as string) } : null,
    })),
    attachments,
    activities,
  });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { projectId, taskId } = await params;
  const { error, session } = await requireAuth();
  if (error) return error;

  const { error: accessError } = await requireProjectAccess(
    session!.user.id,
    projectId
  );
  if (accessError) return accessError;

  const body = await req.json();
  const { title, description, status, priority, assigneeId } = body;

  const existing = await queryOne<Record<string, unknown>>(
    `SELECT * FROM Task WHERE id = ? AND projectId = ?`,
    [taskId, projectId]
  );
  if (!existing) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  const setParts: string[] = [];
  const vals: unknown[] = [];

  if (title !== undefined) { setParts.push("title = ?"); vals.push(title.trim()); }
  if (description !== undefined) { setParts.push("description = ?"); vals.push(description?.trim() || null); }
  if (status !== undefined) { setParts.push("status = ?"); vals.push(status); }
  if (priority !== undefined) { setParts.push("priority = ?"); vals.push(priority); }
  if (assigneeId !== undefined) { setParts.push("assigneeId = ?"); vals.push(assigneeId || null); }
  setParts.push("updatedAt = NOW()");

  const actorName = session!.user.name || session!.user.email || "Unknown";
  const userId = session!.user.id;

  await withTransaction(async (conn) => {
    vals.push(taskId);
    await connExecute(conn, `UPDATE Task SET ${setParts.join(", ")} WHERE id = ?`, vals);

    const activities: { type: string; fromValue: string | null; toValue: string | null }[] = [];

    if (status && status !== existing.status) {
      activities.push({ type: "STATUS_CHANGED", fromValue: existing.status as string, toValue: status });
    }
    if (priority && priority !== existing.priority) {
      activities.push({ type: "PRIORITY_CHANGED", fromValue: existing.priority as string, toValue: priority });
    }
    if (assigneeId !== undefined && assigneeId !== existing.assigneeId) {
      activities.push({ type: "ASSIGNEE_CHANGED", fromValue: (existing.assigneeId as string | null) ?? null, toValue: assigneeId || null });
    }
    if (title && title !== existing.title) {
      activities.push({ type: "TITLE_CHANGED", fromValue: existing.title as string, toValue: title });
    }

    for (const act of activities) {
      await connExecute(
        conn,
        `INSERT INTO Activity (id, taskId, actorId, actorName, type, fromValue, toValue, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [randomUUID(), taskId, userId, actorName, act.type, act.fromValue, act.toValue]
      );
    }
  });

  const row = await queryOne<Record<string, unknown>>(
    `SELECT t.*,
     u1.id as a_id, u1.name as a_name, u1.image as a_image
     FROM Task t
     LEFT JOIN User u1 ON t.assigneeId = u1.id
     WHERE t.id = ?`,
    [taskId]
  );

  const commentCount = await queryOne<{ cnt: number }>(
    `SELECT COUNT(*) as cnt FROM Comment WHERE taskId = ?`, [taskId]
  );
  const attachmentCount = await queryOne<{ cnt: number }>(
    `SELECT COUNT(*) as cnt FROM Attachment WHERE taskId = ?`, [taskId]
  );

  return NextResponse.json({
    ...row,
    assignee: row!.a_id ? { id: row!.a_id, name: row!.a_name, image: row!.a_image } : null,
    _count: { comments: Number(commentCount?.cnt ?? 0), attachments: Number(attachmentCount?.cnt ?? 0) },
  });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { projectId, taskId } = await params;
  const { error, session } = await requireAuth();
  if (error) return error;

  const { error: accessError, member } = await requireProjectAccess(
    session!.user.id,
    projectId
  );
  if (accessError) return accessError;

  if (member!.role === "VIEWER" || member!.role === "MEMBER") {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  await execute(`DELETE FROM Task WHERE id = ? AND projectId = ?`, [taskId, projectId]);
  return new NextResponse(null, { status: 204 });
}

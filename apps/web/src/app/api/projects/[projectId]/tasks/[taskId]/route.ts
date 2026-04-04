import { NextRequest, NextResponse } from "next/server";
import { query, queryOne, execute, withTransaction, connExecute } from "@/lib/db";
import { requireAuth, requireProjectAccess } from "@/lib/auth-helpers";
import { gravatarUrl } from "@/lib/gravatar";
import { createNotification } from "@/lib/notifications";
import { randomUUID } from "crypto";

type Tag = { id: string; name: string; color: string };

async function fetchTaskTags(taskId: string): Promise<Tag[]> {
  try {
    return await query<Tag>(
      `SELECT t.id, t.name, t.color FROM TaskTag tt JOIN Tag t ON tt.tagId = t.id WHERE tt.taskId = ?`,
      [taskId]
    );
  } catch { return []; }
}

type Params = { params: Promise<{ projectId: string; taskId: string }> };

type Assignee = { id: string; name: string | null; email: string; image: string | null };

async function fetchTaskAssignees(taskId: string): Promise<Assignee[]> {
  try {
    const rows = await query<{ userId: string; name: string | null; email: string; image: string | null }>(
      `SELECT u.id as userId, u.name, u.email, u.image
       FROM TaskAssignee ta JOIN User u ON ta.userId = u.id WHERE ta.taskId = ?`,
      [taskId]
    );
    return rows.map((r) => ({ id: r.userId, name: r.name, email: r.email, image: r.image ?? gravatarUrl(r.email) }));
  } catch { return []; }
}

/** If TaskAssignee table doesn't exist yet, fall back to legacy assigneeId column */
async function resolveAssignees(taskId: string, legacyAssigneeId: string | null | undefined): Promise<Assignee[]> {
  const fromTable = await fetchTaskAssignees(taskId);
  if (fromTable.length > 0) return fromTable;
  if (!legacyAssigneeId) return [];
  try {
    const u = await queryOne<{ id: string; name: string | null; email: string; image: string | null }>(
      `SELECT id, name, email, image FROM User WHERE id = ?`, [legacyAssigneeId]
    );
    return u ? [{ id: u.id, name: u.name, email: u.email, image: u.image ?? gravatarUrl(u.email) }] : [];
  } catch { return []; }
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { projectId, taskId } = await params;
  const { error, session } = await requireAuth();
  if (error) return error;

  const { error: accessError } = await requireProjectAccess(session!.user.id, projectId);
  if (accessError) return accessError;

  const row = await queryOne<Record<string, unknown>>(
    `SELECT t.*, u2.id as c_id, u2.name as c_name
     FROM Task t
     LEFT JOIN User u2 ON t.creatorId = u2.id
     WHERE t.id = ? AND t.projectId = ?`,
    [taskId, projectId]
  );

  if (!row) return NextResponse.json({ error: "Task not found" }, { status: 404 });

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

  const [assignees, tags] = await Promise.all([
    resolveAssignees(taskId, row.assigneeId as string | null),
    fetchTaskTags(taskId),
  ]);
  return NextResponse.json({
    ...row,
    assignees,
    assignee: assignees[0] ?? null,
    tags,
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

  const { error: accessError, member } = await requireProjectAccess(session!.user.id, projectId);
  if (accessError) return accessError;

  const body = await req.json();
  const { title, description, status, columnId, priority, assigneeIds, archive, tagIds } = body;
  const hasTagChange = Array.isArray(tagIds);
  // legacy single-id support (embed)
  const hasAssigneeChange = assigneeIds !== undefined || body.assigneeId !== undefined;
  const resolvedIds: string[] | null = assigneeIds !== undefined
    ? assigneeIds
    : body.assigneeId !== undefined
      ? (body.assigneeId ? [body.assigneeId] : [])
      : null;

  const existing = await queryOne<Record<string, unknown>>(
    `SELECT * FROM Task WHERE id = ? AND projectId = ?`, [taskId, projectId]
  );
  if (!existing) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  // Member and Client can only move tasks or edit their OWN tasks — cannot archive/delete
  if (member!.role === "MEMBER" || member!.role === "CLIENT") {
    const userId = session!.user.id;
    if (archive !== undefined) {
      return NextResponse.json({ error: "Members and clients cannot archive tasks" }, { status: 403 });
    }
    // Allow editing only if they created or are assigned to this task
    const isEditing = title !== undefined || description !== undefined || priority !== undefined || assigneeIds !== undefined;
    if (isEditing) {
      const isAssigned = await queryOne<{ cnt: number }>(
        `SELECT COUNT(*) as cnt FROM TaskAssignee WHERE taskId = ? AND userId = ?`, [taskId, userId]
      ).catch(() => null);
      if (existing.creatorId !== userId && existing.assigneeId !== userId && !isAssigned?.cnt) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }
  }

  const setParts: string[] = [];
  const vals: unknown[] = [];

  if (title !== undefined)       { setParts.push("title = ?");       vals.push(title.trim()); }
  if (description !== undefined) { setParts.push("description = ?"); vals.push(description?.trim() || null); }
  if (status !== undefined)      { setParts.push("status = ?");      vals.push(status); }
  if (columnId !== undefined)    { setParts.push("columnId = ?");    vals.push(columnId || null); }
  if (priority !== undefined)    { setParts.push("priority = ?");    vals.push(priority); }
  if (archive === true)  setParts.push("archivedAt = NOW()");
  if (archive === false) setParts.push("archivedAt = NULL");
  // keep legacy assigneeId in sync with first assignee
  if (resolvedIds !== null) {
    setParts.push("assigneeId = ?");
    vals.push(resolvedIds[0] || null);
  }
  setParts.push("updatedAt = NOW()");

  const actorName = session!.user.name || session!.user.email || "Unknown";
  const userId = session!.user.id;

  await withTransaction(async (conn) => {
    vals.push(taskId);
    await connExecute(conn, `UPDATE Task SET ${setParts.join(", ")} WHERE id = ?`, vals);

    const activities: { type: string; fromValue: string | null; toValue: string | null }[] = [];
    if (columnId !== undefined && columnId !== existing.columnId) {
      activities.push({ type: "STATUS_CHANGED", fromValue: existing.columnId as string | null, toValue: columnId || null });
    } else if (status && status !== existing.status) {
      activities.push({ type: "STATUS_CHANGED", fromValue: existing.status as string, toValue: status });
    }
    if (priority && priority !== existing.priority) {
      activities.push({ type: "PRIORITY_CHANGED", fromValue: existing.priority as string, toValue: priority });
    }
    if (hasAssigneeChange) {
      activities.push({ type: "ASSIGNEE_CHANGED", fromValue: null, toValue: resolvedIds?.join(",") || null });
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

    // Update join table — silently skip if migration not run yet
    if (resolvedIds !== null) {
      try {
        await connExecute(conn, `DELETE FROM TaskAssignee WHERE taskId = ?`, [taskId]);
        for (const uid of resolvedIds.slice(0, 3)) {
          await connExecute(conn, `INSERT IGNORE INTO TaskAssignee (taskId, userId, assignedAt) VALUES (?, ?, NOW())`, [taskId, uid]);
        }
      } catch { /* TaskAssignee table not yet created — ignore */ }
    }

    // Update tag join table — silently skip if migration not run yet
    if (hasTagChange) {
      try {
        await connExecute(conn, `DELETE FROM TaskTag WHERE taskId = ?`, [taskId]);
        for (const tid of tagIds) {
          await connExecute(conn, `INSERT IGNORE INTO TaskTag (taskId, tagId) VALUES (?, ?)`, [taskId, tid]);
        }
      } catch { /* Tag tables not yet created — ignore */ }
    }
  });

  // Notify newly added assignees
  if (resolvedIds !== null) {
    const taskTitle = (title ?? existing.title) as string;
    for (const uid of resolvedIds.slice(0, 3)) {
      if (uid !== userId) {
        createNotification({ userId: uid, type: "TASK_ASSIGNED", actorName, taskId, projectId, taskTitle }).catch(() => {});
      }
    }
  }

  const row = await queryOne<Record<string, unknown>>(
    `SELECT t.* FROM Task t WHERE t.id = ?`,
    [taskId]
  );

  const [commentCount, attachmentCount, assignees, tags] = await Promise.all([
    queryOne<{ cnt: number }>(`SELECT COUNT(*) as cnt FROM Comment WHERE taskId = ?`, [taskId]),
    queryOne<{ cnt: number }>(`SELECT COUNT(*) as cnt FROM Attachment WHERE taskId = ?`, [taskId]),
    resolveAssignees(taskId, row!.assigneeId as string | null),
    fetchTaskTags(taskId),
  ]);

  return NextResponse.json({
    ...row,
    assignees,
    assignee: assignees[0] ?? null,
    tags,
    _count: { comments: Number(commentCount?.cnt ?? 0), attachments: Number(attachmentCount?.cnt ?? 0) },
  });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { projectId, taskId } = await params;
  const { error, session } = await requireAuth();
  if (error) return error;

  const { error: accessError, member } = await requireProjectAccess(session!.user.id, projectId);
  if (accessError) return accessError;

  // Only Admin and Project Manager can delete tasks
  if (member!.role === "MEMBER" || member!.role === "CLIENT") {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  await execute(`DELETE FROM Task WHERE id = ? AND projectId = ?`, [taskId, projectId]);
  return new NextResponse(null, { status: 204 });
}

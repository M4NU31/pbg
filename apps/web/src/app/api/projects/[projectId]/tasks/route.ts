import { NextRequest, NextResponse } from "next/server";
import { query, queryOne, withTransaction, connExecute, connQueryOne } from "@/lib/db";
import { requireAuth, requireProjectAccess } from "@/lib/auth-helpers";
import { gravatarUrl } from "@/lib/gravatar";
import { createNotification } from "@/lib/notifications";
import { randomUUID } from "crypto";

type Tag = { id: string; name: string; color: string };

async function fetchTagMap(taskIds: string[]): Promise<Record<string, Tag[]>> {
  if (!taskIds.length) return {};
  try {
    const placeholders = taskIds.map(() => "?").join(",");
    const rows = await query<{ taskId: string; id: string; name: string; color: string }>(
      `SELECT tt.taskId, t.id, t.name, t.color
       FROM TaskTag tt JOIN Tag t ON tt.tagId = t.id
       WHERE tt.taskId IN (${placeholders})`,
      taskIds
    );
    const map: Record<string, Tag[]> = {};
    for (const r of rows) {
      if (!map[r.taskId]) map[r.taskId] = [];
      map[r.taskId].push({ id: r.id, name: r.name, color: r.color });
    }
    return map;
  } catch { return {}; }
}

type Params = { params: Promise<{ projectId: string }> };

type Assignee = { id: string; name: string | null; email: string; image: string | null };

function parseAssignees(raw: unknown): Assignee[] {
  if (!raw) return [];
  try {
    const arr = typeof raw === "string" ? JSON.parse(raw) : raw;
    return Array.isArray(arr) ? arr.map((a: any) => ({ ...a, image: a.image ?? gravatarUrl(a.email) })) : [];
  } catch { return []; }
}

/** Fetch assignees for a list of task IDs — returns empty map if table doesn't exist yet */
async function fetchAssigneeMap(taskIds: string[]): Promise<Record<string, Assignee[]>> {
  if (!taskIds.length) return {};
  try {
    const placeholders = taskIds.map(() => "?").join(",");
    const rows = await query<{ taskId: string; userId: string; name: string | null; email: string; image: string | null }>(
      `SELECT ta.taskId, u.id as userId, u.name, u.email, u.image
       FROM TaskAssignee ta JOIN User u ON ta.userId = u.id
       WHERE ta.taskId IN (${placeholders})`,
      taskIds
    );
    const map: Record<string, Assignee[]> = {};
    for (const r of rows) {
      if (!map[r.taskId]) map[r.taskId] = [];
      map[r.taskId].push({ id: r.userId, name: r.name, email: r.email, image: r.image ?? gravatarUrl(r.email) });
    }
    return map;
  } catch { return {}; }
}

export async function GET(req: NextRequest, { params }: Params) {
  const { projectId } = await params;
  const { error, session } = await requireAuth();
  if (error) return error;

  const { error: accessError } = await requireProjectAccess(session!.user.id, projectId);
  if (accessError) return accessError;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const priority = searchParams.get("priority");
  const assigneeId = searchParams.get("assigneeId");
  const archived = searchParams.get("archived") === "true";

  const conditions: string[] = ["t.projectId = ?"];
  const vals: unknown[] = [projectId];

  if (archived) conditions.push("t.archivedAt IS NOT NULL");
  else conditions.push("t.archivedAt IS NULL");

  if (status)   { conditions.push("t.columnId = ?");  vals.push(status); }
  if (priority) { conditions.push("t.priority = ?");  vals.push(priority); }
  // assigneeId filter — skip if table doesn't exist (caught inside fetchAssigneeMap)
  if (assigneeId) {
    try {
      conditions.push("EXISTS (SELECT 1 FROM TaskAssignee ta WHERE ta.taskId = t.id AND ta.userId = ?)");
      vals.push(assigneeId);
    } catch { /* ignore */ }
  }

  const rows = await query<Record<string, unknown>>(
    `SELECT t.*,
     u2.id as c_id, u2.name as c_name,
     (SELECT COUNT(*) FROM Comment WHERE taskId = t.id) as commentCount,
     (SELECT COUNT(*) FROM Attachment WHERE taskId = t.id) as attachmentCount
     FROM Task t
     LEFT JOIN User u2 ON t.creatorId = u2.id
     WHERE ${conditions.join(" AND ")}
     ORDER BY t.taskNumber DESC`,
    vals
  );

  // Fetch assignees + tags separately so missing tables won't break task list
  const taskIds = rows.map((r) => r.id as string);
  const [assigneeMap, tagMap] = await Promise.all([
    fetchAssigneeMap(taskIds),
    fetchTagMap(taskIds),
  ]);

  return NextResponse.json(
    rows.map((row) => {
      const assignees = assigneeMap[row.id as string] ?? [];
      const tags = tagMap[row.id as string] ?? [];
      // Fallback to legacy assigneeId column if join table is empty
      const legacyAssignee = !assignees.length && row.assigneeId
        ? { id: row.assigneeId as string, name: null, email: "", image: null }
        : null;
      return {
        id: row.id, projectId: row.projectId, title: row.title, description: row.description,
        columnId: row.columnId, priority: row.priority, taskNumber: row.taskNumber,
        assigneeId: row.assigneeId, creatorId: row.creatorId,
        guestName: row.guestName, guestEmail: row.guestEmail,
        screenshotUrl: row.screenshotUrl, domSelector: row.domSelector, domHtml: row.domHtml,
        pageUrl: row.pageUrl, browserName: row.browserName, browserVersion: row.browserVersion,
        osName: row.osName, osVersion: row.osVersion, deviceType: row.deviceType,
        screenWidth: row.screenWidth, screenHeight: row.screenHeight,
        viewportWidth: row.viewportWidth, viewportHeight: row.viewportHeight,
        userAgent: row.userAgent, createdAt: row.createdAt, updatedAt: row.updatedAt,
        assignees,
        assignee: assignees[0] ?? legacyAssignee,
        tags,
        creator: row.c_id ? { id: row.c_id, name: row.c_name } : null,
        _count: { comments: Number(row.commentCount), attachments: Number(row.attachmentCount) },
      };
    })
  );
}

export async function POST(req: NextRequest, { params }: Params) {
  const { projectId } = await params;
  const { error, session } = await requireAuth();
  if (error) return error;

  const { error: accessError } = await requireProjectAccess(session!.user.id, projectId);
  if (accessError) return accessError;

  const body = await req.json();
  const { title, description, priority, assigneeIds, columnId, tagIds } = body;
  const resolvedIds: string[] = assigneeIds ?? (body.assigneeId ? [body.assigneeId] : []);
  const resolvedTagIds: string[] = Array.isArray(tagIds) ? tagIds : [];

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const taskId = randomUUID();
  const activityId = randomUUID();
  const userId = session!.user.id;
  const actorName = session!.user.name || session!.user.email || "Unknown";

  await withTransaction(async (conn) => {
    const maxRow = await connQueryOne<{ maxNum: number | null }>(
      conn, `SELECT MAX(taskNumber) as maxNum FROM Task WHERE projectId = ?`, [projectId]
    );
    const num = (maxRow?.maxNum ?? 0) + 1;

    let targetColumnId = columnId || null;
    if (!targetColumnId) {
      const firstCol = await connQueryOne<{ id: string }>(
        conn, `SELECT id FROM BoardColumn WHERE projectId = ? ORDER BY position ASC LIMIT 1`, [projectId]
      );
      targetColumnId = firstCol?.id || null;
    }

    await connExecute(
      conn,
      `INSERT INTO Task (id, projectId, title, description, status, priority, taskNumber, assigneeId, creatorId, columnId, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, 'BACKLOG', ?, ?, ?, ?, ?, NOW(), NOW())`,
      [taskId, projectId, title.trim(), description?.trim() || null, priority || "MEDIUM", num,
       resolvedIds[0] || null, userId, targetColumnId]
    );

    // Insert into join table — silently skip if table doesn't exist yet
    for (const uid of resolvedIds.slice(0, 3)) {
      try {
        await connExecute(conn, `INSERT IGNORE INTO TaskAssignee (taskId, userId, assignedAt) VALUES (?, ?, NOW())`, [taskId, uid]);
      } catch { /* migration not run yet — ignore */ }
    }

    // Insert tags — silently skip if table doesn't exist yet
    for (const tid of resolvedTagIds) {
      try {
        await connExecute(conn, `INSERT IGNORE INTO TaskTag (taskId, tagId) VALUES (?, ?)`, [taskId, tid]);
      } catch { /* migration not run yet — ignore */ }
    }

    await connExecute(
      conn,
      `INSERT INTO Activity (id, taskId, actorId, actorName, type, createdAt) VALUES (?, ?, ?, ?, 'TASK_CREATED', NOW())`,
      [activityId, taskId, userId, actorName]
    );
  });

  for (const uid of resolvedIds.slice(0, 3)) {
    if (uid !== userId) {
      createNotification({ userId: uid, type: "TASK_ASSIGNED", actorName, taskId, projectId, taskTitle: title.trim() }).catch(() => {});
    }
  }

  const row = await queryOne<Record<string, unknown>>(
    `SELECT t.*, u2.id as c_id, u2.name as c_name
     FROM Task t LEFT JOIN User u2 ON t.creatorId = u2.id WHERE t.id = ?`,
    [taskId]
  );

  const [assigneeMap, tagMap] = await Promise.all([
    fetchAssigneeMap([taskId]),
    fetchTagMap([taskId]),
  ]);
  const assignees = assigneeMap[taskId] ?? [];
  const tags = tagMap[taskId] ?? [];

  return NextResponse.json(
    { ...row, assignees, assignee: assignees[0] ?? null, tags,
      creator: row!.c_id ? { id: row!.c_id, name: row!.c_name } : null,
      _count: { comments: 0, attachments: 0 } },
    { status: 201 }
  );
}

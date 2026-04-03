import { NextRequest, NextResponse } from "next/server";
import { query, queryOne, withTransaction, connExecute, connQueryOne } from "@/lib/db";
import { requireAuth, requireProjectAccess } from "@/lib/auth-helpers";
import { gravatarUrl } from "@/lib/gravatar";
import { createNotification } from "@/lib/notifications";
import { randomUUID } from "crypto";

type Params = { params: Promise<{ projectId: string }> };

function parseAssignees(raw: unknown): { id: string; name: string | null; email: string; image: string | null }[] {
  if (!raw) return [];
  try {
    const arr = typeof raw === "string" ? JSON.parse(raw) : raw;
    return Array.isArray(arr) ? arr.map((a: any) => ({
      ...a,
      image: a.image ?? gravatarUrl(a.email),
    })) : [];
  } catch { return []; }
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
  if (assigneeId) {
    conditions.push("EXISTS (SELECT 1 FROM TaskAssignee ta WHERE ta.taskId = t.id AND ta.userId = ?)");
    vals.push(assigneeId);
  }

  const rows = await query<Record<string, unknown>>(
    `SELECT t.*,
     u2.id as c_id, u2.name as c_name,
     (SELECT COUNT(*) FROM Comment WHERE taskId = t.id) as commentCount,
     (SELECT COUNT(*) FROM Attachment WHERE taskId = t.id) as attachmentCount,
     (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', u.id, 'name', u.name, 'email', u.email, 'image', u.image))
      FROM TaskAssignee ta JOIN User u ON ta.userId = u.id WHERE ta.taskId = t.id) as assigneesJson
     FROM Task t
     LEFT JOIN User u2 ON t.creatorId = u2.id
     WHERE ${conditions.join(" AND ")}
     ORDER BY t.taskNumber DESC`,
    vals
  );

  return NextResponse.json(
    rows.map((row) => ({
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
      assignees: parseAssignees(row.assigneesJson),
      // keep legacy assignee for embed compatibility
      assignee: (() => { const a = parseAssignees(row.assigneesJson)[0]; return a ?? null; })(),
      creator: row.c_id ? { id: row.c_id, name: row.c_name } : null,
      _count: { comments: Number(row.commentCount), attachments: Number(row.attachmentCount) },
    }))
  );
}

export async function POST(req: NextRequest, { params }: Params) {
  const { projectId } = await params;
  const { error, session } = await requireAuth();
  if (error) return error;

  const { error: accessError } = await requireProjectAccess(session!.user.id, projectId);
  if (accessError) return accessError;

  const body = await req.json();
  const { title, description, priority, assigneeIds, columnId } = body;
  // support legacy single assigneeId from embed
  const resolvedIds: string[] = assigneeIds ?? (body.assigneeId ? [body.assigneeId] : []);

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

    for (const uid of resolvedIds.slice(0, 3)) {
      await connExecute(
        conn,
        `INSERT IGNORE INTO TaskAssignee (taskId, userId, assignedAt) VALUES (?, ?, NOW())`,
        [taskId, uid]
      );
    }

    await connExecute(
      conn,
      `INSERT INTO Activity (id, taskId, actorId, actorName, type, createdAt) VALUES (?, ?, ?, ?, 'TASK_CREATED', NOW())`,
      [activityId, taskId, userId, actorName]
    );
  });

  // Notify each assignee (fire-and-forget)
  for (const uid of resolvedIds.slice(0, 3)) {
    if (uid !== userId) {
      createNotification({ userId: uid, type: "TASK_ASSIGNED", actorName, taskId, projectId, taskTitle: title.trim() }).catch(() => {});
    }
  }

  const row = await queryOne<Record<string, unknown>>(
    `SELECT t.*,
     u2.id as c_id, u2.name as c_name,
     (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', u.id, 'name', u.name, 'email', u.email, 'image', u.image))
      FROM TaskAssignee ta JOIN User u ON ta.userId = u.id WHERE ta.taskId = t.id) as assigneesJson
     FROM Task t LEFT JOIN User u2 ON t.creatorId = u2.id WHERE t.id = ?`,
    [taskId]
  );

  const assignees = parseAssignees(row!.assigneesJson);
  return NextResponse.json(
    { ...row, assignees, assignee: assignees[0] ?? null,
      creator: row!.c_id ? { id: row!.c_id, name: row!.c_name } : null,
      _count: { comments: 0, attachments: 0 } },
    { status: 201 }
  );
}

import { NextRequest, NextResponse } from "next/server";
import { query, queryOne, withTransaction, connExecute, connQueryOne } from "@/lib/db";
import { requireAuth, requireProjectAccess } from "@/lib/auth-helpers";
import { randomUUID } from "crypto";

type Params = { params: Promise<{ projectId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { projectId } = await params;
  const { error, session } = await requireAuth();
  if (error) return error;

  const { error: accessError } = await requireProjectAccess(
    session!.user.id,
    projectId
  );
  if (accessError) return accessError;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const priority = searchParams.get("priority");
  const assigneeId = searchParams.get("assigneeId");

  const conditions: string[] = ["t.projectId = ?"];
  const vals: unknown[] = [projectId];

  if (status) { conditions.push("t.status = ?"); vals.push(status); }
  if (priority) { conditions.push("t.priority = ?"); vals.push(priority); }
  if (assigneeId) { conditions.push("t.assigneeId = ?"); vals.push(assigneeId); }

  const rows = await query<Record<string, unknown>>(
    `SELECT t.*,
     u1.id as a_id, u1.name as a_name, u1.image as a_image,
     u2.id as c_id, u2.name as c_name,
     (SELECT COUNT(*) FROM Comment WHERE taskId = t.id) as commentCount,
     (SELECT COUNT(*) FROM Attachment WHERE taskId = t.id) as attachmentCount
     FROM Task t
     LEFT JOIN User u1 ON t.assigneeId = u1.id
     LEFT JOIN User u2 ON t.creatorId = u2.id
     WHERE ${conditions.join(" AND ")}
     ORDER BY t.status ASC, t.taskNumber DESC`,
    vals
  );

  return NextResponse.json(
    rows.map((row) => ({
      id: row.id, projectId: row.projectId, title: row.title, description: row.description,
      status: row.status, priority: row.priority, taskNumber: row.taskNumber,
      assigneeId: row.assigneeId, creatorId: row.creatorId,
      guestName: row.guestName, guestEmail: row.guestEmail,
      screenshotUrl: row.screenshotUrl, domSelector: row.domSelector, domHtml: row.domHtml,
      pageUrl: row.pageUrl, browserName: row.browserName, browserVersion: row.browserVersion,
      osName: row.osName, osVersion: row.osVersion, deviceType: row.deviceType,
      screenWidth: row.screenWidth, screenHeight: row.screenHeight,
      viewportWidth: row.viewportWidth, viewportHeight: row.viewportHeight,
      userAgent: row.userAgent, createdAt: row.createdAt, updatedAt: row.updatedAt,
      assignee: row.a_id ? { id: row.a_id, name: row.a_name, image: row.a_image } : null,
      creator: row.c_id ? { id: row.c_id, name: row.c_name } : null,
      _count: { comments: Number(row.commentCount), attachments: Number(row.attachmentCount) },
    }))
  );
}

export async function POST(req: NextRequest, { params }: Params) {
  const { projectId } = await params;
  const { error, session } = await requireAuth();
  if (error) return error;

  const { error: accessError } = await requireProjectAccess(
    session!.user.id,
    projectId
  );
  if (accessError) return accessError;

  const body = await req.json();
  const { title, description, priority, assigneeId } = body;

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const taskId = randomUUID();
  const activityId = randomUUID();
  const userId = session!.user.id;
  const actorName = session!.user.name || session!.user.email || "Unknown";

  const taskNumber = await withTransaction(async (conn) => {
    const maxRow = await connQueryOne<{ maxNum: number | null }>(
      conn,
      `SELECT MAX(taskNumber) as maxNum FROM Task WHERE projectId = ?`,
      [projectId]
    );
    const num = (maxRow?.maxNum ?? 0) + 1;

    await connExecute(
      conn,
      `INSERT INTO Task (id, projectId, title, description, status, priority, taskNumber, assigneeId, creatorId, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, 'BACKLOG', ?, ?, ?, ?, NOW(), NOW())`,
      [taskId, projectId, title.trim(), description?.trim() || null, priority || "MEDIUM", num, assigneeId || null, userId]
    );

    await connExecute(
      conn,
      `INSERT INTO Activity (id, taskId, actorId, actorName, type, createdAt) VALUES (?, ?, ?, ?, 'TASK_CREATED', NOW())`,
      [activityId, taskId, userId, actorName]
    );

    return num;
  });

  const row = await queryOne<Record<string, unknown>>(
    `SELECT t.*,
     u1.id as a_id, u1.name as a_name, u1.image as a_image,
     u2.id as c_id, u2.name as c_name
     FROM Task t
     LEFT JOIN User u1 ON t.assigneeId = u1.id
     LEFT JOIN User u2 ON t.creatorId = u2.id
     WHERE t.id = ?`,
    [taskId]
  );

  return NextResponse.json(
    {
      ...row,
      assignee: row!.a_id ? { id: row!.a_id, name: row!.a_name, image: row!.a_image } : null,
      creator: row!.c_id ? { id: row!.c_id, name: row!.c_name } : null,
      _count: { comments: 0, attachments: 0 },
    },
    { status: 201 }
  );
}

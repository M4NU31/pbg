import { NextRequest, NextResponse } from "next/server";
import { queryOne, query } from "@/lib/db";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "";

function resolveUrl(url: string | null): string | null {
  if (!url) return null;
  return url.startsWith("http") ? url : `${APP_URL}${url}`;
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

type Params = { params: Promise<{ taskId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { taskId } = await params;
  const key = req.nextUrl.searchParams.get("key");

  if (!key) {
    return NextResponse.json({ error: "Missing key" }, { status: 400, headers: CORS_HEADERS });
  }

  const task = await queryOne<Record<string, unknown>>(
    `SELECT t.id, t.taskNumber, t.title, t.description, t.status, t.priority,
            t.columnId, t.assigneeId,
            t.screenshotUrl, t.pageUrl, t.guestName, t.createdAt,
            t.browserName, t.browserVersion, t.osName, t.osVersion,
            t.deviceType, t.screenWidth, t.screenHeight,
            t.domSelector, t.pinX, t.pinY,
            bc.name AS columnName,
            p.slug AS projectSlug,
            uc.name AS creatorName,
            ua.name AS assigneeName
     FROM Task t
     LEFT JOIN BoardColumn bc ON t.columnId = bc.id
     LEFT JOIN Project p ON t.projectId = p.id
     LEFT JOIN User uc ON t.creatorId = uc.id
     LEFT JOIN User ua ON t.assigneeId = ua.id
     WHERE t.id = ?
       AND t.projectId IN (SELECT id FROM Project WHERE embedKey = ?)`,
    [taskId, key]
  );

  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404, headers: CORS_HEADERS });
  }

  const comments = await query<Record<string, unknown>>(
    `SELECT c.id, c.body, c.createdAt,
            COALESCE(u.name, c.guestName, 'Anonymous') AS authorName
     FROM Comment c
     LEFT JOIN User u ON c.authorId = u.id
     WHERE c.taskId = ?
     ORDER BY c.createdAt ASC`,
    [taskId]
  );

  return NextResponse.json(
    {
      ...task,
      screenshotUrl: resolveUrl(task.screenshotUrl as string | null),
      comments,
    },
    { headers: CORS_HEADERS }
  );
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { taskId } = await params;
  const key = req.nextUrl.searchParams.get("key");
  if (!key) return NextResponse.json({ error: "Missing key" }, { status: 400, headers: CORS_HEADERS });

  const existing = await queryOne<{ id: string }>(
    `SELECT t.id FROM Task t WHERE t.id = ? AND t.projectId IN (SELECT id FROM Project WHERE embedKey = ?)`,
    [taskId, key]
  );
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404, headers: CORS_HEADERS });

  const body = await req.json();
  const ALLOWED = ["title", "columnId", "priority", "assigneeId", "description"] as const;
  const setClauses: string[] = [];
  const values: unknown[] = [];

  for (const field of ALLOWED) {
    if (field in body) {
      setClauses.push(`${field} = ?`);
      values.push(body[field] ?? null);
    }
  }

  if (setClauses.length === 0) {
    return NextResponse.json({ error: "No valid fields" }, { status: 400, headers: CORS_HEADERS });
  }

  await query(
    `UPDATE Task SET ${setClauses.join(", ")}, updatedAt = NOW() WHERE id = ?`,
    [...values, taskId]
  );

  return NextResponse.json({ ok: true }, { headers: CORS_HEADERS });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { taskId } = await params;
  const key = req.nextUrl.searchParams.get("key");
  const userId = req.nextUrl.searchParams.get("userId");

  if (!key || !userId) {
    return NextResponse.json({ error: "Missing key or userId" }, { status: 400, headers: CORS_HEADERS });
  }

  // Verify the user has ADMIN or PROJECT_MANAGER role in this project
  const member = await queryOne<{ role: string }>(
    `SELECT pm.role FROM ProjectMember pm
     JOIN Project p ON pm.projectId = p.id
     WHERE p.embedKey = ? AND pm.userId = ?
       AND pm.role IN ('ADMIN', 'PROJECT_MANAGER')`,
    [key, userId]
  );

  if (!member) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403, headers: CORS_HEADERS });
  }

  // Verify the task belongs to this project
  const existing = await queryOne<{ id: string }>(
    `SELECT t.id FROM Task t WHERE t.id = ? AND t.projectId IN (SELECT id FROM Project WHERE embedKey = ?)`,
    [taskId, key]
  );
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404, headers: CORS_HEADERS });
  }

  await query(`DELETE FROM Task WHERE id = ?`, [taskId]);

  return NextResponse.json({ ok: true }, { headers: CORS_HEADERS });
}

import { NextRequest, NextResponse } from "next/server";
import { queryOne, query } from "@/lib/db";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
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
            t.screenshotUrl, t.pageUrl, t.guestName, t.createdAt,
            t.browserName, t.browserVersion, t.osName, t.osVersion,
            t.deviceType, t.screenWidth, t.screenHeight,
            t.domSelector, t.pinX, t.pinY,
            bc.name AS columnName
     FROM Task t
     LEFT JOIN BoardColumn bc ON t.columnId = bc.id
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

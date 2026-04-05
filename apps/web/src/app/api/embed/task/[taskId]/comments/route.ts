import { NextRequest, NextResponse } from "next/server";
import { queryOne, connExecute, withTransaction } from "@/lib/db";
import { randomUUID } from "crypto";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

type Params = { params: Promise<{ taskId: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { taskId } = await params;
  const key = req.nextUrl.searchParams.get("key");

  if (!key) {
    return NextResponse.json({ error: "Missing key" }, { status: 400, headers: CORS_HEADERS });
  }

  const body = await req.json();
  const commentBody = (body?.body ?? "").trim();
  if (!commentBody) {
    return NextResponse.json({ error: "Body required" }, { status: 400, headers: CORS_HEADERS });
  }

  // Verify the task belongs to a project with this embed key
  const task = await queryOne<{ id: string; guestName: string | null }>(
    `SELECT t.id, t.guestName FROM Task t
     WHERE t.id = ? AND t.projectId IN (SELECT id FROM Project WHERE embedKey = ?)`,
    [taskId, key]
  );

  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404, headers: CORS_HEADERS });
  }

  const commentId = randomUUID();
  const guestName = (body?.guestName ?? "").trim() || task.guestName || "Guest";

  await withTransaction(async (conn) => {
    await connExecute(
      conn,
      `INSERT INTO Comment (id, taskId, body, guestName, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [commentId, taskId, commentBody, guestName]
    );
  });

  return NextResponse.json(
    { id: commentId, body: commentBody, authorName: guestName, createdAt: new Date().toISOString() },
    { headers: CORS_HEADERS }
  );
}

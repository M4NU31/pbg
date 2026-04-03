import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/lib/db";
import { requireAuth } from "@/lib/auth-helpers";

export async function GET(req: NextRequest) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const all = searchParams.get("all") === "1";
  const limit = all ? 50 : 10;

  const rows = await query<Record<string, unknown>>(
    `SELECT id, \`type\`, \`read\`, actorName, taskId, projectId, commentId, taskTitle, createdAt
     FROM Notification
     WHERE userId = ?
     ORDER BY createdAt DESC
     LIMIT ${limit}`,
    [session!.user.id]
  );

  const unreadCount = await query<{ cnt: number }>(
    `SELECT COUNT(*) as cnt FROM Notification WHERE userId = ? AND \`read\` = 0`,
    [session!.user.id]
  );

  return NextResponse.json({
    notifications: rows,
    unreadCount: Number(unreadCount[0]?.cnt ?? 0),
  });
}

export async function PATCH(req: NextRequest) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const body = await req.json();
  const { id } = body;

  if (id) {
    await execute(
      `UPDATE Notification SET \`read\` = 1 WHERE id = ? AND userId = ?`,
      [id, session!.user.id]
    );
  }

  return NextResponse.json({ ok: true });
}

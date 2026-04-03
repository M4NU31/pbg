import { NextResponse } from "next/server";
import { execute } from "@/lib/db";
import { requireAuth } from "@/lib/auth-helpers";

export async function POST() {
  const { error, session } = await requireAuth();
  if (error) return error;

  await execute(
    `UPDATE Notification SET \`read\` = 1 WHERE userId = ? AND \`read\` = 0`,
    [session!.user.id]
  );

  return NextResponse.json({ ok: true });
}

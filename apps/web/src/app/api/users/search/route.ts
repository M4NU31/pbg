import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAuth } from "@/lib/auth-helpers";
import { gravatarUrl } from "@/lib/gravatar";

export async function GET(req: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const projectId = searchParams.get("projectId") ?? "";

  if (q.length < 1) return NextResponse.json([]);

  // Team-member search always restricts to @punchteam.com users
  const rows = await query<Record<string, unknown>>(
    projectId
      ? `SELECT u.id, u.name, u.email, u.image
         FROM User u
         WHERE (u.name LIKE ? OR u.email LIKE ?)
           AND u.email LIKE '%@punchteam.com'
           AND u.id NOT IN (
             SELECT userId FROM ProjectMember WHERE projectId = ?
           )
         ORDER BY u.name ASC
         LIMIT 8`
      : `SELECT u.id, u.name, u.email, u.image
         FROM User u
         WHERE (u.name LIKE ? OR u.email LIKE ?)
           AND u.email LIKE '%@punchteam.com'
         ORDER BY u.name ASC
         LIMIT 8`,
    projectId
      ? [`%${q}%`, `%${q}%`, projectId]
      : [`%${q}%`, `%${q}%`]
  );

  return NextResponse.json(
    rows.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      image: u.image ?? null,
      avatarUrl: (u.image as string | null) ?? gravatarUrl(u.email as string),
    }))
  );
}

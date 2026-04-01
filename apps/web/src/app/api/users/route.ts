import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/lib/db";
import { requireAuth, getSystemRole } from "@/lib/auth-helpers";

export async function GET() {
  const { error, session } = await requireAuth();
  if (error) return error;

  const systemRole = await getSystemRole(session!.user.id, session!.user.email);
  if (systemRole !== "RANK1") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rows = await query<Record<string, unknown>>(
    `SELECT id, name, email, image, systemRole, createdAt FROM User ORDER BY createdAt DESC`
  );

  return NextResponse.json(rows);
}

export async function PATCH(req: NextRequest) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const systemRole = await getSystemRole(session!.user.id, session!.user.email);
  if (systemRole !== "RANK1") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId, newRole } = await req.json();

  if (!userId || !["RANK1", "RANK2", "RANK3"].includes(newRole)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Prevent removing own admin access
  if (userId === session!.user.id && newRole !== "RANK1") {
    return NextResponse.json({ error: "Cannot change your own rank" }, { status: 400 });
  }

  await execute(`UPDATE User SET systemRole = ? WHERE id = ?`, [newRole, userId]);
  return NextResponse.json({ ok: true });
}

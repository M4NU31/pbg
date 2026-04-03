import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/lib/db";
import { requireAuth, getSystemRole } from "@/lib/auth-helpers";

async function guardRank1(session: NonNullable<Awaited<ReturnType<typeof requireAuth>>["session"]>) {
  const systemRole = await getSystemRole(session.user.id, session.user.email);
  return systemRole === "RANK1";
}

export async function GET() {
  const { error, session } = await requireAuth();
  if (error) return error;
  if (!await guardRank1(session!)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const rows = await query<Record<string, unknown>>(
    `SELECT u.id, u.name, u.email, u.image, u.systemRole, u.createdAt,
     (SELECT GROUP_CONCAT(p.name ORDER BY p.name SEPARATOR ', ')
      FROM Project p WHERE p.ownerId = u.id AND p.archivedAt IS NULL) as ownedProjects
     FROM User u
     WHERE u.email LIKE '%@punchteam.com'
     ORDER BY u.createdAt DESC`
  );

  return NextResponse.json(rows);
}

export async function PATCH(req: NextRequest) {
  const { error, session } = await requireAuth();
  if (error) return error;
  if (!await guardRank1(session!)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { userId, newRole } = await req.json();

  if (!userId || !["RANK1", "RANK2", "RANK3"].includes(newRole)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  if (userId === session!.user.id) {
    return NextResponse.json({ error: "Cannot change your own rank" }, { status: 400 });
  }

  // Protect client accounts from role changes
  const target = await query<{ email: string }>(`SELECT email FROM User WHERE id = ?`, [userId]);
  if (!target[0] || !target[0].email.endsWith("@punchteam.com")) {
    return NextResponse.json({ error: "Client accounts cannot be managed here" }, { status: 400 });
  }

  await execute(`UPDATE User SET systemRole = ? WHERE id = ?`, [newRole, userId]);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const { error, session } = await requireAuth();
  if (error) return error;
  if (!await guardRank1(session!)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { userId } = await req.json();

  if (!userId) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  if (userId === session!.user.id) {
    return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
  }

  // Protect client accounts from deletion here — revoke via project settings instead
  const target = await query<{ email: string }>(`SELECT email FROM User WHERE id = ?`, [userId]);
  if (!target[0] || !target[0].email.endsWith("@punchteam.com")) {
    return NextResponse.json({ error: "Client accounts cannot be managed here" }, { status: 400 });
  }

  await execute(`DELETE FROM User WHERE id = ?`, [userId]);
  return new NextResponse(null, { status: 204 });
}

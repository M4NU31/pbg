import { NextRequest, NextResponse } from "next/server";
import { execute } from "@/lib/db";
import { requireAuth, requireProjectAccess } from "@/lib/auth-helpers";

type Params = { params: Promise<{ projectId: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { projectId } = await params;
  const { error, session } = await requireAuth();
  if (error) return error;
  const { error: ae, member } = await requireProjectAccess(session!.user.id, projectId);
  if (ae) return ae;
  if (member!.role !== "ADMIN" && member!.role !== "PROJECT_MANAGER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // orderedIds: string[] — new order from front to back
  const { orderedIds } = await req.json();
  if (!Array.isArray(orderedIds)) return NextResponse.json({ error: "orderedIds required" }, { status: 400 });

  await Promise.all(
    orderedIds.map((id: string, index: number) =>
      execute(`UPDATE BoardColumn SET position = ? WHERE id = ? AND projectId = ?`, [index, id, projectId])
    )
  );
  return NextResponse.json({ ok: true });
}

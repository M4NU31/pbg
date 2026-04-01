import { NextRequest, NextResponse } from "next/server";
import { execute } from "@/lib/db";
import { requireAuth, requireProjectAccess } from "@/lib/auth-helpers";
import { generateEmbedKey } from "@/lib/utils";

type Params = { params: Promise<{ projectId: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  const { projectId } = await params;
  const { error, session } = await requireAuth();
  if (error) return error;

  const { error: accessError, member } = await requireProjectAccess(
    session!.user.id,
    projectId
  );
  if (accessError) return accessError;

  if (member!.role !== "OWNER" && member!.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const embedKey = generateEmbedKey();
  await execute(`UPDATE Project SET embedKey = ?, updatedAt = NOW() WHERE id = ?`, [embedKey, projectId]);

  return NextResponse.json({ embedKey });
}

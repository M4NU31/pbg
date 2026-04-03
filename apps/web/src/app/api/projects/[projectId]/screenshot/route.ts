import { NextRequest, NextResponse } from "next/server";
import { queryOne } from "@/lib/db";
import { requireAuth, requireProjectAccess } from "@/lib/auth-helpers";
import { captureScreenshot } from "@/lib/screenshot";

type Params = { params: Promise<{ projectId: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  const { projectId } = await params;
  const { error, session } = await requireAuth();
  if (error) return error;

  const { error: accessError } = await requireProjectAccess(session!.user.id, projectId);
  if (accessError) return accessError;

  const project = await queryOne<{ siteUrl: string | null }>(
    `SELECT siteUrl FROM Project WHERE id = ?`,
    [projectId]
  );

  if (!project?.siteUrl) {
    return NextResponse.json({ error: "No siteUrl set for this project" }, { status: 400 });
  }

  try {
    await captureScreenshot(projectId, project.siteUrl);
    return NextResponse.json({ ok: true, url: `/screenshots/${projectId}.jpg` });
  } catch (err) {
    console.error("[screenshot]", err);
    return NextResponse.json({ error: "Screenshot failed" }, { status: 500 });
  }
}

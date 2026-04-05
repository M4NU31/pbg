import { NextRequest, NextResponse } from "next/server";
import { queryOne } from "@/lib/db";
import { requireAuth, requireProjectAccess } from "@/lib/auth-helpers";
import { captureScreenshot, getScreenshotPath } from "@/lib/screenshot";
import fs from "fs/promises";

type Params = { params: Promise<{ projectId: string }> };

/** GET — serve the cached screenshot file directly */
export async function GET(_req: NextRequest, { params }: Params) {
  const { projectId } = await params;

  const filePath = getScreenshotPath(projectId);
  try {
    const data = await fs.readFile(filePath);
    return new NextResponse(data, {
      status: 200,
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}

/** POST — capture and save a new screenshot */
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

  // Fire capture in background — do not block the response (Nginx would 504 on slow captures)
  captureScreenshot(projectId, project.siteUrl).catch((err) =>
    console.error("[screenshot retake]", err)
  );
  return NextResponse.json({ ok: true });
}

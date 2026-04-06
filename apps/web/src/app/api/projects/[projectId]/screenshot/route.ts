import { NextRequest, NextResponse } from "next/server";
import { queryOne } from "@/lib/db";
import { requireAuth, requireProjectAccess } from "@/lib/auth-helpers";
import { captureScreenshot, getScreenshotPath, getScreenshotStaticUrl } from "@/lib/screenshot";
import fs from "fs/promises";

type Params = { params: Promise<{ projectId: string }> };

/**
 * GET — returns JSON { ready, url } so the client can poll without following
 * a cross-origin redirect (which would be blocked by CORS).
 */
export async function GET(_req: NextRequest, { params }: Params) {
  const { projectId } = await params;

  const project = await queryOne<{ slug: string | null; screenshotAt: Date | null }>(
    `SELECT slug, screenshotAt FROM Project WHERE id = ?`,
    [projectId]
  );
  const slug = project?.slug ?? projectId;

  if (!project?.screenshotAt) {
    return NextResponse.json({ ready: false, url: null });
  }

  const staticUrl = getScreenshotStaticUrl(slug);
  if (staticUrl) {
    return NextResponse.json({ ready: true, url: staticUrl });
  }

  // Local storage without static URL — check file exists then serve
  const filePath = getScreenshotPath(slug);
  try {
    await fs.access(filePath);
  } catch {
    return NextResponse.json({ ready: false, url: null });
  }

  return NextResponse.json({ ready: true, url: `/api/projects/${projectId}/screenshot/file` });
}

/** POST — capture and save a new screenshot */
export async function POST(_req: NextRequest, { params }: Params) {
  const { projectId } = await params;
  const { error, session } = await requireAuth();
  if (error) return error;

  const { error: accessError } = await requireProjectAccess(session!.user.id, projectId);
  if (accessError) return accessError;

  const project = await queryOne<{ siteUrl: string | null }>(`SELECT siteUrl FROM Project WHERE id = ?`, [projectId]);
  if (!project?.siteUrl) {
    return NextResponse.json({ error: "No siteUrl set for this project" }, { status: 400 });
  }

  captureScreenshot(projectId, project.siteUrl).catch((err) =>
    console.error("[screenshot retake]", err)
  );
  return NextResponse.json({ ok: true });
}

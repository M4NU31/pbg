import { NextRequest, NextResponse } from "next/server";
import { queryOne } from "@/lib/db";
import { requireAuth, requireProjectAccess } from "@/lib/auth-helpers";
import { captureScreenshot, getScreenshotPath, getScreenshotStaticUrl } from "@/lib/screenshot";
import fs from "fs/promises";

type Params = { params: Promise<{ projectId: string }> };

/** GET — check screenshot exists; redirect to static URL if configured, else serve file */
export async function GET(_req: NextRequest, { params }: Params) {
  const { projectId } = await params;

  const project = await queryOne<{ slug: string | null }>(`SELECT slug FROM Project WHERE id = ?`, [projectId]);
  const slug = project?.slug ?? projectId;

  const staticUrl = getScreenshotStaticUrl(slug);
  if (staticUrl) {
    return NextResponse.redirect(staticUrl, { status: 302 });
  }

  // Local storage without static URL — serve file through Node.js
  const filePath = getScreenshotPath(slug);
  try {
    await fs.access(filePath);
  } catch {
    return new NextResponse(null, { status: 404 });
  }

  const data = await fs.readFile(filePath);
  return new NextResponse(data, {
    status: 200,
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=3600",
    },
  });
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

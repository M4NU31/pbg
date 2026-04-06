import { NextRequest, NextResponse } from "next/server";
import { queryOne } from "@/lib/db";
import { getScreenshotPath } from "@/lib/screenshot";
import fs from "fs/promises";

type Params = { params: Promise<{ projectId: string }> };

/** Serves the screenshot file directly (local storage only, no redirect). */
export async function GET(_req: NextRequest, { params }: Params) {
  const { projectId } = await params;

  const project = await queryOne<{ slug: string | null }>(`SELECT slug FROM Project WHERE id = ?`, [projectId]);
  const slug = project?.slug ?? projectId;

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

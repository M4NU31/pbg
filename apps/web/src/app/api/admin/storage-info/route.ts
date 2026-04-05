import { NextResponse } from "next/server";
import { requireAuth, getSystemRole } from "@/lib/auth-helpers";
import { UPLOADS_DIR, UPLOADS_STATIC_URL } from "@/lib/storage";
import { getScreenshotPath, getScreenshotStaticUrl } from "@/lib/screenshot";
import fs from "fs/promises";

/** Admin-only diagnostic: confirms what storage paths are in use. */
export async function GET() {
  const { error, session } = await requireAuth();
  if (error) return error;

  const role = await getSystemRole(session!.user.id, session!.user.email);
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const exampleProjectId = "example-project-id";
  const screenshotPath = getScreenshotPath(exampleProjectId);
  const screenshotStaticUrl = getScreenshotStaticUrl(exampleProjectId);

  // Check if the uploads dir actually exists and is writable
  let dirStatus = "unknown";
  try {
    await fs.access(UPLOADS_DIR, fs.constants.W_OK);
    dirStatus = "exists and writable";
  } catch {
    try {
      await fs.mkdir(UPLOADS_DIR, { recursive: true });
      dirStatus = "created successfully";
    } catch (mkErr) {
      dirStatus = `not writable: ${mkErr}`;
    }
  }

  return NextResponse.json({
    UPLOADS_DIR,
    UPLOADS_STATIC_URL,
    screenshotPath,
    screenshotStaticUrl,
    dirStatus,
    env: {
      LOCAL_UPLOAD_DIR: process.env.LOCAL_UPLOAD_DIR ?? "(not set — using default)",
      UPLOADS_STATIC_URL: process.env.UPLOADS_STATIC_URL ?? "(not set)",
      SCREENSHOTS_DIR: process.env.SCREENSHOTS_DIR ?? "(not set)",
      SCREENSHOTS_STATIC_URL: process.env.SCREENSHOTS_STATIC_URL ?? "(not set)",
      SCREENSHOT_SERVICE_URL: process.env.SCREENSHOT_SERVICE_URL ?? "(not set)",
    },
  });
}

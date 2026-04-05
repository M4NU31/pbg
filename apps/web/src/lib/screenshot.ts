import path from "path";
import fs from "fs/promises";

const SCREENSHOTS_DIR = path.join(process.cwd(), "public", "screenshots");
const SCREENSHOT_SERVICE_URL = process.env.SCREENSHOT_SERVICE_URL || "http://127.0.0.1:8000";

export function getScreenshotPath(projectId: string): string {
  return path.join(SCREENSHOTS_DIR, `${projectId}.jpg`);
}

/**
 * Captures a screenshot of `siteUrl` via the local screenshoter service and
 * saves it to public/screenshots/{projectId}.jpg.
 * Called once on project creation; retake is triggered manually.
 */
export async function captureScreenshot(projectId: string, siteUrl: string): Promise<void> {
  await fs.mkdir(SCREENSHOTS_DIR, { recursive: true });

  const response = await fetch(`${SCREENSHOT_SERVICE_URL}/screenshot/page`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: siteUrl,
      viewport: { width: 1280, height: 800 },
      full_page: false,
      format: "jpeg",
      quality: 80,
    }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`Screenshot service returned ${response.status}: ${(err as { detail?: string }).detail ?? ""}`);
  }

  const buffer = await response.arrayBuffer();
  const outputPath = path.join(SCREENSHOTS_DIR, `${projectId}.jpg`);
  await fs.writeFile(outputPath, Buffer.from(buffer));
}

export async function deleteScreenshot(projectId: string): Promise<void> {
  const filePath = path.join(SCREENSHOTS_DIR, `${projectId}.jpg`);
  try {
    await fs.unlink(filePath);
  } catch {
    // File may not exist yet — ignore
  }
}

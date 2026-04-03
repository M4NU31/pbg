import path from "path";
import fs from "fs/promises";

const SCREENSHOTS_DIR = path.join(process.cwd(), "public", "screenshots");

/**
 * Fetches a screenshot of `siteUrl` via thum.io and saves it permanently
 * to public/screenshots/{projectId}.jpg so it's served locally from disk.
 * Called once on project creation; retake is triggered manually.
 */
export async function captureScreenshot(projectId: string, siteUrl: string): Promise<void> {
  await fs.mkdir(SCREENSHOTS_DIR, { recursive: true });

  // thum.io renders the page and returns a JPEG — we download and cache it locally
  const thumbUrl = `https://image.thum.io/get/width/1280/crop/800/noanimate/${siteUrl}`;

  const response = await fetch(thumbUrl, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; PunchQA/1.0)" },
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    throw new Error(`Screenshot service returned ${response.status}`);
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

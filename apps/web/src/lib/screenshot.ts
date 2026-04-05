import path from "path";
import fs from "fs/promises";
import { query } from "@/lib/db";
import { UPLOADS_DIR, UPLOADS_STATIC_URL } from "@/lib/storage";

const SCREENSHOTS_SUBDIR = "screenshots";

export function getScreenshotPath(projectId: string): string {
  // Backward-compat: honour legacy SCREENSHOTS_DIR if still set separately
  const legacy = process.env.SCREENSHOTS_DIR;
  if (legacy) {
    const dir = path.isAbsolute(legacy) ? legacy : path.join(process.cwd(), legacy);
    return path.join(dir, `${projectId}.jpg`);
  }
  return path.join(UPLOADS_DIR, SCREENSHOTS_SUBDIR, `${projectId}.jpg`);
}

export function getScreenshotStaticUrl(projectId: string): string | null {
  // Backward-compat: honour legacy SCREENSHOTS_STATIC_URL if set
  const legacyBase = process.env.SCREENSHOTS_STATIC_URL?.replace(/\/$/, "");
  if (legacyBase) return `${legacyBase}/${projectId}.jpg`;
  if (UPLOADS_STATIC_URL) return `${UPLOADS_STATIC_URL}/${SCREENSHOTS_SUBDIR}/${projectId}.jpg`;
  return null;
}

export async function captureScreenshot(projectId: string, siteUrl: string): Promise<void> {
  const SCREENSHOT_SERVICE_URL = process.env.SCREENSHOT_SERVICE_URL || "http://127.0.0.1:8000";
  const outputPath = getScreenshotPath(projectId);
  await fs.mkdir(path.dirname(outputPath), { recursive: true });

  const response = await fetch(`${SCREENSHOT_SERVICE_URL}/screenshot/page`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: siteUrl,
      viewport: { width: 1280, height: 800 },
      full_page: false,
      format: "jpeg",
      quality: 80,
      delay_ms: 3000,
    }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`Screenshot service returned ${response.status}: ${(err as { detail?: string }).detail ?? ""}`);
  }

  await fs.writeFile(outputPath, Buffer.from(await response.arrayBuffer()));
  await query(`UPDATE Project SET screenshotAt = NOW() WHERE id = ?`, [projectId]);
}

export async function deleteScreenshot(projectId: string): Promise<void> {
  try { await fs.unlink(getScreenshotPath(projectId)); } catch { /* ignore */ }
}

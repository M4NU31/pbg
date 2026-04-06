import path from "path";
import fs from "fs/promises";
import { query, queryOne } from "@/lib/db";
import { UPLOADS_DIR, screenshotKey, resolveUrl, uploadFile, deleteFile } from "@/lib/storage";

const SCREENSHOT_SERVICE_URL = process.env.SCREENSHOT_SERVICE_URL || "http://127.0.0.1:8000";

// ── Path / URL helpers ────────────────────────────────────────────────────────

/** Absolute local path for a project screenshot (local storage only). */
export function getScreenshotPath(projectSlug: string): string {
  return path.join(UPLOADS_DIR, screenshotKey(projectSlug));
}

/**
 * For the screenshot GET route: returns a redirect URL when the provider
 * serves files publicly (R2, Cloudinary, or local+UPLOADS_STATIC_URL),
 * or null when Node.js must read and stream the file itself.
 */
export function getScreenshotStaticUrl(projectSlug: string): string | null {
  const STORAGE_PROVIDER = process.env.STORAGE_PROVIDER ?? "local";
  if (STORAGE_PROVIDER === "r2" || STORAGE_PROVIDER === "cloudinary") {
    return resolveUrl(screenshotKey(projectSlug));
  }
  const UPLOADS_STATIC_URL = process.env.UPLOADS_STATIC_URL?.replace(/\/$/, "") ?? null;
  if (UPLOADS_STATIC_URL) return `${UPLOADS_STATIC_URL}/${screenshotKey(projectSlug)}`;
  return null;
}

// ── Capture ───────────────────────────────────────────────────────────────────

export async function captureScreenshot(projectId: string, siteUrl: string): Promise<void> {
  // Look up slug so file lands in {slug}/screenshot.jpg
  const row = await queryOne<{ slug: string | null }>(`SELECT slug FROM Project WHERE id = ?`, [projectId]);
  const slug = row?.slug ?? projectId;

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

  const buffer = Buffer.from(await response.arrayBuffer());
  const key = screenshotKey(slug);
  const STORAGE_PROVIDER = process.env.STORAGE_PROVIDER ?? "local";

  if (STORAGE_PROVIDER === "local") {
    const filePath = path.join(UPLOADS_DIR, key);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, buffer);
  } else {
    await uploadFile(buffer, "screenshot.jpg", "image/jpeg", key);
  }

  await query(`UPDATE Project SET screenshotAt = NOW() WHERE id = ?`, [projectId]);
}

export async function deleteScreenshot(projectId: string): Promise<void> {
  const row = await queryOne<{ slug: string | null }>(`SELECT slug FROM Project WHERE id = ?`, [projectId]);
  const slug = row?.slug ?? projectId;
  await deleteFile(screenshotKey(slug));
}

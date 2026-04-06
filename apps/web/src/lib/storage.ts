import fs from "fs/promises";
import path from "path";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const STORAGE_PROVIDER = process.env.STORAGE_PROVIDER ?? "local";

// ── Local storage ────────────────────────────────────────────────────────────
const RAW_UPLOAD_DIR = process.env.LOCAL_UPLOAD_DIR ?? "public/uploads";
export const UPLOADS_DIR = path.isAbsolute(RAW_UPLOAD_DIR)
  ? RAW_UPLOAD_DIR
  : path.join(process.cwd(), RAW_UPLOAD_DIR);

export const UPLOADS_STATIC_URL = process.env.UPLOADS_STATIC_URL?.replace(/\/$/, "") ?? null;

// ── R2 / S3 storage ──────────────────────────────────────────────────────────
let _r2Client: S3Client | null = null;

function getR2Client(): S3Client {
  if (!_r2Client) {
    _r2Client = new S3Client({
      region: "auto",
      endpoint: process.env.R2_ENDPOINT!, // https://<account-id>.r2.cloudflarestorage.com
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
  }
  return _r2Client;
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Upload a file. Returns a permanent public URL.
 *
 * Folder structure (slug = project slug, all providers):
 *   {slug}/screenshot.jpg
 *   {slug}/tasks/{taskNumber}-{hash}.jpg
 *   {slug}/attached-files/{timestamp}-{filename}
 *
 * @param buffer   File contents
 * @param filename Safe filename (no path separators)
 * @param mimeType MIME type
 * @param keyPath  Full relative path including any subfolders, e.g. "my-project/tasks/1-abc.jpg"
 */
export async function uploadFile(
  buffer: Buffer,
  filename: string,
  mimeType: string,
  keyPath = ""
): Promise<string> {
  const key = keyPath || filename;
  if (STORAGE_PROVIDER === "r2") return uploadToR2(buffer, key, mimeType);
  if (STORAGE_PROVIDER === "cloudinary") return uploadToCloudinary(buffer, filename, mimeType);
  return uploadToLocal(buffer, key);
}

/**
 * Delete a file by its key path (same path passed to uploadFile as keyPath).
 * No-ops if the file doesn't exist.
 */
export async function deleteFile(keyPath: string): Promise<void> {
  if (STORAGE_PROVIDER === "r2") {
    try {
      await getR2Client().send(new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET!,
        Key: keyPath,
      }));
    } catch { /* ignore */ }
    return;
  }
  // local
  try { await fs.unlink(path.join(UPLOADS_DIR, keyPath)); } catch { /* ignore */ }
}

/**
 * Build the key path for a project screenshot.
 *   {slug}/screenshot.jpg
 */
export function screenshotKey(projectSlug: string): string {
  return `${projectSlug}/screenshot.jpg`;
}

/**
 * Build the key path for a task screenshot.
 *   {slug}/tasks/{taskNumber}-{shortId}.jpg
 */
export function taskScreenshotKey(projectSlug: string, taskNumber: number, uniqueSuffix: string): string {
  return `${projectSlug}/tasks/${taskNumber}-${uniqueSuffix}.jpg`;
}

/**
 * Build the key path for an attachment.
 *   {slug}/attached-files/{timestamp}-{safeFilename}
 */
export function attachmentKey(projectSlug: string, filename: string): string {
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${projectSlug}/attached-files/${Date.now()}-${safe}`;
}

/**
 * Resolve a key path to a public URL.
 * For local storage: uses UPLOADS_STATIC_URL if set, else relative /uploads/... path.
 * For R2: uses R2_PUBLIC_URL.
 */
export function resolveUrl(keyPath: string): string {
  if (STORAGE_PROVIDER === "r2") {
    const base = process.env.R2_PUBLIC_URL!.replace(/\/$/, "");
    return `${base}/${keyPath}`;
  }
  return UPLOADS_STATIC_URL ? `${UPLOADS_STATIC_URL}/${keyPath}` : `/uploads/${keyPath}`;
}

// ── Providers ─────────────────────────────────────────────────────────────────

async function uploadToLocal(buffer: Buffer, keyPath: string): Promise<string> {
  const filePath = path.join(UPLOADS_DIR, keyPath);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, buffer);
  return resolveUrl(keyPath);
}

async function uploadToR2(buffer: Buffer, keyPath: string, mimeType: string): Promise<string> {
  await getR2Client().send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET!,
    Key: keyPath,
    Body: buffer,
    ContentType: mimeType,
  }));
  return resolveUrl(keyPath);
}

async function uploadToCloudinary(buffer: Buffer, _filename: string, _mimeType: string): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cloudinary: any = (await import("cloudinary" as any)).v2;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "punchbug", resource_type: "auto" },
      (error: unknown, result: { secure_url: string } | undefined) => {
        if (error || !result) return reject(error);
        resolve(result.secure_url);
      }
    );
    uploadStream.end(buffer);
  });
}

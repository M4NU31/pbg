import fs from "fs/promises";
import path from "path";

const STORAGE_PROVIDER = process.env.STORAGE_PROVIDER ?? "local";

// Accepts absolute path (production) or relative to cwd (dev).
// On Hostinger: LOCAL_UPLOAD_DIR=/home/user/domains/site/public_html/uploads
const RAW_UPLOAD_DIR = process.env.LOCAL_UPLOAD_DIR ?? "public/uploads";
export const UPLOADS_DIR = path.isAbsolute(RAW_UPLOAD_DIR)
  ? RAW_UPLOAD_DIR
  : path.join(process.cwd(), RAW_UPLOAD_DIR);

// When set, return absolute static URLs instead of relative /uploads/* paths.
// Must match the public URL for LOCAL_UPLOAD_DIR on the web server.
// e.g. UPLOADS_STATIC_URL=https://yourdomain.com/uploads
export const UPLOADS_STATIC_URL = process.env.UPLOADS_STATIC_URL?.replace(/\/$/, "") ?? null;

/**
 * Upload a file to local disk or Cloudinary.
 * @param subfolder - Organises files: "tasks", "attached-files", etc.
 * @returns Absolute URL (when UPLOADS_STATIC_URL set) or relative /uploads/... path.
 */
export async function uploadFile(
  buffer: Buffer,
  filename: string,
  mimeType: string,
  subfolder = ""
): Promise<string> {
  if (STORAGE_PROVIDER === "cloudinary") {
    return uploadToCloudinary(buffer, filename, mimeType);
  }
  return uploadToLocal(buffer, filename, subfolder);
}

async function uploadToLocal(buffer: Buffer, filename: string, subfolder: string): Promise<string> {
  const dir = subfolder ? path.join(UPLOADS_DIR, subfolder) : UPLOADS_DIR;
  await fs.mkdir(dir, { recursive: true });
  const safeName = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  await fs.writeFile(path.join(dir, safeName), buffer);

  const subpath = subfolder ? `${subfolder}/${safeName}` : safeName;
  return UPLOADS_STATIC_URL ? `${UPLOADS_STATIC_URL}/${subpath}` : `/uploads/${subpath}`;
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

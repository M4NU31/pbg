import fs from "fs/promises";
import path from "path";

const STORAGE_PROVIDER = process.env.STORAGE_PROVIDER ?? "local";
const LOCAL_UPLOAD_DIR =
  process.env.LOCAL_UPLOAD_DIR ?? "public/uploads";

export async function uploadFile(
  buffer: Buffer,
  filename: string,
  mimeType: string
): Promise<string> {
  if (STORAGE_PROVIDER === "cloudinary") {
    return uploadToCloudinary(buffer, filename, mimeType);
  }
  return uploadToLocal(buffer, filename);
}

async function uploadToLocal(buffer: Buffer, filename: string): Promise<string> {
  const uploadsDir = path.join(process.cwd(), LOCAL_UPLOAD_DIR);
  await fs.mkdir(uploadsDir, { recursive: true });
  const safeName = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const filePath = path.join(uploadsDir, safeName);
  await fs.writeFile(filePath, buffer);
  return `/uploads/${safeName}`;
}

async function uploadToCloudinary(
  buffer: Buffer,
  _filename: string,
  _mimeType: string
): Promise<string> {
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

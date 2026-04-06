import { NextRequest, NextResponse } from "next/server";
import { queryOne, withTransaction, connExecute } from "@/lib/db";
import { requireAuth, requireProjectAccess } from "@/lib/auth-helpers";
import { uploadFile, attachmentKey } from "@/lib/storage";
import { randomUUID } from "crypto";

type Params = { params: Promise<{ projectId: string; taskId: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { projectId, taskId } = await params;
  const { error, session } = await requireAuth();
  if (error) return error;

  const { error: accessError } = await requireProjectAccess(
    session!.user.id,
    projectId
  );
  if (accessError) return accessError;

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
  }

  const project = await queryOne<{ slug: string | null }>(`SELECT slug FROM Project WHERE id = ?`, [projectId]);
  const slug = project?.slug ?? projectId;

  const buffer = Buffer.from(await file.arrayBuffer());
  const key = attachmentKey(slug, file.name);
  const url = await uploadFile(buffer, file.name, file.type, key);

  const attachmentId = randomUUID();
  const activityId = randomUUID();
  const userId = session!.user.id;
  const actorName = session!.user.name || session!.user.email || "Unknown";

  await withTransaction(async (conn) => {
    await connExecute(
      conn,
      `INSERT INTO Attachment (id, taskId, filename, storedPath, url, mimeType, sizeBytes, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [attachmentId, taskId, file.name, url, url, file.type, file.size]
    );
    await connExecute(
      conn,
      `INSERT INTO Activity (id, taskId, actorId, actorName, type, toValue, createdAt) VALUES (?, ?, ?, ?, 'ATTACHMENT_ADDED', ?, NOW())`,
      [activityId, taskId, userId, actorName, file.name]
    );
  });

  const attachment = await queryOne<Record<string, unknown>>(
    `SELECT * FROM Attachment WHERE id = ?`,
    [attachmentId]
  );

  return NextResponse.json(attachment, { status: 201 });
}

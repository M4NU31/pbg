import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireProjectAccess } from "@/lib/auth-helpers";
import { uploadFile } from "@/lib/storage";

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

  const buffer = Buffer.from(await file.arrayBuffer());
  const url = await uploadFile(buffer, file.name, file.type);

  const attachment = await prisma.$transaction(async (tx) => {
    const a = await tx.attachment.create({
      data: {
        taskId,
        filename: file.name,
        storedPath: url,
        url,
        mimeType: file.type,
        sizeBytes: file.size,
      },
    });

    await tx.activity.create({
      data: {
        taskId,
        actorId: session!.user.id,
        actorName: session!.user.name || session!.user.email || "Unknown",
        type: "ATTACHMENT_ADDED",
        toValue: file.name,
      },
    });

    return a;
  });

  return NextResponse.json(attachment, { status: 201 });
}

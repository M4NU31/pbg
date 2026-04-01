import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireProjectAccess } from "@/lib/auth-helpers";

type Params = { params: Promise<{ projectId: string; taskId: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { projectId, taskId } = await params;
  const { error, session } = await requireAuth();
  if (error) return error;

  const { error: accessError } = await requireProjectAccess(
    session!.user.id,
    projectId
  );
  if (accessError) return accessError;

  const comments = await prisma.comment.findMany({
    where: { taskId },
    include: { author: { select: { id: true, name: true, image: true } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(comments);
}

export async function POST(req: NextRequest, { params }: Params) {
  const { projectId, taskId } = await params;
  const { error, session } = await requireAuth();
  if (error) return error;

  const { error: accessError } = await requireProjectAccess(
    session!.user.id,
    projectId
  );
  if (accessError) return accessError;

  const body = await req.json();
  const { body: commentBody } = body;

  if (!commentBody?.trim()) {
    return NextResponse.json({ error: "Comment body is required" }, { status: 400 });
  }

  const comment = await prisma.$transaction(async (tx) => {
    const c = await tx.comment.create({
      data: {
        taskId,
        authorId: session!.user.id,
        body: commentBody.trim(),
      },
      include: { author: { select: { id: true, name: true, image: true } } },
    });

    await tx.activity.create({
      data: {
        taskId,
        actorId: session!.user.id,
        actorName: session!.user.name || session!.user.email || "Unknown",
        type: "COMMENT_ADDED",
      },
    });

    return c;
  });

  return NextResponse.json(comment, { status: 201 });
}

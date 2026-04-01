import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireProjectAccess } from "@/lib/auth-helpers";
import { TaskStatus, Priority } from "@prisma/client";

type Params = { params: Promise<{ projectId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { projectId } = await params;
  const { error, session } = await requireAuth();
  if (error) return error;

  const { error: accessError } = await requireProjectAccess(
    session!.user.id,
    projectId
  );
  if (accessError) return accessError;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") as TaskStatus | null;
  const priority = searchParams.get("priority") as Priority | null;
  const assigneeId = searchParams.get("assigneeId");

  const tasks = await prisma.task.findMany({
    where: {
      projectId,
      ...(status && { status }),
      ...(priority && { priority }),
      ...(assigneeId && { assigneeId }),
    },
    include: {
      assignee: { select: { id: true, name: true, image: true } },
      creator: { select: { id: true, name: true } },
      _count: { select: { comments: true, attachments: true } },
    },
    orderBy: [{ status: "asc" }, { taskNumber: "desc" }],
  });

  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest, { params }: Params) {
  const { projectId } = await params;
  const { error, session } = await requireAuth();
  if (error) return error;

  const { error: accessError } = await requireProjectAccess(
    session!.user.id,
    projectId
  );
  if (accessError) return accessError;

  const body = await req.json();
  const { title, description, priority, assigneeId } = body;

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const task = await prisma.$transaction(async (tx) => {
    const agg = await tx.task.aggregate({
      where: { projectId },
      _max: { taskNumber: true },
    });
    const taskNumber = (agg._max.taskNumber ?? 0) + 1;

    const t = await tx.task.create({
      data: {
        projectId,
        title: title.trim(),
        description: description?.trim() || null,
        priority: priority || "MEDIUM",
        assigneeId: assigneeId || null,
        creatorId: session!.user.id,
        taskNumber,
      },
      include: {
        assignee: { select: { id: true, name: true, image: true } },
        creator: { select: { id: true, name: true } },
        _count: { select: { comments: true, attachments: true } },
      },
    });

    await tx.activity.create({
      data: {
        taskId: t.id,
        actorId: session!.user.id,
        actorName: session!.user.name || session!.user.email || "Unknown",
        type: "TASK_CREATED",
      },
    });

    return t;
  });

  return NextResponse.json(task, { status: 201 });
}

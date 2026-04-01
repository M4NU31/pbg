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

  const task = await prisma.task.findFirst({
    where: { id: taskId, projectId },
    include: {
      assignee: { select: { id: true, name: true, image: true, email: true } },
      creator: { select: { id: true, name: true } },
      comments: {
        include: { author: { select: { id: true, name: true, image: true } } },
        orderBy: { createdAt: "asc" },
      },
      attachments: { orderBy: { createdAt: "asc" } },
      activities: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  return NextResponse.json(task);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { projectId, taskId } = await params;
  const { error, session } = await requireAuth();
  if (error) return error;

  const { error: accessError } = await requireProjectAccess(
    session!.user.id,
    projectId
  );
  if (accessError) return accessError;

  const body = await req.json();
  const { title, description, status, priority, assigneeId } = body;

  const existing = await prisma.task.findFirst({
    where: { id: taskId, projectId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  const task = await prisma.$transaction(async (tx) => {
    const updated = await tx.task.update({
      where: { id: taskId },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(status !== undefined && { status }),
        ...(priority !== undefined && { priority }),
        ...(assigneeId !== undefined && { assigneeId: assigneeId || null }),
      },
      include: {
        assignee: { select: { id: true, name: true, image: true } },
        _count: { select: { comments: true, attachments: true } },
      },
    });

    const actorName = session!.user.name || session!.user.email || "Unknown";
    const activities = [];

    if (status && status !== existing.status) {
      activities.push({ type: "STATUS_CHANGED" as const, fromValue: existing.status, toValue: status });
    }
    if (priority && priority !== existing.priority) {
      activities.push({ type: "PRIORITY_CHANGED" as const, fromValue: existing.priority, toValue: priority });
    }
    if (assigneeId !== undefined && assigneeId !== existing.assigneeId) {
      activities.push({ type: "ASSIGNEE_CHANGED" as const, fromValue: existing.assigneeId || null, toValue: assigneeId || null });
    }
    if (title && title !== existing.title) {
      activities.push({ type: "TITLE_CHANGED" as const, fromValue: existing.title, toValue: title });
    }

    for (const act of activities) {
      await tx.activity.create({
        data: { taskId, actorId: session!.user.id, actorName, ...act },
      });
    }

    return updated;
  });

  return NextResponse.json(task);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { projectId, taskId } = await params;
  const { error, session } = await requireAuth();
  if (error) return error;

  const { error: accessError, member } = await requireProjectAccess(
    session!.user.id,
    projectId
  );
  if (accessError) return accessError;

  if (member!.role === "VIEWER" || member!.role === "MEMBER") {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  await prisma.task.deleteMany({
    where: { id: taskId, projectId },
  });

  return new NextResponse(null, { status: 204 });
}

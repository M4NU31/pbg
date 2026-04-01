import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { generateEmbedKey } from "@/lib/utils";

export async function GET() {
  const { error, session } = await requireAuth();
  if (error) return error;

  const memberships = await prisma.projectMember.findMany({
    where: { userId: session!.user.id },
    include: {
      project: {
        include: {
          _count: { select: { tasks: true, members: true } },
          owner: { select: { name: true, image: true } },
        },
      },
    },
    orderBy: { project: { updatedAt: "desc" } },
  });

  return NextResponse.json(memberships.map((m) => ({ ...m.project, role: m.role })));
}

export async function POST(req: NextRequest) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const body = await req.json();
  const { name, description } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "Project name is required" }, { status: 400 });
  }

  const project = await prisma.$transaction(async (tx) => {
    const proj = await tx.project.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        embedKey: generateEmbedKey(),
        ownerId: session!.user.id,
      },
    });
    await tx.projectMember.create({
      data: { projectId: proj.id, userId: session!.user.id, role: "OWNER" },
    });
    return proj;
  });

  return NextResponse.json(project, { status: 201 });
}

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), session: null };
  }
  return { error: null, session };
}

export async function requireProjectMember(
  userId: string,
  projectId: string
) {
  const member = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
    include: { project: true },
  });
  if (!member) return null;
  return member;
}

export async function requireProjectAccess(userId: string, projectId: string) {
  const member = await requireProjectMember(userId, projectId);
  if (!member) {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
      member: null,
    };
  }
  return { error: null, member };
}

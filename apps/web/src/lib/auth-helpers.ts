import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { queryOne, parseJson } from "@/lib/db";
import { NextResponse } from "next/server";

export type SystemRole = "RANK1" | "RANK2" | "RANK3";

// Bootstrap: if DB column doesn't exist yet, fall back to email check
const BOOTSTRAP_ADMIN_EMAIL = "manuel@punchteam.com";

export async function getSystemRole(userId: string, email?: string | null): Promise<SystemRole> {
  if (email === BOOTSTRAP_ADMIN_EMAIL) return "RANK1";
  try {
    const row = await queryOne<{ systemRole: string }>(
      `SELECT systemRole FROM User WHERE id = ?`,
      [userId]
    );
    return (row?.systemRole as SystemRole) ?? "RANK3";
  } catch {
    return "RANK3";
  }
}

export async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), session: null };
  }
  return { error: null, session };
}

type MemberWithProject = {
  id: string;
  projectId: string;
  userId: string;
  role: string;
  joinedAt: Date;
  project: {
    id: string;
    name: string;
    description: string | null;
    embedKey: string;
    allowedDomains: unknown[];
    ownerId: string;
    createdAt: Date;
    updatedAt: Date;
  };
};

export async function requireProjectAccess(
  userId: string,
  projectId: string
): Promise<{ error: null; member: MemberWithProject } | { error: NextResponse; member: null }> {
  const session = await getServerSession(authOptions);
  const systemRole = await getSystemRole(userId, session?.user?.email);

  if (systemRole === "RANK1") {
    const row = await queryOne<Record<string, unknown>>(
      `SELECT p.id as p_id, p.name as p_name, p.description as p_description,
       p.embedKey as p_embedKey, p.allowedDomains as p_allowedDomains,
       p.ownerId as p_ownerId, p.createdAt as p_createdAt, p.updatedAt as p_updatedAt
       FROM Project p WHERE p.id = ?`,
      [projectId]
    );
    if (!row) {
      return { error: NextResponse.json({ error: "Not Found" }, { status: 404 }), member: null };
    }
    return {
      error: null,
      member: {
        id: "admin",
        projectId,
        userId,
        role: "RANK1",
        joinedAt: new Date(),
        project: {
          id: row.p_id as string,
          name: row.p_name as string,
          description: (row.p_description as string | null) ?? null,
          embedKey: row.p_embedKey as string,
          allowedDomains: parseJson(row.p_allowedDomains),
          ownerId: row.p_ownerId as string,
          createdAt: row.p_createdAt as Date,
          updatedAt: row.p_updatedAt as Date,
        },
      },
    };
  }

  const row = await queryOne<Record<string, unknown>>(
    `SELECT pm.id, pm.projectId, pm.userId, pm.role, pm.joinedAt,
     p.id as p_id, p.name as p_name, p.description as p_description,
     p.embedKey as p_embedKey, p.allowedDomains as p_allowedDomains,
     p.ownerId as p_ownerId, p.createdAt as p_createdAt, p.updatedAt as p_updatedAt
     FROM ProjectMember pm JOIN Project p ON pm.projectId = p.id
     WHERE pm.projectId = ? AND pm.userId = ?`,
    [projectId, userId]
  );

  if (!row) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }), member: null };
  }

  return {
    error: null,
    member: {
      id: row.id as string,
      projectId: row.projectId as string,
      userId: row.userId as string,
      role: row.role as string,
      joinedAt: row.joinedAt as Date,
      project: {
        id: row.p_id as string,
        name: row.p_name as string,
        description: (row.p_description as string | null) ?? null,
        embedKey: row.p_embedKey as string,
        allowedDomains: parseJson(row.p_allowedDomains),
        ownerId: row.p_ownerId as string,
        createdAt: row.p_createdAt as Date,
        updatedAt: row.p_updatedAt as Date,
      },
    },
  };
}

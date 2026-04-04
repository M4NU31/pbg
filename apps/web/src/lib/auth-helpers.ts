import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { queryOne, parseJson } from "@/lib/db";
import { NextResponse } from "next/server";

/** System-wide roles stored in User.systemRole */
export type SystemRole = "ADMIN" | "PROJECT_MANAGER" | "MEMBER";

// Bootstrap: the hardcoded super-admin email is always treated as ADMIN
const BOOTSTRAP_ADMIN_EMAIL = "manuel@punchteam.com";

const ROLE_NORM: Record<string, string> = {
  RANK1: "ADMIN", RANK2: "PROJECT_MANAGER", RANK3: "MEMBER",
};

export async function getSystemRole(userId: string, email?: string | null): Promise<SystemRole> {
  if (email === BOOTSTRAP_ADMIN_EMAIL) return "ADMIN";
  try {
    const row = await queryOne<{ systemRole: string }>(
      `SELECT systemRole FROM User WHERE id = ?`,
      [userId]
    );
    const raw = row?.systemRole;
    if (!raw) return "MEMBER";
    return (ROLE_NORM[raw] ?? raw) as SystemRole;
  } catch {
    return "MEMBER";
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

  // System ADMIN bypasses membership — can access any project
  if (systemRole === "ADMIN") {
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
        role: "ADMIN",
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

  // Check project membership exists
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

  // External (non-punchteam) emails are always CLIENT
  // Internal users get their permissions from systemRole — ProjectMember.role is only for membership tracking
  const isExternal = !session?.user?.email?.endsWith("@punchteam.com");
  const effectiveRole = isExternal ? "CLIENT" : systemRole;

  return {
    error: null,
    member: {
      id: row.id as string,
      projectId: row.projectId as string,
      userId: row.userId as string,
      role: effectiveRole,
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

/** True when the role has project-management rights (Admin or Project Manager) */
export function canManageProject(role: string): boolean {
  return role === "ADMIN" || role === "PROJECT_MANAGER";
}

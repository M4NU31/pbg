import { NextRequest, NextResponse } from "next/server";
import { query, queryOne, withTransaction, connExecute, parseJson } from "@/lib/db";
import { requireAuth, getSystemRole } from "@/lib/auth-helpers";
import { generateEmbedKey, toSlug } from "@/lib/utils";
import { captureScreenshot } from "@/lib/screenshot";
import { randomUUID } from "crypto";

export async function GET() {
  const { error, session } = await requireAuth();
  if (error) return error;

  const rows = await query<Record<string, unknown>>(
    `SELECT pm.role,
     p.id, p.slug, p.name, p.description, p.siteUrl, p.embedKey, p.allowedDomains, p.ownerId, p.screenshotAt, p.createdAt, p.updatedAt,
     (SELECT COUNT(*) FROM Task WHERE projectId = p.id) as taskCount,
     (SELECT COUNT(*) FROM ProjectMember WHERE projectId = p.id) as memberCount,
     (SELECT COUNT(*) FROM Comment c JOIN Task t ON c.taskId = t.id WHERE t.projectId = p.id) as commentCount,
     u.name as ownerName, u.image as ownerImage
     FROM ProjectMember pm
     JOIN Project p ON pm.projectId = p.id
     JOIN User u ON p.ownerId = u.id
     WHERE pm.userId = ?
     ORDER BY p.updatedAt DESC`,
    [session!.user.id]
  );

  return NextResponse.json(
    rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      description: row.description,
      siteUrl: row.siteUrl,
      embedKey: row.embedKey,
      allowedDomains: parseJson(row.allowedDomains),
      ownerId: row.ownerId,
      screenshotAt: row.screenshotAt ?? null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      _count: { tasks: Number(row.taskCount), members: Number(row.memberCount), comments: Number(row.commentCount) },
      owner: { name: row.ownerName, image: row.ownerImage },
      role: row.role,
    }))
  );
}

export async function POST(req: NextRequest) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const systemRole = await getSystemRole(session!.user.id, session!.user.email);
  if (systemRole === "MEMBER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { name, description, siteUrl } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "Project name is required" }, { status: 400 });
  }

  const projectId = randomUUID();
  const memberId = randomUUID();
  const embedKey = generateEmbedKey();
  const userId = session!.user.id;

  // Generate a unique slug from the project name
  const baseSlug = toSlug(name.trim()) || "project";
  let slug = baseSlug;
  let suffix = 2;
  while (await queryOne(`SELECT id FROM Project WHERE slug = ?`, [slug])) {
    slug = `${baseSlug}-${suffix++}`;
  }

  const defaultColumns = ["Backlog", "Dev", "Prod", "Review", "Done"];

  await withTransaction(async (conn) => {
    await connExecute(
      conn,
      `INSERT INTO Project (id, slug, name, description, siteUrl, embedKey, allowedDomains, ownerId, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, '[]', ?, NOW(), NOW())`,
      [projectId, slug, name.trim(), description?.trim() || null, siteUrl?.trim() || null, embedKey, userId]
    );
    await connExecute(
      conn,
      `INSERT INTO ProjectMember (id, projectId, userId, role, joinedAt) VALUES (?, ?, ?, 'PROJECT_MANAGER', NOW())`,
      [memberId, projectId, userId]
    );
    for (let i = 0; i < defaultColumns.length; i++) {
      await connExecute(
        conn,
        `INSERT INTO BoardColumn (id, projectId, name, position, createdAt) VALUES (?, ?, ?, ?, NOW())`,
        [randomUUID(), projectId, defaultColumns[i], i]
      );
    }
  });

  const project = await queryOne<Record<string, unknown>>(
    `SELECT * FROM Project WHERE id = ?`,
    [projectId]
  );

  // Fire screenshot capture in the background on the server — does not block the response
  // and runs regardless of which page the client navigates to.
  if (siteUrl?.trim()) {
    captureScreenshot(projectId, siteUrl.trim()).catch(() => {});
  }

  return NextResponse.json(
    { ...project, allowedDomains: parseJson(project!.allowedDomains) },
    { status: 201 }
  );
}

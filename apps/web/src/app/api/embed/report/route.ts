import { NextRequest, NextResponse } from "next/server";
import { queryOne, withTransaction, connExecute, connQueryOne, parseJson } from "@/lib/db";
import { uploadFile } from "@/lib/storage";
import { EmbedReportPayload } from "@/types";
import { randomUUID } from "crypto";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(req: NextRequest) {
  let body: EmbedReportPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400, headers: CORS_HEADERS });
  }

  const { embedKey, title, description, screenshot, domSelector, domHtml, pageUrl, columnId, tagIds, reporterName, guestName, guestEmail, browserMeta, pinX, pinY } = body;
  const resolvedTagIds: string[] = Array.isArray(tagIds) ? tagIds : [];

  if (!embedKey || !title || !domSelector || !pageUrl) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400, headers: CORS_HEADERS });
  }

  const project = await queryOne<Record<string, unknown>>(
    `SELECT * FROM Project WHERE embedKey = ?`,
    [embedKey]
  );
  if (!project) {
    return NextResponse.json({ error: "Invalid embed key" }, { status: 401, headers: CORS_HEADERS });
  }

  // Optional domain validation
  const allowedDomains = parseJson(project.allowedDomains) as string[];
  const origin = req.headers.get("origin");
  if (allowedDomains.length > 0 && origin) {
    const originHost = new URL(origin).hostname;
    const allowed = allowedDomains.some(
      (d) => originHost === d || originHost.endsWith(`.${d}`)
    );
    if (!allowed) {
      return NextResponse.json({ error: "Domain not allowed" }, { status: 403, headers: CORS_HEADERS });
    }
  }

  // Upload screenshot
  let screenshotUrl: string | undefined;
  if (screenshot) {
    try {
      const base64Data = screenshot.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");
      screenshotUrl = await uploadFile(buffer, `screenshot-${Date.now()}.png`, "image/png");
    } catch (err) {
      console.error("Screenshot upload failed:", err);
    }
  }

  const taskId = randomUUID();
  const activityId = randomUUID();
  const projectId = project.id as string;

  const taskNumber = await withTransaction(async (conn) => {
    const maxRow = await connQueryOne<{ maxNum: number | null }>(
      conn,
      `SELECT MAX(taskNumber) as maxNum FROM Task WHERE projectId = ?`,
      [projectId]
    );
    const num = (maxRow?.maxNum ?? 0) + 1;

    // Use the column chosen by the reporter, otherwise fall back to the first column
    let targetColumnId: string | null = null;
    if (columnId) {
      const colRow = await connQueryOne<{ id: string }>(
        conn,
        `SELECT id FROM BoardColumn WHERE id = ? AND projectId = ?`,
        [columnId, projectId]
      );
      targetColumnId = colRow?.id || null;
    }
    if (!targetColumnId) {
      const firstCol = await connQueryOne<{ id: string }>(
        conn,
        `SELECT id FROM BoardColumn WHERE projectId = ? ORDER BY position ASC LIMIT 1`,
        [projectId]
      );
      targetColumnId = firstCol?.id || null;
    }

    await connExecute(
      conn,
      `INSERT INTO Task (
        id, projectId, title, description, taskNumber, status, priority, columnId,
        guestName, guestEmail, screenshotUrl, domSelector, domHtml, pageUrl,
        browserName, browserVersion, osName, osVersion, deviceType,
        screenWidth, screenHeight, viewportWidth, viewportHeight, userAgent,
        pinX, pinY,
        createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, 'BACKLOG', 'MEDIUM', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        taskId, projectId, title.slice(0, 255), description?.slice(0, 5000) || null, num,
        targetColumnId, reporterName || guestName || null, guestEmail || null,
        screenshotUrl || null, domSelector.slice(0, 500), domHtml?.slice(0, 5000) || null,
        pageUrl.slice(0, 2000),
        browserMeta?.browserName || null, browserMeta?.browserVersion || null,
        browserMeta?.osName || null, browserMeta?.osVersion || null,
        browserMeta?.deviceType || null,
        browserMeta?.screenWidth || null, browserMeta?.screenHeight || null,
        browserMeta?.viewportWidth || null, browserMeta?.viewportHeight || null,
        browserMeta?.userAgent?.slice(0, 500) || null,
        pinX ?? null, pinY ?? null,
      ]
    );

    await connExecute(
      conn,
      `INSERT INTO Activity (id, taskId, actorName, type, createdAt) VALUES (?, ?, ?, 'TASK_CREATED', NOW())`,
      [activityId, taskId, reporterName || guestName || "Guest"]
    );

    // Insert tags — silently skip if table doesn't exist yet
    for (const tid of resolvedTagIds) {
      try {
        await connExecute(conn, `INSERT IGNORE INTO TaskTag (taskId, tagId) VALUES (?, ?)`, [taskId, tid]);
      } catch { /* ignore */ }
    }

    return num;
  });

  return NextResponse.json(
    { taskId, taskNumber, message: "Bug reported successfully!" },
    { status: 201, headers: CORS_HEADERS }
  );
}

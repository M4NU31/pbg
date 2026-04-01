import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadFile } from "@/lib/storage";
import { EmbedReportPayload } from "@/types";

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

  const { embedKey, title, description, screenshot, domSelector, domHtml, pageUrl, guestName, guestEmail, browserMeta } = body;

  if (!embedKey || !title || !domSelector || !pageUrl) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400, headers: CORS_HEADERS });
  }

  // Find project by embed key
  const project = await prisma.project.findUnique({ where: { embedKey } });
  if (!project) {
    return NextResponse.json({ error: "Invalid embed key" }, { status: 401, headers: CORS_HEADERS });
  }

  // Optional domain validation
  const allowedDomains = (project.allowedDomains as string[]) ?? [];
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

  // Create task with sequential number
  const task = await prisma.$transaction(async (tx) => {
    const agg = await tx.task.aggregate({
      where: { projectId: project.id },
      _max: { taskNumber: true },
    });
    const taskNumber = (agg._max.taskNumber ?? 0) + 1;

    return tx.task.create({
      data: {
        projectId: project.id,
        title: title.slice(0, 255),
        description: description?.slice(0, 5000) || null,
        taskNumber,
        status: "BACKLOG",
        priority: "MEDIUM",
        guestName: guestName || null,
        guestEmail: guestEmail || null,
        screenshotUrl: screenshotUrl || null,
        domSelector: domSelector.slice(0, 500),
        domHtml: domHtml?.slice(0, 5000) || null,
        pageUrl: pageUrl.slice(0, 2000),
        browserName: browserMeta?.browserName || null,
        browserVersion: browserMeta?.browserVersion || null,
        osName: browserMeta?.osName || null,
        osVersion: browserMeta?.osVersion || null,
        deviceType: browserMeta?.deviceType || null,
        screenWidth: browserMeta?.screenWidth || null,
        screenHeight: browserMeta?.screenHeight || null,
        viewportWidth: browserMeta?.viewportWidth || null,
        viewportHeight: browserMeta?.viewportHeight || null,
        userAgent: browserMeta?.userAgent?.slice(0, 500) || null,
        activities: {
          create: {
            type: "TASK_CREATED",
            actorName: guestName || "Guest",
          },
        },
      },
    });
  });

  return NextResponse.json(
    { taskId: task.id, taskNumber: task.taskNumber, message: "Bug reported successfully!" },
    { status: 201, headers: CORS_HEADERS }
  );
}

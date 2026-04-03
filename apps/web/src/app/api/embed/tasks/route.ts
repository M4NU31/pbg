import { NextRequest, NextResponse } from "next/server";
import { queryOne, query } from "@/lib/db";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const key = searchParams.get("key");
  const pageUrl = searchParams.get("pageUrl");

  if (!key || !pageUrl) {
    return NextResponse.json({ error: "Missing params" }, { status: 400, headers: CORS_HEADERS });
  }

  const project = await queryOne<{ id: string }>(
    `SELECT id FROM Project WHERE embedKey = ?`,
    [key]
  );
  if (!project) {
    return NextResponse.json({ error: "Invalid key" }, { status: 401, headers: CORS_HEADERS });
  }

  // Match tasks by pageUrl base (strip existing pb_element param for comparison)
  const baseUrl = pageUrl.split("?")[0];

  const tasks = await query<{
    id: string; taskNumber: number; title: string;
    domSelector: string | null; screenshotUrl: string | null;
    status: string; priority: string; guestName: string | null;
    createdAt: Date;
  }>(
    `SELECT id, taskNumber, title, domSelector, screenshotUrl, status, priority, guestName, createdAt
     FROM Task
     WHERE projectId = ? AND archivedAt IS NULL AND domSelector IS NOT NULL
     AND (pageUrl = ? OR pageUrl LIKE ? OR pageUrl LIKE ?)
     ORDER BY taskNumber ASC`,
    [project.id, pageUrl, `${baseUrl}?%`, `${baseUrl}%`]
  );

  return NextResponse.json({ projectId: project.id, tasks }, { headers: CORS_HEADERS });
}

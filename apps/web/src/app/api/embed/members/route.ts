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
  const key = req.nextUrl.searchParams.get("key");
  if (!key) return NextResponse.json({ error: "Missing key" }, { status: 400, headers: CORS_HEADERS });

  const project = await queryOne<{ id: string }>(
    `SELECT id FROM Project WHERE embedKey = ?`, [key]
  );
  if (!project) return NextResponse.json({ error: "Invalid key" }, { status: 401, headers: CORS_HEADERS });

  const members = await query<{ id: string; name: string | null }>(
    `SELECT u.id, u.name FROM ProjectMember pm JOIN User u ON pm.userId = u.id WHERE pm.projectId = ? ORDER BY u.name ASC`,
    [project.id]
  );

  return NextResponse.json(members, { headers: CORS_HEADERS });
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { queryOne } from "@/lib/db";

function corsHeaders(req: NextRequest) {
  const origin = req.headers.get("origin") ?? "*";
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Credentials": "true",
  };
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(req) });
}

export async function GET(req: NextRequest) {
  const headers = corsHeaders(req);
  const { searchParams } = new URL(req.url);
  const embedKey = searchParams.get("key");

  if (!embedKey) {
    return NextResponse.json({ allowed: false }, { status: 400, headers });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ allowed: false }, { headers });
  }

  // Check that the user is a member of the project with this embed key
  const member = await queryOne(
    `SELECT pm.id FROM ProjectMember pm
     JOIN Project p ON pm.projectId = p.id
     WHERE p.embedKey = ? AND pm.userId = ?`,
    [embedKey, session.user.id]
  );

  return NextResponse.json({
    allowed: !!member,
    userName: session.user.name || session.user.email || null,
    userId: session.user.id,
  }, { headers });
}

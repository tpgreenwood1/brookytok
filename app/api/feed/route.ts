import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getFeed } from "@/server/queries/feed.queries";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const cursor = searchParams.get("cursor") ?? undefined;
  const limitParam = parseInt(searchParams.get("limit") ?? "20", 10);
  const limit = Number.isFinite(limitParam)
    ? Math.min(Math.max(limitParam, 1), 50)
    : 20;

  const session = await auth.api.getSession({ headers: req.headers });
  const posts = await getFeed(cursor, limit, session?.user.id);
  return NextResponse.json(posts);
}

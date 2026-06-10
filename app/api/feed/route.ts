import { NextRequest, NextResponse } from "next/server";
import { getFeed } from "@/server/queries/feed.queries";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const cursor = searchParams.get("cursor") ?? undefined;
  const limitParam = parseInt(searchParams.get("limit") ?? "20", 10);
  const limit = Number.isFinite(limitParam)
    ? Math.min(Math.max(limitParam, 1), 50)
    : 20;

  const posts = await getFeed(cursor, limit);
  return NextResponse.json(posts);
}

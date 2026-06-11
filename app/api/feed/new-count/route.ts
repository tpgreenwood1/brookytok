import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ count: 0 });

  const sinceId = req.nextUrl.searchParams.get("sinceId");
  if (!sinceId) {
    return NextResponse.json({ error: "sinceId is required" }, { status: 400 });
  }

  const refPost = await prisma.post.findUnique({
    where: { id: sinceId },
    select: { createdAt: true },
  });

  if (!refPost) return NextResponse.json({ count: 0 });

  const count = await prisma.post.count({
    where: { createdAt: { gt: refPost.createdAt } },
  });

  return NextResponse.json({ count });
}

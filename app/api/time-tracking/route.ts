import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function getTodayUtc(): Date {
  return new Date(new Date().toISOString().slice(0, 10));
}

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const date = getTodayUtc();
  const [usage, user] = await Promise.all([
    prisma.dailyUsage.findUnique({
      where: { userId_date: { userId: session.user.id, date } },
      select: { seconds: true },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { dailyTimeLimitMinutes: true },
    }),
  ]);

  return NextResponse.json({
    seconds: usage?.seconds ?? 0,
    limitMinutes: user?.dailyTimeLimitMinutes ?? 5,
  });
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    const contentType = req.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      body = await req.json();
    } else {
      const text = await req.text();
      body = JSON.parse(text);
    }
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const raw = (body as Record<string, unknown>)?.seconds;
  const delta = typeof raw === "number" ? Math.floor(raw) : NaN;
  if (isNaN(delta) || delta < 1 || delta > 120) {
    return NextResponse.json({ error: "seconds must be 1–120" }, { status: 400 });
  }

  const date = getTodayUtc();
  await prisma.dailyUsage.upsert({
    where: { userId_date: { userId: session.user.id, date } },
    update: { seconds: { increment: delta } },
    create: { userId: session.user.id, date, seconds: delta },
  });

  return NextResponse.json({ ok: true });
}

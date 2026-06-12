import { prisma } from "@/lib/prisma";

export async function getAnalyticsTotals() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    totalSessions,
    totalPosts,
    totalComments,
    totalReposts,
    totalLikes,
    totalDislikes,
    totalFollows,
    totalTimeResult,
    recentSignups,
    recentLogins,
    recentPosts,
    recentLikes,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.session.count(),
    prisma.post.count({ where: { parentId: null, repostOfId: null } }),
    prisma.post.count({ where: { parentId: { not: null } } }),
    prisma.post.count({ where: { repostOfId: { not: null } } }),
    prisma.reaction.count({ where: { type: "like" } }),
    prisma.reaction.count({ where: { type: "dislike" } }),
    prisma.follow.count(),
    prisma.dailyUsage.aggregate({ _sum: { seconds: true } }),
    prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.session.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.post.count({
      where: { parentId: null, repostOfId: null, createdAt: { gte: sevenDaysAgo } },
    }),
    prisma.reaction.count({ where: { type: "like", createdAt: { gte: sevenDaysAgo } } }),
  ]);

  const rawSeconds = totalTimeResult._sum.seconds ?? 0;

  return {
    totals: {
      users: totalUsers,
      logins: totalSessions,
      posts: totalPosts,
      comments: totalComments,
      reposts: totalReposts,
      likes: totalLikes,
      dislikes: totalDislikes,
      follows: totalFollows,
      timeSpentHours: Math.round((rawSeconds / 3600) * 10) / 10,
    },
    last7Days: {
      signups: recentSignups,
      logins: recentLogins,
      posts: recentPosts,
      likes: recentLikes,
    },
  };
}

type DailyRow = { date: string; logins: number; posts: number; signups: number };
type RawCountRow = { date: string; count: number };

export async function getDailyActivity(days = 14): Promise<DailyRow[]> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [loginRows, postRows, signupRows] = await Promise.all([
    prisma.$queryRaw<RawCountRow[]>`
      SELECT TO_CHAR(DATE("createdAt"), 'YYYY-MM-DD') as date, COUNT(*)::int as count
      FROM session
      WHERE "createdAt" >= ${since}
      GROUP BY DATE("createdAt")
    `,
    prisma.$queryRaw<RawCountRow[]>`
      SELECT TO_CHAR(DATE("createdAt"), 'YYYY-MM-DD') as date, COUNT(*)::int as count
      FROM post
      WHERE "createdAt" >= ${since} AND "parentId" IS NULL AND "repostOfId" IS NULL
      GROUP BY DATE("createdAt")
    `,
    prisma.$queryRaw<RawCountRow[]>`
      SELECT TO_CHAR(DATE("createdAt"), 'YYYY-MM-DD') as date, COUNT(*)::int as count
      FROM "user"
      WHERE "createdAt" >= ${since}
      GROUP BY DATE("createdAt")
    `,
  ]);

  const map = new Map<string, DailyRow>();
  for (let i = 0; i < days; i++) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    map.set(key, { date: key, logins: 0, posts: 0, signups: 0 });
  }

  for (const row of loginRows) {
    const entry = map.get(row.date);
    if (entry) entry.logins = Number(row.count);
  }
  for (const row of postRows) {
    const entry = map.get(row.date);
    if (entry) entry.posts = Number(row.count);
  }
  for (const row of signupRows) {
    const entry = map.get(row.date);
    if (entry) entry.signups = Number(row.count);
  }

  return Array.from(map.values()).sort((a, b) => b.date.localeCompare(a.date));
}

export async function getTopUsersByPosts(limit = 10) {
  return prisma.user.findMany({
    select: {
      username: true,
      displayName: true,
      name: true,
      _count: { select: { posts: true } },
    },
    orderBy: { posts: { _count: "desc" } },
    take: limit,
  });
}

export async function getStorageStats() {
  const [totals, byType] = await Promise.all([
    prisma.media.aggregate({ _sum: { fileSize: true }, _count: true }),
    prisma.media.groupBy({
      by: ["mediaType"],
      _sum: { fileSize: true },
      _count: true,
    }),
  ]);

  const imageRow = byType.find((r) => r.mediaType === "image");
  const videoRow = byType.find((r) => r.mediaType === "video");

  return {
    totalBytes: totals._sum.fileSize ?? 0,
    totalFiles: totals._count,
    images: { bytes: imageRow?._sum.fileSize ?? 0, count: imageRow?._count ?? 0 },
    videos: { bytes: videoRow?._sum.fileSize ?? 0, count: videoRow?._count ?? 0 },
  };
}

export async function getPendingApprovalCount() {
  return prisma.user.count({ where: { approved: false } });
}

export async function getTopUsersByTime(limit = 10) {
  const grouped = await prisma.dailyUsage.groupBy({
    by: ["userId"],
    _sum: { seconds: true },
    orderBy: { _sum: { seconds: "desc" } },
    take: limit,
  });

  if (grouped.length === 0) return [];

  const userIds = grouped.map((r) => r.userId);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, username: true, displayName: true, name: true },
  });

  const userMap = new Map(users.map((u) => [u.id, u]));

  return grouped.flatMap((r) => {
    const user = userMap.get(r.userId);
    return user ? [{ ...user, totalSeconds: r._sum.seconds ?? 0 }] : [];
  });
}

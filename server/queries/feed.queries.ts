import { prisma } from "@/lib/prisma";
import type { PostWithAuthor } from "@/types";

const authorSelect = {
  id: true,
  username: true,
  displayName: true,
  name: true,
  image: true,
} as const;

export async function getFeed(cursor?: string, limit = 20): Promise<PostWithAuthor[]> {
  return prisma.post.findMany({
    take: limit,
    ...(cursor && { skip: 1, cursor: { id: cursor } }),
    orderBy: { createdAt: "desc" },
    include: { author: { select: authorSelect } },
  });
}

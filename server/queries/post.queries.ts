import { prisma } from "@/lib/prisma";
import type { PostWithAuthor } from "@/types";

const authorSelect = {
  id: true,
  username: true,
  displayName: true,
  name: true,
  image: true,
} as const;

export async function getPostsByUsername(username: string): Promise<PostWithAuthor[]> {
  return prisma.post.findMany({
    where: { author: { username } },
    orderBy: { createdAt: "desc" },
    include: { author: { select: authorSelect } },
  });
}

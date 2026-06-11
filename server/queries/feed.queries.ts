import { prisma } from "@/lib/prisma";
import type { PostWithAuthor } from "@/types";
import { postInclude, mapPosts } from "./_shared";

export async function getFeed(
  cursor?: string,
  limit = 20,
  currentUserId?: string
): Promise<PostWithAuthor[]> {
  const posts = await prisma.post.findMany({
    take: limit,
    ...(cursor && { skip: 1, cursor: { id: cursor } }),
    where: { parentId: null },
    orderBy: { createdAt: "desc" },
    include: postInclude,
  });
  return mapPosts(posts, currentUserId);
}

export async function getFollowingFeed(
  userId: string,
  cursor?: string,
  limit = 20
): Promise<PostWithAuthor[]> {
  const posts = await prisma.post.findMany({
    take: limit,
    ...(cursor && { skip: 1, cursor: { id: cursor } }),
    where: {
      parentId: null,
      author: {
        followers: { some: { followerId: userId } },
      },
    },
    orderBy: { createdAt: "desc" },
    include: postInclude,
  });
  return mapPosts(posts, userId);
}

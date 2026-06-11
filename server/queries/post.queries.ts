import { prisma } from "@/lib/prisma";
import type { PostWithAuthor } from "@/types";
import { postInclude, mapPosts } from "./_shared";

export async function getRepliesByPostId(
  postId: string,
  currentUserId?: string
): Promise<PostWithAuthor[]> {
  const repliesRaw = await prisma.post.findMany({
    where: { parentId: postId },
    orderBy: { createdAt: "asc" },
    include: postInclude,
  });
  return mapPosts(repliesRaw, currentUserId);
}

export async function getPostsByUsername(
  username: string,
  currentUserId?: string
): Promise<PostWithAuthor[]> {
  const posts = await prisma.post.findMany({
    where: { author: { username }, parentId: null },
    orderBy: { createdAt: "desc" },
    include: postInclude,
  });
  return mapPosts(posts, currentUserId);
}

export async function getPostWithReplies(
  postId: string,
  currentUserId?: string
): Promise<{ post: PostWithAuthor; replies: PostWithAuthor[] } | null> {
  const [postRaw, repliesRaw] = await Promise.all([
    prisma.post.findUnique({
      where: { id: postId },
      include: postInclude,
    }),
    prisma.post.findMany({
      where: { parentId: postId },
      orderBy: { createdAt: "asc" },
      include: postInclude,
    }),
  ]);

  if (!postRaw) return null;

  const [postMapped, repliesMapped] = await Promise.all([
    mapPosts([postRaw], currentUserId),
    mapPosts(repliesRaw, currentUserId),
  ]);

  return { post: postMapped[0], replies: repliesMapped };
}

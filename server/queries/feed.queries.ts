import { prisma } from "@/lib/prisma";
import type { PostWithAuthor } from "@/types";

const authorSelect = {
  id: true,
  username: true,
  displayName: true,
  name: true,
  image: true,
} as const;

const reactionSelect = {
  userId: true,
  type: true,
} as const;

function mapReactions(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  posts: any[],
  currentUserId?: string
): PostWithAuthor[] {
  return posts.map((p) => {
    const reactions: { userId: string; type: string }[] = p.reactions ?? [];
    const myReaction = currentUserId
      ? ((reactions.find((r) => r.userId === currentUserId)?.type ?? null) as
          | "like"
          | "dislike"
          | null)
      : null;
    const { reactions: _r, ...rest } = p;
    return {
      ...rest,
      likeCount: reactions.filter((r) => r.type === "like").length,
      dislikeCount: reactions.filter((r) => r.type === "dislike").length,
      myReaction,
    };
  });
}

export async function getFeed(
  cursor?: string,
  limit = 20,
  currentUserId?: string
): Promise<PostWithAuthor[]> {
  const posts = await prisma.post.findMany({
    take: limit,
    ...(cursor && { skip: 1, cursor: { id: cursor } }),
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: authorSelect },
      media: { orderBy: { createdAt: "asc" } },
      reactions: { select: reactionSelect },
    },
  });
  return mapReactions(posts, currentUserId);
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
      author: {
        followers: { some: { followerId: userId } },
      },
    },
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: authorSelect },
      media: { orderBy: { createdAt: "asc" } },
      reactions: { select: reactionSelect },
    },
  });
  return mapReactions(posts, userId);
}

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

export async function getPostsByUsername(
  username: string,
  currentUserId?: string
): Promise<PostWithAuthor[]> {
  const posts = await prisma.post.findMany({
    where: { author: { username } },
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: authorSelect },
      media: { orderBy: { createdAt: "asc" } },
      reactions: { select: reactionSelect },
    },
  });

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

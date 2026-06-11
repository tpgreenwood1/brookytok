import { prisma } from "@/lib/prisma";
import type { PostWithAuthor } from "@/types";

export const authorSelect = {
  id: true,
  username: true,
  displayName: true,
  name: true,
  image: true,
} as const;

export const reactionSelect = {
  userId: true,
  type: true,
} as const;

// The nested repostOf include — one level deep only (reposts of reposts are blocked at write time)
const repostOfInclude = {
  author: { select: authorSelect },
  media: { orderBy: { createdAt: "asc" as const } },
  reactions: { select: reactionSelect },
  _count: { select: { replies: true, reposts: true } },
};

export const postInclude = {
  author: { select: authorSelect },
  media: { orderBy: { createdAt: "asc" as const } },
  reactions: { select: reactionSelect },
  _count: { select: { replies: true, reposts: true } },
  repostOf: { include: repostOfInclude },
};

type RawRepostOf = {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  parentId: string | null;
  repostOfId: string | null;
  author: { id: string; username: string; displayName: string | null; name: string; image: string | null };
  media: { id: string; postId: string; url: string; objectKey: string; mediaType: string; mimeType: string; fileName: string; fileSize: number; width: number | null; height: number | null; durationSeconds: number | null; createdAt: Date }[];
  reactions: { userId: string; type: string }[];
  _count: { replies: number; reposts: number };
};

type RawPost = RawRepostOf & {
  repostOf: RawRepostOf | null;
};

function mapSinglePost(
  p: RawRepostOf,
  currentUserId: string | undefined,
  repostedSet: Set<string>
): PostWithAuthor {
  const reactions = p.reactions ?? [];
  const myReaction = currentUserId
    ? ((reactions.find((r) => r.userId === currentUserId)?.type ?? null) as
        | "like"
        | "dislike"
        | null)
    : null;

  return {
    id: p.id,
    content: p.content,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    authorId: p.authorId,
    parentId: p.parentId,
    repostOfId: p.repostOfId,
    author: p.author,
    media: p.media,
    likeCount: reactions.filter((r) => r.type === "like").length,
    dislikeCount: reactions.filter((r) => r.type === "dislike").length,
    myReaction,
    replyCount: p._count.replies,
    repostCount: p._count.reposts,
    myRepost: repostedSet.has(p.id),
    repostOf: null,
  };
}

function mapPost(
  p: RawPost,
  currentUserId: string | undefined,
  repostedSet: Set<string>
): PostWithAuthor {
  const base = mapSinglePost(p, currentUserId, repostedSet);
  const repostOf = p.repostOf
    ? mapSinglePost(p.repostOf, currentUserId, repostedSet)
    : null;
  return { ...base, repostOf };
}

export async function mapPosts(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  posts: any[],
  currentUserId?: string
): Promise<PostWithAuthor[]> {
  let repostedSet = new Set<string>();

  if (currentUserId && posts.length > 0) {
    // Collect all original post IDs we need to check (top-level + repostOf IDs)
    const originalIds = new Set<string>();
    for (const p of posts) {
      if (p.repostOfId) {
        originalIds.add(p.repostOfId);
      } else {
        originalIds.add(p.id);
      }
    }

    const userReposts = await prisma.post.findMany({
      where: {
        authorId: currentUserId,
        repostOfId: { in: Array.from(originalIds) },
      },
      select: { repostOfId: true },
    });

    repostedSet = new Set(
      userReposts.map((r) => r.repostOfId).filter(Boolean) as string[]
    );
  }

  return posts.map((p) => mapPost(p as RawPost, currentUserId, repostedSet));
}

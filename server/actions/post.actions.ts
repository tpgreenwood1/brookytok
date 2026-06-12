"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  isAllowedMediaType,
  getMediaCategory,
  MAX_ATTACHMENTS_PER_POST,
} from "@/lib/storage/upload";

export interface MediaAttachment {
  objectKey: string;
  url: string;
  mimeType: string;
  fileName: string;
  fileSize: number;
  width?: number;
  height?: number;
  durationSeconds?: number;
}

export async function createPost(
  content: string,
  media: MediaAttachment[] = []
): Promise<{ error?: string; success?: boolean }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "Unauthorized" };

  const weeklyLimit = parseInt(process.env.POST_WEEKLY_LIMIT ?? "20", 10);
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const weeklyCount = await prisma.post.count({
    where: {
      authorId: session.user.id,
      createdAt: { gte: oneWeekAgo },
    },
  });
  if (weeklyCount >= weeklyLimit) {
    return {
      error: `Weekly post limit of ${weeklyLimit} reached. Try again next week.`,
    };
  }

  const trimmed = content.trim();
  const hasMedia = media.length > 0;
  if (!trimmed && !hasMedia) return { error: "Post must have text or media" };
  if (trimmed.length > 280) return { error: "Post exceeds 280 characters" };

  if (media.length > MAX_ATTACHMENTS_PER_POST) {
    return { error: `Maximum ${MAX_ATTACHMENTS_PER_POST} media items per post` };
  }

  for (const item of media) {
    // Security: each objectKey must belong to the authenticated user
    if (!item.objectKey.startsWith(`media/posts/${session.user.id}/`)) {
      return { error: "Invalid media reference" };
    }
    if (!isAllowedMediaType(item.mimeType)) {
      return { error: `Unsupported media type: ${item.mimeType}` };
    }
  }

  await prisma.post.create({
    data: {
      content: trimmed,
      authorId: session.user.id,
      media: {
        create: media.map((m) => ({
          url: m.url,
          objectKey: m.objectKey,
          mediaType: getMediaCategory(m.mimeType),
          mimeType: m.mimeType,
          fileName: m.fileName,
          fileSize: m.fileSize,
          width: m.width ?? null,
          height: m.height ?? null,
          durationSeconds: m.durationSeconds ?? null,
        })),
      },
    },
  });

  revalidatePath("/");
  return { success: true };
}

export async function createComment(
  parentPostId: string,
  content: string,
  media: MediaAttachment[] = []
): Promise<{ error?: string; success?: boolean }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "Unauthorized" };

  const weeklyLimit = parseInt(process.env.POST_WEEKLY_LIMIT ?? "20", 10);
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const weeklyCount = await prisma.post.count({
    where: {
      authorId: session.user.id,
      createdAt: { gte: oneWeekAgo },
    },
  });
  if (weeklyCount >= weeklyLimit) {
    return {
      error: `Weekly post limit of ${weeklyLimit} reached. Try again next week.`,
    };
  }

  const trimmed = content.trim();
  const hasMedia = media.length > 0;
  if (!trimmed && !hasMedia) return { error: "Reply must have text or media" };
  if (trimmed.length > 280) return { error: "Reply exceeds 280 characters" };

  if (media.length > MAX_ATTACHMENTS_PER_POST) {
    return { error: `Maximum ${MAX_ATTACHMENTS_PER_POST} media items per post` };
  }

  for (const item of media) {
    if (!item.objectKey.startsWith(`media/posts/${session.user.id}/`)) {
      return { error: "Invalid media reference" };
    }
    if (!isAllowedMediaType(item.mimeType)) {
      return { error: `Unsupported media type: ${item.mimeType}` };
    }
  }

  const parentPost = await prisma.post.findUnique({
    where: { id: parentPostId },
    select: { id: true, parentId: true },
  });
  if (!parentPost) return { error: "Post not found" };
  if (parentPost.parentId !== null) return { error: "Cannot reply to a reply" };

  await prisma.post.create({
    data: {
      content: trimmed,
      authorId: session.user.id,
      parentId: parentPostId,
      media: {
        create: media.map((m) => ({
          url: m.url,
          objectKey: m.objectKey,
          mediaType: getMediaCategory(m.mimeType),
          mimeType: m.mimeType,
          fileName: m.fileName,
          fileSize: m.fileSize,
          width: m.width ?? null,
          height: m.height ?? null,
          durationSeconds: m.durationSeconds ?? null,
        })),
      },
    },
  });

  revalidatePath(`/post/${parentPostId}`);
  return { success: true };
}

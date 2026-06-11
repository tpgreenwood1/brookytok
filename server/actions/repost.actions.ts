"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function toggleRepost(
  postId: string
): Promise<{ error?: string; success?: boolean; reposted?: boolean }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "Unauthorized" };

  const target = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true, authorId: true, parentId: true, repostOfId: true },
  });

  if (!target) return { error: "Post not found" };
  if (target.authorId === session.user.id) return { error: "Cannot repost your own post" };
  if (target.parentId !== null) return { error: "Cannot repost a comment" };
  if (target.repostOfId !== null) return { error: "Cannot repost a repost" };

  const existing = await prisma.post.findFirst({
    where: { authorId: session.user.id, repostOfId: postId },
    select: { id: true },
  });

  if (existing) {
    await prisma.post.delete({ where: { id: existing.id } });
    revalidatePath("/");
    revalidatePath(`/${session.user.username}`);
    return { success: true, reposted: false };
  }

  await prisma.post.create({
    data: {
      content: "",
      authorId: session.user.id,
      repostOfId: postId,
    },
  });

  revalidatePath("/");
  revalidatePath(`/${session.user.username}`);
  return { success: true, reposted: true };
}

"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function reactToPost(
  postId: string,
  type: "like" | "dislike"
): Promise<{ error?: string; success?: boolean }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "Unauthorized" };

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) return { error: "Post not found" };

  await prisma.reaction.upsert({
    where: { postId_userId: { postId, userId: session.user.id } },
    update: { type },
    create: { postId, userId: session.user.id, type },
  });

  revalidatePath("/");
  return { success: true };
}

export async function removeReaction(
  postId: string
): Promise<{ error?: string; success?: boolean }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "Unauthorized" };

  await prisma.reaction.deleteMany({
    where: { postId, userId: session.user.id },
  });

  revalidatePath("/");
  return { success: true };
}

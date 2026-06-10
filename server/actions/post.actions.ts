"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function createPost(
  content: string
): Promise<{ error?: string; success?: boolean }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "Unauthorized" };

  const trimmed = content.trim();
  if (!trimmed) return { error: "Post cannot be empty" };
  if (trimmed.length > 280) return { error: "Post exceeds 280 characters" };

  await prisma.post.create({
    data: { content: trimmed, authorId: session.user.id },
  });

  revalidatePath("/");
  return { success: true };
}

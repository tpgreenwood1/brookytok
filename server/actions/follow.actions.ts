"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function followUser(
  username: string
): Promise<{ error?: string; success?: boolean }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "Unauthorized" };

  const target = await prisma.user.findUnique({ where: { username } });
  if (!target) return { error: "User not found" };
  if (target.id === session.user.id) return { error: "Cannot follow yourself" };

  await prisma.follow.upsert({
    where: {
      followerId_followingId: {
        followerId: session.user.id,
        followingId: target.id,
      },
    },
    update: {},
    create: {
      followerId: session.user.id,
      followingId: target.id,
    },
  });

  revalidatePath(`/${username}`);
  return { success: true };
}

export async function unfollowUser(
  username: string
): Promise<{ error?: string; success?: boolean }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "Unauthorized" };

  const target = await prisma.user.findUnique({ where: { username } });
  if (!target) return { error: "User not found" };

  await prisma.follow.deleteMany({
    where: {
      followerId: session.user.id,
      followingId: target.id,
    },
  });

  revalidatePath(`/${username}`);
  return { success: true };
}

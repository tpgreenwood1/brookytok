import { prisma } from "@/lib/prisma";
import type { UserProfile } from "@/types";

export async function getUserByUsername(username: string): Promise<UserProfile | null> {
  return prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      displayName: true,
      name: true,
      bio: true,
      image: true,
      createdAt: true,
      _count: {
        select: {
          posts: true,
          followers: true,
          following: true,
        },
      },
    },
  });
}

export async function getIsFollowing(
  followerId: string,
  followingId: string
): Promise<boolean> {
  const follow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: { followerId, followingId },
    },
  });
  return !!follow;
}

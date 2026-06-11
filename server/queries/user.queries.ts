import { prisma } from "@/lib/prisma";
import type { UserProfile, UserSearchResult } from "@/types";

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
      bannerImage: true,
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

export async function searchUsers(
  query: string,
  currentUserId: string,
  limit = 20
): Promise<UserSearchResult[]> {
  type UserRow = {
    id: string;
    username: string;
    displayName: string | null;
    name: string;
    image: string | null;
    bio: string | null;
    _count: { followers: number };
  };

  const users: UserRow[] = await prisma.user.findMany({
    where: {
      AND: [
        { id: { not: currentUserId } },
        {
          OR: [
            { username: { contains: query, mode: "insensitive" } },
            { displayName: { contains: query, mode: "insensitive" } },
            { name: { contains: query, mode: "insensitive" } },
          ],
        },
      ],
    },
    take: limit,
    select: {
      id: true,
      username: true,
      displayName: true,
      name: true,
      image: true,
      bio: true,
      _count: { select: { followers: true } },
    },
  });

  if (users.length === 0) return [];

  const followStatuses: { followingId: string }[] = await prisma.follow.findMany({
    where: {
      followerId: currentUserId,
      followingId: { in: users.map((u) => u.id) },
    },
    select: { followingId: true },
  });

  const followingSet = new Set(followStatuses.map((f) => f.followingId));

  return users.map((user) => ({ ...user, isFollowing: followingSet.has(user.id) }));
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

import { notFound } from "next/navigation";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { Shell } from "@/components/layout/shell";
import { ProfileHeader } from "@/components/user/profile-header";
import { PostList } from "@/components/post/post-list";
import { getUserByUsername, getIsFollowing } from "@/server/queries/user.queries";
import { getPostsByUsername } from "@/server/queries/post.queries";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({
  params,
}: ProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  const user = await getUserByUsername(username);
  if (!user) return { title: "User not found" };
  const displayName = user.displayName ?? user.name;
  return {
    title: `${displayName} (@${username})`,
    description: user.bio ?? `${displayName}'s profile on brooky-tok`,
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;

  const session = await auth.api.getSession({ headers: await headers() });
  const [user, posts] = await Promise.all([
    getUserByUsername(username),
    getPostsByUsername(username, session?.user.id),
  ]);

  if (!user) notFound();

  const isOwnProfile = session?.user.id === user.id;
  const isFollowing =
    !isOwnProfile && session
      ? await getIsFollowing(session.user.id, user.id)
      : false;

  return (
    <Shell>
      <ProfileHeader
        user={user}
        isOwnProfile={isOwnProfile}
        isFollowing={isFollowing}
      />
      <PostList posts={posts} emptyMessage="No posts yet." />
    </Shell>
  );
}

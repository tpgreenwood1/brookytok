import { redirect } from "next/navigation";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { Shell } from "@/components/layout/shell";
import { PostComposer } from "@/components/post/post-composer";
import { PostList } from "@/components/post/post-list";
import { FeedTabs } from "@/components/feed/feed-tabs";
import { getFeed, getFollowingFeed } from "@/server/queries/feed.queries";
import type { SessionUser } from "@/types";

export const metadata: Metadata = { title: "Home" };

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/signin");

  const { tab } = await searchParams;
  const activeTab = tab === "following" ? "following" : "for-you";
  const currentUser = session.user as unknown as SessionUser;

  const posts =
    activeTab === "following"
      ? await getFollowingFeed(currentUser.id)
      : await getFeed();

  const emptyMessage =
    activeTab === "following"
      ? "Follow some people to see their posts here."
      : "No posts yet. Be the first to post something!";

  return (
    <Shell>
      <div className="sticky top-0 bg-white/90 backdrop-blur-sm border-b border-slate-200 px-4 py-3 z-10">
        <h1 className="text-lg font-bold text-slate-900">Home</h1>
      </div>
      <FeedTabs activeTab={activeTab} />
      <PostComposer />
      <PostList posts={posts} emptyMessage={emptyMessage} />
    </Shell>
  );
}

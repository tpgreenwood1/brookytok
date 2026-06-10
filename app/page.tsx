import { redirect } from "next/navigation";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { Shell } from "@/components/layout/shell";
import { PostComposer } from "@/components/post/post-composer";
import { PostList } from "@/components/post/post-list";
import { getFeed } from "@/server/queries/feed.queries";

export const metadata: Metadata = { title: "Home" };

export default async function HomePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/signin");

  const posts = await getFeed();

  return (
    <Shell>
      <div className="sticky top-0 bg-white/90 backdrop-blur-sm border-b border-slate-200 px-4 py-3 z-10">
        <h1 className="text-lg font-bold text-slate-900">Home</h1>
      </div>
      <PostComposer />
      <PostList
        posts={posts}
        emptyMessage="No posts yet. Be the first to post something!"
      />
    </Shell>
  );
}

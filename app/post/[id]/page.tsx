import { notFound } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { Shell } from "@/components/layout/shell";
import { PostCard } from "@/components/post/post-card";
import { PostList } from "@/components/post/post-list";
import { ReplyComposer } from "@/components/post/reply-composer";
import { getPostWithReplies } from "@/server/queries/post.queries";
import type { SessionUser } from "@/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const result = await getPostWithReplies(id);
  if (!result) return { title: "Post not found" };

  const { post } = result;
  const author = post.author.displayName ?? post.author.name;
  const snippet = post.content ? post.content.slice(0, 60) : "Post";
  return { title: `${author}: ${snippet}` };
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  const currentUser = session?.user as SessionUser | undefined;

  const result = await getPostWithReplies(id, currentUser?.id);
  if (!result) notFound();

  const { post, replies } = result;

  return (
    <Shell>
      {/* Header */}
      <div className="sticky top-0 bg-background border-b border-border px-3 h-[44px] flex items-center gap-3 z-10">
        <Link
          href="/"
          aria-label="Go back"
          className="flex items-center justify-center w-8 h-8 text-foreground"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-base font-semibold">Post</h1>
      </div>

      {/* The post itself in detail view */}
      <PostCard post={post} variant="detail" />

      {/* Reply composer — only for signed-in users */}
      {session && (
        <ReplyComposer
          parentPostId={post.id}
          parentAuthorUsername={post.author.username}
        />
      )}

      {/* Flat replies list */}
      <PostList
        posts={replies}
        emptyMessage="No replies yet. Be the first to reply!"
      />
    </Shell>
  );
}

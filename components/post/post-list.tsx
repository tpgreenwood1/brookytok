import { MessageSquare } from "lucide-react";
import { PostCard } from "./post-card";
import type { PostWithAuthor } from "@/types";

interface PostListProps {
  posts: PostWithAuthor[];
  emptyMessage?: string;
}

export function PostList({
  posts,
  emptyMessage = "No posts yet.",
}: PostListProps) {
  if (posts.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center gap-3 text-center px-8">
        <MessageSquare className="w-12 h-12 text-fg-muted opacity-40" strokeWidth={1.5} />
        <p className="text-base font-semibold text-foreground">Nothing here yet</p>
        <p className="text-sm text-fg-muted">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <section aria-label="Posts">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </section>
  );
}

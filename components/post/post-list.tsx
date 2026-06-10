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
      <div className="py-16 text-center">
        <p className="text-slate-500">{emptyMessage}</p>
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

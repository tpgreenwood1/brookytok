import Link from "next/link";
import { MessageCircle, Repeat2 } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { MediaGrid } from "@/components/media/media-grid";
import { ReactionButtons } from "@/components/post/reaction-buttons";
import { formatRelativeTime } from "@/lib/utils";
import type { PostWithAuthor } from "@/types";

interface PostCardProps {
  post: PostWithAuthor;
}

export function PostCard({ post }: PostCardProps) {
  const displayName = post.author.displayName ?? post.author.name;

  return (
    <article className="flex gap-3 py-4 px-4 border-b border-slate-100 hover:bg-slate-50/60 transition-colors">
      <Link
        href={`/${post.author.username}`}
        className="flex-shrink-0 mt-0.5"
        aria-label={`View ${displayName}'s profile`}
      >
        <Avatar src={post.author.image} name={displayName} size="md" />
      </Link>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-1.5 flex-wrap leading-tight">
          <Link
            href={`/${post.author.username}`}
            className="font-semibold text-slate-900 hover:underline underline-offset-2 truncate"
          >
            {displayName}
          </Link>
          <Link
            href={`/${post.author.username}`}
            className="text-sm text-slate-500 hover:underline underline-offset-2"
          >
            @{post.author.username}
          </Link>
          <span className="text-slate-300 text-sm" aria-hidden>·</span>
          <time
            className="text-sm text-slate-400"
            dateTime={new Date(post.createdAt).toISOString()}
            title={new Date(post.createdAt).toLocaleString()}
          >
            {formatRelativeTime(post.createdAt)}
          </time>
        </div>
        {post.content && (
          <p className="text-slate-900 mt-1.5 leading-relaxed break-words whitespace-pre-wrap">
            {post.content}
          </p>
        )}
        {post.media.length > 0 && <MediaGrid media={post.media} />}
        <div className="flex gap-5 mt-3 -ml-1.5" aria-label="Post actions">
          <button
            type="button"
            aria-label="Reply"
            className="flex items-center gap-1.5 text-slate-400 hover:text-sky-500 transition-colors group"
          >
            <span className="p-1.5 rounded-full group-hover:bg-sky-50 transition-colors">
              <MessageCircle className="w-4 h-4" />
            </span>
          </button>
          <button
            type="button"
            aria-label="Repost"
            className="flex items-center gap-1.5 text-slate-400 hover:text-emerald-500 transition-colors group"
          >
            <span className="p-1.5 rounded-full group-hover:bg-emerald-50 transition-colors">
              <Repeat2 className="w-4 h-4" />
            </span>
          </button>
          <ReactionButtons
            postId={post.id}
            initialLikeCount={post.likeCount}
            initialDislikeCount={post.dislikeCount}
            initialMyReaction={post.myReaction}
          />
        </div>
      </div>
    </article>
  );
}

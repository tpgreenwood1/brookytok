"use client";

import { useState } from "react";
import Link from "next/link";
import { MoreHorizontal, Bookmark, Send } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { MediaGrid } from "@/components/media/media-grid";
import { ReactionButtons } from "@/components/post/reaction-buttons";
import { CommentButton } from "@/components/post/comment-button";
import { RepostButton } from "@/components/post/repost-button";
import { RepliesSection } from "@/components/post/replies-section";
import { formatRelativeTime } from "@/lib/utils";
import type { PostWithAuthor } from "@/types";

interface PostCardProps {
  post: PostWithAuthor;
  variant?: "feed" | "detail";
}

export function PostCard({ post, variant = "feed" }: PostCardProps) {
  const [showReplies, setShowReplies] = useState(false);

  const effectivePost = post.repostOf ?? post;
  const displayName = effectivePost.author.displayName ?? effectivePost.author.name;

  const canExpand = effectivePost.parentId === null && variant !== "detail";

  return (
    <>
      <article className="border-b border-border">
        {/* Repost attribution */}
        {post.repostOf && (
          <div className="flex items-center gap-1.5 px-3 pt-2 pb-0 text-xs text-fg-muted">
            <Send className="w-3 h-3" />
            <Link
              href={`/${post.author.username}`}
              className="font-semibold hover:underline underline-offset-2"
            >
              {post.author.displayName ?? post.author.name}
            </Link>
            <span>shared</span>
          </div>
        )}

        {/* Post header — 52px, 12px padding */}
        <div className="flex items-center gap-2 px-3 h-[52px]">
          <Link
            href={`/${effectivePost.author.username}`}
            aria-label={`View ${displayName}'s profile`}
            className="flex-shrink-0"
          >
            <Avatar
              src={effectivePost.author.image}
              name={displayName}
              size="sm"
            />
          </Link>
          <div className="flex-1 min-w-0">
            <Link
              href={`/${effectivePost.author.username}`}
              className="font-semibold text-sm text-foreground hover:underline underline-offset-2 truncate block"
            >
              {displayName}
            </Link>
          </div>
          <button
            type="button"
            aria-label="More options"
            className="flex items-center justify-center w-8 h-8 -mr-1 text-foreground"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Full-width media — no padding, no border-radius */}
        {effectivePost.media.length > 0 && (
          <Link
            href={`/post/${effectivePost.id}`}
            tabIndex={-1}
            aria-label="View post"
          >
            <MediaGrid media={effectivePost.media} />
          </Link>
        )}

        {/* Action bar — 12px padding, 8px vertical */}
        <div className="px-3 pt-2 pb-1" aria-label="Post actions">
          <div className="flex items-center">
            <div className="flex items-center gap-4">
              <ReactionButtons
                postId={effectivePost.id}
                initialLikeCount={effectivePost.likeCount}
                initialDislikeCount={effectivePost.dislikeCount}
                initialMyReaction={effectivePost.myReaction}
              />
              <CommentButton
                post={effectivePost}
                showCount={false}
                isExpanded={canExpand ? showReplies : undefined}
                onToggle={canExpand ? () => setShowReplies((v) => !v) : undefined}
              />
              {!effectivePost.repostOfId && (
                <RepostButton
                  postId={effectivePost.id}
                  postAuthorId={effectivePost.authorId}
                  initialRepostCount={effectivePost.repostCount}
                  initialMyRepost={effectivePost.myRepost}
                />
              )}
            </div>
            <button
              type="button"
              aria-label="Save post"
              className="ml-auto flex items-center justify-center text-foreground"
            >
              <Bookmark className="w-6 h-6 stroke-[1.5]" />
            </button>
          </div>
        </div>

        {/* Caption — username inline bold prefix + content */}
        {effectivePost.content && (
          <div className="px-3 pb-1">
            <p className="text-sm text-foreground leading-relaxed break-words whitespace-pre-wrap">
              <Link
                href={`/${effectivePost.author.username}`}
                className="font-semibold mr-1.5 hover:underline underline-offset-2"
              >
                {displayName}
              </Link>
              {effectivePost.content}
            </p>
          </div>
        )}

        {/* "View all X comments" link */}
        {effectivePost.replyCount > 0 && variant !== "detail" && (
          <div className="px-3 pb-1">
            <button
              type="button"
              onClick={canExpand ? () => setShowReplies((v) => !v) : undefined}
              className="text-sm text-fg-muted hover:text-foreground transition-colors"
            >
              View all {effectivePost.replyCount}{" "}
              {effectivePost.replyCount === 1 ? "comment" : "comments"}
            </button>
          </div>
        )}

        {/* Timestamp */}
        <div className="px-3 pb-3 pt-0.5">
          <time
            className="text-[11px] text-fg-muted uppercase tracking-wide"
            dateTime={new Date(effectivePost.createdAt).toISOString()}
            title={new Date(effectivePost.createdAt).toLocaleString()}
          >
            {variant === "detail"
              ? new Date(effectivePost.createdAt).toLocaleString()
              : formatRelativeTime(effectivePost.createdAt)}
          </time>
        </div>
      </article>

      {canExpand && showReplies && (
        <RepliesSection
          postId={effectivePost.id}
          parentAuthorUsername={effectivePost.author.username}
        />
      )}
    </>
  );
}

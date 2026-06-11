"use client";

import { useState } from "react";
import Link from "next/link";
import { Repeat2 } from "lucide-react";
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

  // For a repost shell, show the original post's content but attribute the repost
  const effectivePost = post.repostOf ?? post;
  const displayName = effectivePost.author.displayName ?? effectivePost.author.name;

  // Only top-level posts on non-detail pages get the inline expansion
  const canExpand = effectivePost.parentId === null && variant !== "detail";

  return (
    <>
      <article className="flex gap-3 py-4 px-4 border-b border-border-muted">
        <div className="flex-shrink-0 flex flex-col items-center">
          <Link
            href={`/${effectivePost.author.username}`}
            className="mt-0.5"
            aria-label={`View ${displayName}'s profile`}
          >
            <Avatar src={effectivePost.author.image} name={displayName} size="md" />
          </Link>
        </div>

        <div className="flex-1 min-w-0">
          {/* Repost attribution */}
          {post.repostOf && (
            <div className="flex items-center gap-1 text-xs text-fg-muted mb-1">
              <Repeat2 className="w-3 h-3" />
              <Link
                href={`/${post.author.username}`}
                className="font-medium hover:underline underline-offset-2"
              >
                {post.author.displayName ?? post.author.name}
              </Link>
              <span>reposted</span>
            </div>
          )}

          {/* Author row */}
          <div className="flex items-baseline justify-between gap-1.5 leading-tight">
            <div className="flex items-baseline gap-1.5 flex-wrap min-w-0">
              <Link
                href={`/${effectivePost.author.username}`}
                className="font-semibold text-foreground hover:underline underline-offset-2 truncate"
              >
                {displayName}
              </Link>
              <Link
                href={`/${effectivePost.author.username}`}
                className="text-sm text-fg-muted hover:underline underline-offset-2 truncate"
              >
                @{effectivePost.author.username}
              </Link>
            </div>
            <time
              className="text-xs text-fg-muted flex-shrink-0"
              dateTime={new Date(effectivePost.createdAt).toISOString()}
              title={new Date(effectivePost.createdAt).toLocaleString()}
            >
              {variant === "detail"
                ? new Date(effectivePost.createdAt).toLocaleString()
                : formatRelativeTime(effectivePost.createdAt)}
            </time>
          </div>

          {/* Content + media — clicking navigates to the post detail page */}
          <Link
            href={`/post/${effectivePost.id}`}
            className="block mt-1 rounded-lg hover:opacity-90 transition-opacity"
            tabIndex={-1}
          >
            {effectivePost.content && (
              <p
                className={
                  variant === "detail"
                    ? "text-foreground text-lg leading-relaxed break-words whitespace-pre-wrap"
                    : "text-foreground leading-relaxed break-words whitespace-pre-wrap"
                }
              >
                {effectivePost.content}
              </p>
            )}
            {effectivePost.media.length > 0 && (
              <MediaGrid media={effectivePost.media} />
            )}
          </Link>

          {/* Action bar — standalone, does not navigate */}
          <div className="flex items-center gap-4 mt-3 -ml-1.5" aria-label="Post actions">
            <CommentButton
              post={effectivePost}
              isExpanded={canExpand ? showReplies : undefined}
              onToggle={canExpand ? () => setShowReplies((v) => !v) : undefined}
            />
            {/* Hide repost button on repost shells — can't repost a repost */}
            {!effectivePost.repostOfId && (
              <RepostButton
                postId={effectivePost.id}
                postAuthorId={effectivePost.authorId}
                initialRepostCount={effectivePost.repostCount}
                initialMyRepost={effectivePost.myRepost}
              />
            )}
            <ReactionButtons
              postId={effectivePost.id}
              initialLikeCount={effectivePost.likeCount}
              initialDislikeCount={effectivePost.dislikeCount}
              initialMyReaction={effectivePost.myReaction}
            />
          </div>
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

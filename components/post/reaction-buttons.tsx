"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { Heart, ThumbsDown } from "lucide-react";
import { reactToPost, removeReaction } from "@/server/actions/reaction.actions";
import { cn } from "@/lib/utils";

interface ReactionButtonsProps {
  postId: string;
  initialLikeCount: number;
  initialDislikeCount: number;
  initialMyReaction: "like" | "dislike" | null;
}

export function ReactionButtons({
  postId,
  initialLikeCount,
  initialDislikeCount,
  initialMyReaction,
}: ReactionButtonsProps) {
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [dislikeCount, setDislikeCount] = useState(initialDislikeCount);
  const [myReaction, setMyReaction] = useState(initialMyReaction);
  const [isPending, startTransition] = useTransition();
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);
  const likeAnimTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (likeAnimTimeout.current) clearTimeout(likeAnimTimeout.current);
    };
  }, []);

  function handleReact(type: "like" | "dislike") {
    const prev = myReaction;
    const isRemoving = prev === type;

    if (type === "like") {
      setIsLikeAnimating(true);
      if (likeAnimTimeout.current) clearTimeout(likeAnimTimeout.current);
      likeAnimTimeout.current = setTimeout(() => setIsLikeAnimating(false), 350);
    }

    // Optimistic update
    setMyReaction(isRemoving ? null : type);
    if (type === "like") {
      setLikeCount((c) => c + (isRemoving ? -1 : 1));
      if (prev === "dislike") setDislikeCount((c) => c - 1);
    } else {
      setDislikeCount((c) => c + (isRemoving ? -1 : 1));
      if (prev === "like") setLikeCount((c) => c - 1);
    }

    startTransition(async () => {
      const result = isRemoving
        ? await removeReaction(postId)
        : await reactToPost(postId, type);

      if (result.error) {
        // Revert on failure
        setMyReaction(prev);
        if (type === "like") {
          setLikeCount((c) => c + (isRemoving ? 1 : -1));
          if (prev === "dislike") setDislikeCount((c) => c + 1);
        } else {
          setDislikeCount((c) => c + (isRemoving ? 1 : -1));
          if (prev === "like") setLikeCount((c) => c + 1);
        }
      }
    });
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => handleReact("like")}
        disabled={isPending}
        aria-label={myReaction === "like" ? "Remove like" : "Like"}
        aria-pressed={myReaction === "like"}
        className={cn(
          "flex items-center gap-1.5 transition-colors group",
          myReaction === "like"
            ? "text-destructive"
            : "text-fg-muted hover:text-destructive"
        )}
      >
        <span
          className={cn(
            "p-1.5 rounded-full transition-colors",
            myReaction === "like"
              ? "bg-red-50 dark:bg-red-950/30"
              : "group-hover:bg-red-50 dark:group-hover:bg-red-950/30"
          )}
        >
          <Heart
            className={cn(
              "w-4 h-4",
              isLikeAnimating && "animate-bounce-like",
              myReaction === "like" && "fill-destructive"
            )}
          />
        </span>
        {likeCount > 0 && (
          <span className="text-xs tabular-nums">{likeCount}</span>
        )}
      </button>

      <button
        type="button"
        onClick={() => handleReact("dislike")}
        disabled={isPending}
        aria-label={myReaction === "dislike" ? "Remove dislike" : "Dislike"}
        aria-pressed={myReaction === "dislike"}
        className={cn(
          "flex items-center gap-1 transition-colors group",
          myReaction === "dislike"
            ? "text-fg-muted"
            : "text-fg-muted/60 hover:text-fg-muted"
        )}
      >
        <span className="p-1 rounded-full transition-colors group-hover:bg-surface">
          <ThumbsDown
            className={cn(
              "w-3.5 h-3.5",
              myReaction === "dislike" && "fill-current"
            )}
          />
        </span>
        {dislikeCount > 0 && (
          <span className="text-xs tabular-nums opacity-70">{dislikeCount}</span>
        )}
      </button>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
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

  function handleReact(type: "like" | "dislike") {
    const prev = myReaction;
    const isRemoving = prev === type;

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
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => handleReact("like")}
        disabled={isPending}
        aria-label={myReaction === "like" ? "Remove like" : "Like"}
        aria-pressed={myReaction === "like"}
        className={cn(
          "flex items-center gap-1.5 transition-colors group",
          myReaction === "like"
            ? "text-sky-500"
            : "text-slate-400 hover:text-sky-500"
        )}
      >
        <span
          className={cn(
            "p-1.5 rounded-full transition-colors",
            myReaction === "like" ? "bg-sky-50" : "group-hover:bg-sky-50"
          )}
        >
          <ThumbsUp
            className={cn(
              "w-4 h-4",
              myReaction === "like" && "fill-sky-500"
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
          "flex items-center gap-1.5 transition-colors group",
          myReaction === "dislike"
            ? "text-rose-500"
            : "text-slate-400 hover:text-rose-500"
        )}
      >
        <span
          className={cn(
            "p-1.5 rounded-full transition-colors",
            myReaction === "dislike"
              ? "bg-rose-50"
              : "group-hover:bg-rose-50"
          )}
        >
          <ThumbsDown
            className={cn(
              "w-4 h-4",
              myReaction === "dislike" && "fill-rose-500"
            )}
          />
        </span>
        {dislikeCount > 0 && (
          <span className="text-xs tabular-nums">{dislikeCount}</span>
        )}
      </button>
    </div>
  );
}

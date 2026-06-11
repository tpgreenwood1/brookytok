"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { Heart } from "lucide-react";
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
  initialDislikeCount: _initialDislikeCount,
  initialMyReaction,
}: ReactionButtonsProps) {
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [myReaction, setMyReaction] = useState(initialMyReaction);
  const [isPending, startTransition] = useTransition();
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);
  const likeAnimTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (likeAnimTimeout.current) clearTimeout(likeAnimTimeout.current);
    };
  }, []);

  function handleReact(type: "like") {
    const prev = myReaction;
    const isRemoving = prev === type;

    setIsLikeAnimating(true);
    if (likeAnimTimeout.current) clearTimeout(likeAnimTimeout.current);
    likeAnimTimeout.current = setTimeout(() => setIsLikeAnimating(false), 350);

    setMyReaction(isRemoving ? null : type);
    setLikeCount((c) => c + (isRemoving ? -1 : 1));

    startTransition(async () => {
      const result = isRemoving
        ? await removeReaction(postId)
        : await reactToPost(postId, type);

      if (result.error) {
        setMyReaction(prev);
        setLikeCount((c) => c + (isRemoving ? 1 : -1));
      }
    });
  }

  const liked = myReaction === "like";

  return (
    <button
      type="button"
      onClick={() => handleReact("like")}
      disabled={isPending}
      aria-label={liked ? "Remove like" : "Like"}
      aria-pressed={liked}
      className={cn(
        "flex items-center gap-1.5 transition-colors",
        liked ? "text-destructive" : "text-foreground"
      )}
    >
      <Heart
        className={cn(
          "w-6 h-6 stroke-[1.5] transition-colors",
          isLikeAnimating && "animate-bounce-like",
          liked && "fill-destructive stroke-destructive"
        )}
      />
      {likeCount > 0 && (
        <span className="text-sm font-semibold tabular-nums">{likeCount}</span>
      )}
    </button>
  );
}

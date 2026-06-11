"use client";

import { useState, useTransition } from "react";
import { Repeat2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { toggleRepost } from "@/server/actions/repost.actions";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/types";

interface RepostButtonProps {
  postId: string;
  postAuthorId: string;
  initialRepostCount: number;
  initialMyRepost: boolean;
}

export function RepostButton({
  postId,
  postAuthorId,
  initialRepostCount,
  initialMyRepost,
}: RepostButtonProps) {
  const { data: session } = authClient.useSession();
  const currentUserId = (session?.user as SessionUser | undefined)?.id;
  const [repostCount, setRepostCount] = useState(initialRepostCount);
  const [myRepost, setMyRepost] = useState(initialMyRepost);
  const [isPending, startTransition] = useTransition();

  // Don't show the repost button on the user's own posts
  if (currentUserId && currentUserId === postAuthorId) return null;

  function handleToggle() {
    const wasReposted = myRepost;

    // Optimistic update
    setMyRepost(!wasReposted);
    setRepostCount((c) => c + (wasReposted ? -1 : 1));

    startTransition(async () => {
      const result = await toggleRepost(postId);
      if (result.error) {
        // Revert
        setMyRepost(wasReposted);
        setRepostCount((c) => c + (wasReposted ? 1 : -1));
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      aria-label={myRepost ? "Remove repost" : "Repost"}
      aria-pressed={myRepost}
      className={cn(
        "flex items-center gap-1.5 transition-colors group",
        myRepost
          ? "text-emerald-500"
          : "text-fg-muted hover:text-emerald-500"
      )}
    >
      <span
        className={cn(
          "p-1.5 rounded-full transition-colors",
          myRepost
            ? "bg-emerald-50 dark:bg-emerald-950/30"
            : "group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/30"
        )}
      >
        <Repeat2 className="w-4 h-4" />
      </span>
      {repostCount > 0 && (
        <span className="text-xs tabular-nums">{repostCount}</span>
      )}
    </button>
  );
}

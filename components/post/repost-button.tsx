"use client";

import { useState, useTransition } from "react";
import { Send } from "lucide-react";
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

  if (currentUserId && currentUserId === postAuthorId) return null;

  function handleToggle() {
    const wasReposted = myRepost;

    setMyRepost(!wasReposted);
    setRepostCount((c) => c + (wasReposted ? -1 : 1));

    startTransition(async () => {
      const result = await toggleRepost(postId);
      if (result.error) {
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
      aria-label={myRepost ? "Remove share" : "Share"}
      aria-pressed={myRepost}
      className={cn(
        "flex items-center gap-1.5 transition-colors",
        myRepost ? "text-brand" : "text-foreground"
      )}
    >
      <Send
        className={cn(
          "w-6 h-6 stroke-[1.5]",
          myRepost && "fill-brand stroke-brand"
        )}
      />
    </button>
  );
}

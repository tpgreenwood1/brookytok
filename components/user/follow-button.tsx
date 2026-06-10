"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { followUser, unfollowUser } from "@/server/actions/follow.actions";

interface FollowButtonProps {
  username: string;
  initialIsFollowing: boolean;
  className?: string;
}

export function FollowButton({ username, initialIsFollowing, className }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(async () => {
      if (isFollowing) {
        const result = await unfollowUser(username);
        if (!result.error) setIsFollowing(false);
      } else {
        const result = await followUser(username);
        if (!result.error) setIsFollowing(true);
      }
    });
  }

  return (
    <Button
      onClick={handleToggle}
      variant={isFollowing ? "secondary" : "primary"}
      size="sm"
      disabled={isPending}
      className={className}
      aria-label={isFollowing ? `Unfollow @${username}` : `Follow @${username}`}
    >
      {isFollowing ? "Unfollow" : "Follow"}
    </Button>
  );
}

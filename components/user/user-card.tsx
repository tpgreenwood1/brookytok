import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { FollowButton } from "./follow-button";
import type { UserSearchResult } from "@/types";

function formatFollowerCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(n);
}

export function UserCard({ user }: { user: UserSearchResult }) {
  const displayName = user.displayName ?? user.name;

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
      <Link href={`/${user.username}`} className="flex-shrink-0" tabIndex={-1} aria-hidden>
        <Avatar src={user.image} name={displayName} size="md" />
      </Link>
      <div className="flex-1 min-w-0">
        <Link href={`/${user.username}`} className="group block">
          <span className="font-semibold text-sm text-foreground">{displayName}</span>
          <span className="block text-xs text-fg-muted">@{user.username}</span>
        </Link>
        {user.bio && (
          <p className="text-xs text-fg-muted mt-0.5 line-clamp-1">{user.bio}</p>
        )}
        <p className="text-xs text-fg-muted mt-0.5">
          {formatFollowerCount(user._count.followers)}{" "}
          {user._count.followers === 1 ? "follower" : "followers"}
        </p>
      </div>
      <FollowButton username={user.username} initialIsFollowing={user.isFollowing} />
    </div>
  );
}

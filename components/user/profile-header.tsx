"use client";

import { Avatar } from "@/components/ui/avatar";
import { AvatarUpload } from "./avatar-upload";
import { BannerUpload } from "./banner-upload";
import { FollowButton } from "./follow-button";
import { CalendarDays } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { UserProfile } from "@/types";

interface ProfileHeaderProps {
  user: UserProfile;
  isOwnProfile: boolean;
  isFollowing: boolean;
}

export function ProfileHeader({
  user,
  isOwnProfile,
  isFollowing,
}: ProfileHeaderProps) {
  const displayName = user.displayName ?? user.name;

  return (
    <header>
      {isOwnProfile ? (
        <BannerUpload currentImage={user.bannerImage} />
      ) : user.bannerImage ? (
        <img
          src={user.bannerImage}
          alt=""
          aria-hidden
          className="h-40 w-full object-cover"
        />
      ) : (
        <div
          className="h-40 bg-gradient-to-r from-brand to-brand-hover"
          aria-hidden="true"
        />
      )}
      <div className="px-4 pb-4">
        <div className="flex justify-between items-end -mt-10 mb-3">
          {isOwnProfile ? (
            <AvatarUpload
              currentImage={user.image}
              displayName={displayName}
              size="xl"
              className="ring-4 ring-background rounded-full"
            />
          ) : (
            <Avatar
              src={user.image}
              name={displayName}
              size="xl"
              className="ring-4 ring-background"
            />
          )}
          {!isOwnProfile && (
            <FollowButton
              username={user.username}
              initialIsFollowing={isFollowing}
            />
          )}
        </div>

        <div className="space-y-1">
          <h1 className="text-base font-semibold text-foreground">{displayName}</h1>
          <p className="text-sm text-fg-muted">@{user.username}</p>
          {user.bio && (
            <p className="text-sm text-foreground mt-2 leading-relaxed">{user.bio}</p>
          )}
          <div className="flex items-center gap-1.5 text-fg-muted text-xs pt-1">
            <CalendarDays className="w-3.5 h-3.5" aria-hidden />
            <span>Joined {formatDate(user.createdAt)}</span>
          </div>
          <div className="flex gap-5 pt-2 text-sm">
            <span>
              <strong className="text-foreground font-semibold">
                {user._count.posts}
              </strong>{" "}
              <span className="text-fg-muted">
                {user._count.posts === 1 ? "post" : "posts"}
              </span>
            </span>
            <span>
              <strong className="text-foreground font-semibold">
                {user._count.following}
              </strong>{" "}
              <span className="text-fg-muted">following</span>
            </span>
            <span>
              <strong className="text-foreground font-semibold">
                {user._count.followers}
              </strong>{" "}
              <span className="text-fg-muted">
                {user._count.followers === 1 ? "follower" : "followers"}
              </span>
            </span>
          </div>
        </div>
      </div>
      <div className="border-b border-border px-4">
        <div className="py-3 text-sm font-semibold text-foreground border-b-2 border-foreground inline-block">
          Posts
        </div>
      </div>
    </header>
  );
}

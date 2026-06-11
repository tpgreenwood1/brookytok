import { Avatar } from "@/components/ui/avatar";
import { AvatarUpload } from "./avatar-upload";
import { FollowButton } from "./follow-button";
import { formatDate } from "@/lib/utils";
import { CalendarDays } from "lucide-react";
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
      <div
        className="h-32 bg-gradient-to-r from-sky-400 to-indigo-500"
        aria-hidden="true"
      />
      <div className="px-4 pb-4">
        <div className="flex justify-between items-start -mt-10 mb-3">
          {isOwnProfile ? (
            <AvatarUpload
              currentImage={user.image}
              displayName={displayName}
              size="xl"
              className="ring-4 ring-white rounded-full"
            />
          ) : (
            <Avatar
              src={user.image}
              name={displayName}
              size="xl"
              className="ring-4 ring-white"
            />
          )}
          {!isOwnProfile && (
            <FollowButton
              username={user.username}
              initialIsFollowing={isFollowing}
              className="mt-12"
            />
          )}
        </div>

        <div className="space-y-1">
          <h1 className="text-xl font-bold text-slate-900">{displayName}</h1>
          <p className="text-slate-500">@{user.username}</p>
          {user.bio && (
            <p className="text-slate-700 mt-2 leading-relaxed">{user.bio}</p>
          )}
          <div className="flex items-center gap-1.5 text-slate-500 text-sm pt-1">
            <CalendarDays className="w-4 h-4" aria-hidden />
            <span>Joined {formatDate(user.createdAt)}</span>
          </div>
          <div className="flex gap-4 pt-2 text-sm">
            <span>
              <strong className="text-slate-900 font-semibold">
                {user._count.following}
              </strong>{" "}
              <span className="text-slate-500">Following</span>
            </span>
            <span>
              <strong className="text-slate-900 font-semibold">
                {user._count.followers}
              </strong>{" "}
              <span className="text-slate-500">
                {user._count.followers === 1 ? "Follower" : "Followers"}
              </span>
            </span>
          </div>
        </div>
      </div>
      <div className="border-b border-slate-200 px-4">
        <div className="py-3 font-semibold text-slate-900 border-b-2 border-slate-900 inline-block">
          Posts
        </div>
      </div>
    </header>
  );
}

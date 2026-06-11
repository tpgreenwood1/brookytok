import { Shell } from "@/components/layout/shell";
import { Skeleton } from "@/components/ui/skeleton";
import { PostSkeletonList } from "@/components/post/post-skeleton";

export default function ProfileLoading() {
  return (
    <Shell>
      {/* Banner */}
      <div className="h-40 animate-skeleton-shimmer" aria-hidden="true" />

      <div className="px-4 pb-4">
        {/* Avatar + follow button row */}
        <div className="flex justify-between items-end -mt-10 mb-3">
          <Skeleton className="w-20 h-20 rounded-full ring-4 ring-background" />
          <Skeleton className="w-24 h-9 rounded-full" />
        </div>

        {/* Name and metadata */}
        <div className="space-y-2.5">
          <Skeleton className="h-5 w-36 rounded-full" />
          <Skeleton className="h-4 w-24 rounded-full" />
          <Skeleton className="h-4 w-full rounded-full" />
          <Skeleton className="h-4 w-4/5 rounded-full" />
          <div className="flex gap-4 pt-1">
            <Skeleton className="h-4 w-16 rounded-full" />
            <Skeleton className="h-4 w-20 rounded-full" />
            <Skeleton className="h-4 w-20 rounded-full" />
          </div>
        </div>
      </div>

      {/* Posts tab */}
      <div className="border-b border-border px-4 pb-0">
        <Skeleton className="h-4 w-12 rounded-full my-3" />
      </div>

      <PostSkeletonList count={3} />
    </Shell>
  );
}

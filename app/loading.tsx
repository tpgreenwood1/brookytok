import { Shell } from "@/components/layout/shell";
import { Skeleton } from "@/components/ui/skeleton";
import { PostSkeletonList } from "@/components/post/post-skeleton";

export default function Loading() {
  return (
    <Shell>
      {/* Sticky header skeleton */}
      <div className="sticky top-0 bg-background/90 backdrop-blur-sm border-b border-border px-4 py-3">
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>

      {/* Feed tabs skeleton */}
      <div className="flex border-b border-border">
        <div className="flex-1 py-3 flex justify-center">
          <Skeleton className="h-4 w-16 rounded-full" />
        </div>
        <div className="flex-1 py-3 flex justify-center">
          <Skeleton className="h-4 w-20 rounded-full" />
        </div>
      </div>

      {/* Composer skeleton */}
      <div className="flex gap-3 p-4 border-b border-border">
        <Skeleton className="w-10 h-10 flex-shrink-0 rounded-full" />
        <Skeleton className="flex-1 h-20 rounded-2xl" />
      </div>

      {/* Post skeletons */}
      <PostSkeletonList count={5} />
    </Shell>
  );
}

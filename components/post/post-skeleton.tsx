import { Skeleton } from "@/components/ui/skeleton";

export function PostSkeleton() {
  return (
    <div
      className="border-b border-border"
      aria-hidden="true"
    >
      {/* Header row */}
      <div className="flex items-center gap-2 px-3 h-[52px]">
        <Skeleton className="w-8 h-8 flex-shrink-0 rounded-full" />
        <Skeleton className="h-3 w-28 rounded-full" />
      </div>
      {/* Media placeholder */}
      <Skeleton className="w-full aspect-square" />
      {/* Action bar */}
      <div className="flex items-center gap-4 px-3 pt-2 pb-1">
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-6 w-6 rounded-full" />
      </div>
      {/* Caption */}
      <div className="px-3 pb-3 space-y-2">
        <Skeleton className="h-3 w-full rounded-full" />
        <Skeleton className="h-3 w-3/4 rounded-full" />
        <Skeleton className="h-2.5 w-16 rounded-full mt-1" />
      </div>
    </div>
  );
}

export function PostSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div aria-label="Loading posts" aria-busy="true">
      {Array.from({ length: count }).map((_, i) => (
        <PostSkeleton key={i} />
      ))}
    </div>
  );
}

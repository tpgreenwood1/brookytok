import { Skeleton } from "@/components/ui/skeleton";

export function PostSkeleton() {
  return (
    <div
      className="flex gap-3 py-4 px-4 border-b border-border-muted"
      aria-hidden="true"
    >
      <Skeleton className="w-10 h-10 flex-shrink-0 rounded-full" />
      <div className="flex-1 space-y-2.5 pt-0.5">
        <div className="flex gap-2">
          <Skeleton className="h-3.5 w-28 rounded-full" />
          <Skeleton className="h-3.5 w-20 rounded-full" />
        </div>
        <Skeleton className="h-3.5 w-full rounded-full" />
        <Skeleton className="h-3.5 w-4/5 rounded-full" />
        <Skeleton className="h-3.5 w-1/2 rounded-full" />
      </div>
    </div>
  );
}

export function PostSkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div aria-label="Loading posts" aria-busy="true">
      {Array.from({ length: count }).map((_, i) => (
        <PostSkeleton key={i} />
      ))}
    </div>
  );
}

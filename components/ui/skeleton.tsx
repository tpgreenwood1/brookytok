import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn("animate-skeleton-shimmer rounded-full", className)}
      aria-hidden="true"
    />
  );
}

"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface FeedTabsProps {
  activeTab: "for-you" | "following";
}

export function FeedTabs({ activeTab }: FeedTabsProps) {
  return (
    <div className="flex border-b border-border" role="tablist">
      <Link
        href="/"
        role="tab"
        aria-selected={activeTab === "for-you"}
        className={cn(
          "flex-1 py-3 text-sm font-semibold text-center transition-colors",
          activeTab === "for-you"
            ? "text-foreground border-b-2 border-foreground"
            : "text-fg-muted hover:text-foreground"
        )}
      >
        For you
      </Link>
      <Link
        href="/?tab=following"
        role="tab"
        aria-selected={activeTab === "following"}
        className={cn(
          "flex-1 py-3 text-sm font-semibold text-center transition-colors",
          activeTab === "following"
            ? "text-foreground border-b-2 border-foreground"
            : "text-fg-muted hover:text-foreground"
        )}
      >
        Following
      </Link>
    </div>
  );
}

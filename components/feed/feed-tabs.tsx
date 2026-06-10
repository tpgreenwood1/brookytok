"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface FeedTabsProps {
  activeTab: "for-you" | "following";
}

export function FeedTabs({ activeTab }: FeedTabsProps) {
  return (
    <div className="flex border-b border-slate-200" role="tablist">
      <Link
        href="/"
        role="tab"
        aria-selected={activeTab === "for-you"}
        className={cn(
          "flex-1 py-3 text-sm font-medium text-center transition-colors",
          activeTab === "for-you"
            ? "text-sky-500 border-b-2 border-sky-500"
            : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
        )}
      >
        For you
      </Link>
      <Link
        href="/?tab=following"
        role="tab"
        aria-selected={activeTab === "following"}
        className={cn(
          "flex-1 py-3 text-sm font-medium text-center transition-colors",
          activeTab === "following"
            ? "text-sky-500 border-b-2 border-sky-500"
            : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
        )}
      >
        Following
      </Link>
    </div>
  );
}

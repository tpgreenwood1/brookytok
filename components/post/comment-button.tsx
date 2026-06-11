"use client";

import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PostWithAuthor } from "@/types";

interface CommentButtonProps {
  post: PostWithAuthor;
  isExpanded?: boolean;
  onToggle?: () => void;
  showCount?: boolean;
}

export function CommentButton({ post, isExpanded, onToggle, showCount = true }: CommentButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isExpanded ? "Hide replies" : "Show replies"}
      aria-expanded={isExpanded}
      className={cn(
        "flex items-center gap-1.5 transition-colors",
        isExpanded ? "text-brand" : "text-foreground"
      )}
    >
      <MessageCircle className="w-6 h-6 stroke-[1.5]" />
      {showCount && post.replyCount > 0 && (
        <span className="text-sm font-semibold tabular-nums">{post.replyCount}</span>
      )}
    </button>
  );
}

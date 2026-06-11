"use client";

import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PostWithAuthor } from "@/types";

interface CommentButtonProps {
  post: PostWithAuthor;
  isExpanded?: boolean;
  onToggle?: () => void;
}

export function CommentButton({ post, isExpanded, onToggle }: CommentButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isExpanded ? "Hide replies" : "Show replies"}
      aria-expanded={isExpanded}
      className={cn(
        "flex items-center gap-1.5 transition-colors group",
        isExpanded ? "text-brand" : "text-fg-muted hover:text-brand"
      )}
    >
      <span
        className={cn(
          "p-1.5 rounded-full transition-colors",
          isExpanded ? "bg-brand-light" : "group-hover:bg-brand-light"
        )}
      >
        <MessageCircle className="w-4 h-4" />
      </span>
      {post.replyCount > 0 && (
        <span className="text-xs tabular-nums">{post.replyCount}</span>
      )}
    </button>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { ReplyComposer } from "./reply-composer";
import { PostCard } from "./post-card";
import type { PostWithAuthor } from "@/types";

interface RepliesSectionProps {
  postId: string;
  parentAuthorUsername: string;
}

export function RepliesSection({ postId, parentAuthorUsername }: RepliesSectionProps) {
  const [replies, setReplies] = useState<PostWithAuthor[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refetchKey, setRefetchKey] = useState(0);
  const router = useRouter();

  const fetchReplies = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/posts/${postId}/replies`);
      const data = await res.json();
      setReplies(data);
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchReplies();
  }, [fetchReplies, refetchKey]);

  function handleReplySuccess() {
    setRefetchKey((k) => k + 1);
    router.refresh();
  }

  return (
    <div className="border-l-2 border-brand ml-6 pl-0">
      <ReplyComposer
        parentPostId={postId}
        parentAuthorUsername={parentAuthorUsername}
        onSuccess={handleReplySuccess}
      />

      {isLoading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="w-5 h-5 animate-spin text-fg-muted" />
        </div>
      ) : replies && replies.length > 0 ? (
        replies.map((reply) => <PostCard key={reply.id} post={reply} />)
      ) : (
        <p className="text-sm text-fg-muted px-4 py-4">
          No replies yet. Be the first to reply!
        </p>
      )}
    </div>
  );
}

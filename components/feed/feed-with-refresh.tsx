"use client";

import { useRouter } from "next/navigation";
import { useNewPostsCheck } from "@/hooks/use-new-posts-check";
import { NewPostsBanner } from "./new-posts-banner";

interface FeedWithRefreshProps {
  latestPostId: string | null;
  children: React.ReactNode;
}

export function FeedWithRefresh({
  latestPostId,
  children,
}: FeedWithRefreshProps) {
  const router = useRouter();
  const { newCount, dismiss } = useNewPostsCheck({ latestPostId });

  function handleRefresh() {
    dismiss();
    router.refresh();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <>
      <NewPostsBanner count={newCount} onRefresh={handleRefresh} />
      {children}
    </>
  );
}

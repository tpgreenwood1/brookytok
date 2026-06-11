"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface UseNewPostsCheckOptions {
  latestPostId: string | null;
  intervalMs?: number;
  enabled?: boolean;
}

export function useNewPostsCheck({
  latestPostId,
  intervalMs = 30_000,
  enabled = true,
}: UseNewPostsCheckOptions) {
  const [newCount, setNewCount] = useState(0);
  const latestPostIdRef = useRef(latestPostId);

  useEffect(() => {
    latestPostIdRef.current = latestPostId;
  }, [latestPostId]);

  const checkForNew = useCallback(async () => {
    if (!latestPostIdRef.current) return;
    try {
      const res = await fetch(
        `/api/feed/new-count?sinceId=${encodeURIComponent(latestPostIdRef.current)}`
      );
      if (!res.ok) return;
      const { count } = await res.json();
      if (typeof count === "number" && count > 0) {
        setNewCount(count);
      }
    } catch {
      // Ignore network errors silently
    }
  }, []);

  useEffect(() => {
    if (!enabled || !latestPostId) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkForNew();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    const id = setInterval(() => {
      if (document.visibilityState === "visible") {
        checkForNew();
      }
    }, intervalMs);

    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled, latestPostId, intervalMs, checkForNew]);

  function dismiss() {
    setNewCount(0);
  }

  return { newCount, dismiss };
}

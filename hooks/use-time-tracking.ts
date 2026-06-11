"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const SNOOZE_KEY = "brooky-tok:snooze";
const FLUSH_INTERVAL_MS = 30_000;
const SNOOZE_CHECK_INTERVAL_MS = 10_000;

export function useTimeTracking() {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [limitMinutes, setLimitMinutes] = useState<number | null>(null);
  const [snoozeUntil, setSnoozeUntil] = useState<number | null>(null);
  const [snoozeStartElapsed, setSnoozeStartElapsed] = useState(0);
  const [snoozeDurationMinutes, setSnoozeDurationMinutes] = useState<number | null>(null);

  // Pending seconds since last flush — not stored in state to avoid re-renders
  const pendingRef = useRef(0);
  // Mirror of elapsedSeconds for use in callbacks without stale closures
  const elapsedRef = useRef(0);

  const flush = useCallback(() => {
    const delta = pendingRef.current;
    if (delta < 1) return;
    pendingRef.current = 0;

    const body = JSON.stringify({ seconds: delta });

    // Use sendBeacon when available (survives page unload)
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/time-tracking",
        new Blob([body], { type: "application/json" })
      );
    } else {
      fetch("/api/time-tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => {});
    }
  }, []);

  // Fetch initial state on mount
  useEffect(() => {
    const stored = localStorage.getItem(SNOOZE_KEY);
    if (stored) {
      const ts = parseInt(stored, 10);
      if (!isNaN(ts) && Date.now() < ts) {
        setSnoozeUntil(ts);
      } else {
        localStorage.removeItem(SNOOZE_KEY);
      }
    }

    fetch("/api/time-tracking")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        const s = data.seconds ?? 0;
        setElapsedSeconds(s);
        elapsedRef.current = s;
        setLimitMinutes(data.limitMinutes ?? null);
      })
      .catch(() => {});
  }, []);

  // Count foreground seconds, flush every 30s
  useEffect(() => {
    const tick = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      pendingRef.current += 1;
      setElapsedSeconds((s) => {
        const next = s + 1;
        elapsedRef.current = next;
        return next;
      });
    }, 1000);

    const flushTimer = setInterval(flush, FLUSH_INTERVAL_MS);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") flush();
    };

    const handlePageHide = () => flush();

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      clearInterval(tick);
      clearInterval(flushTimer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [flush]);

  // Watch for snooze expiry
  useEffect(() => {
    if (snoozeUntil === null) return;
    const id = setInterval(() => {
      if (Date.now() >= snoozeUntil) {
        setSnoozeUntil(null);
        localStorage.removeItem(SNOOZE_KEY);
      }
    }, SNOOZE_CHECK_INTERVAL_MS);
    return () => clearInterval(id);
  }, [snoozeUntil]);

  const snooze = useCallback((minutes: number) => {
    const until = Date.now() + minutes * 60 * 1000;
    localStorage.setItem(SNOOZE_KEY, String(until));
    setSnoozeUntil(until);
    setSnoozeStartElapsed(elapsedRef.current);
    setSnoozeDurationMinutes(minutes);
  }, []);

  const isOverLimit =
    limitMinutes !== null && elapsedSeconds >= limitMinutes * 60;
  const snoozeActive = snoozeUntil !== null && Date.now() < snoozeUntil;

  // Ring shows time-since-snooze vs snooze-duration while a snooze is active
  const ringElapsedSeconds = snoozeActive
    ? Math.max(0, elapsedSeconds - snoozeStartElapsed)
    : elapsedSeconds;
  const ringLimitMinutes =
    snoozeActive && snoozeDurationMinutes !== null
      ? snoozeDurationMinutes
      : limitMinutes;

  return {
    elapsedSeconds,
    limitMinutes,
    isOverLimit,
    snoozeActive,
    snooze,
    ringElapsedSeconds,
    ringLimitMinutes,
  };
}

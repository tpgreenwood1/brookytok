"use client";

import { useTimeTracking } from "@/hooks/use-time-tracking";
import { TimeRing } from "@/components/ui/time-ring";
import { TimeLimitModal } from "@/components/ui/time-limit-modal";

export function TimeTrackingShell({ children }: { children: React.ReactNode }) {
  const {
    elapsedSeconds,
    limitMinutes,
    isOverLimit,
    snoozeActive,
    snooze,
    ringElapsedSeconds,
    ringLimitMinutes,
  } = useTimeTracking();

  return (
    <>
      {children}
      {ringLimitMinutes !== null && (
        <div
          className="fixed top-3 right-3 z-30 pointer-events-none"
          title={`${Math.floor(elapsedSeconds / 60)}m used of ${limitMinutes}m limit`}
        >
          <TimeRing elapsedSeconds={ringElapsedSeconds} limitMinutes={ringLimitMinutes} />
        </div>
      )}
      <TimeLimitModal open={isOverLimit && !snoozeActive} onSnooze={snooze} />
    </>
  );
}

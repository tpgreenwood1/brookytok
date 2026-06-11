"use client";

import { useEffect, useRef } from "react";
import { Button } from "./button";

interface TimeLimitModalProps {
  open: boolean;
  onSnooze: (minutes: number) => void;
}

export function TimeLimitModal({ open, onSnooze }: TimeLimitModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="time-limit-dialog m-auto w-full max-w-sm rounded-t-xl bg-background p-6 text-foreground shadow-[0_4px_12px_rgba(0,0,0,0.15)] outline-none"
      style={{ position: "fixed", bottom: 0, left: 0, right: 0, margin: 0, maxWidth: "100%" }}
      onKeyDown={(e) => e.key === "Escape" && e.preventDefault()}
    >
      <div className="flex flex-col items-center gap-4 text-center">
        {/* Handle bar */}
        <div className="w-10 h-1 rounded-full bg-border -mt-2 mb-0" aria-hidden="true" />
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>

        <div>
          <h2 className="text-lg font-bold leading-snug">Time&apos;s up!</h2>
          <p className="mt-2 text-sm text-fg-muted leading-relaxed">
            Hey you&apos;ve hit your Brooky-Tok time limit &mdash; time to head
            out into the real world!
          </p>
        </div>

        <div className="flex w-full flex-col gap-2">
          <p className="text-xs font-medium text-fg-muted uppercase tracking-wide">
            Snooze for
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="flex-1"
              onClick={() => onSnooze(1)}
            >
              1 min
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="flex-1"
              onClick={() => onSnooze(5)}
            >
              5 mins
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="flex-1"
              onClick={() => onSnooze(60)}
            >
              1 hour
            </Button>
          </div>
        </div>
      </div>
    </dialog>
  );
}

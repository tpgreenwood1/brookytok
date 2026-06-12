"use client";

import type { RefObject } from "react";
import { cn } from "@/lib/utils";
import type { AspectRatio, CanvasDimensions } from "./types";

interface CanvasAreaProps {
  canvasElRef: RefObject<HTMLCanvasElement | null>;
  dims: CanvasDimensions;
  scaledDims: { cssWidth: number; cssHeight: number; scale: number };
  aspectRatio: AspectRatio;
  onAspectRatioChange: (r: AspectRatio) => void;
  showSafeZone: boolean;
  showGuides: boolean;
}

const RATIOS: AspectRatio[] = ["1:1", "4:5", "9:16"];

export function CanvasArea({
  canvasElRef,
  dims,
  scaledDims,
  aspectRatio,
  onAspectRatioChange,
  showSafeZone,
  showGuides,
}: CanvasAreaProps) {
  const { cssWidth, cssHeight, scale } = scaledDims;

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {/* Aspect ratio chips */}
      <div className="flex gap-2" role="group" aria-label="Aspect ratio">
        {RATIOS.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => onAspectRatioChange(r)}
            aria-pressed={aspectRatio === r}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium transition-colors",
              aspectRatio === r
                ? "bg-white text-black"
                : "bg-white/10 text-white/70 hover:bg-white/20"
            )}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Canvas holder — Fabric handles CSS scaling via setDimensions({ cssOnly: true });
          we just provide a positioned container for the guide/safe-zone overlays */}
      <div
        style={{ width: cssWidth, height: cssHeight, overflow: "hidden", position: "relative", flexShrink: 0 }}
        className="rounded-lg shadow-2xl"
      >
        <canvas ref={canvasElRef} />

        {/* Snap-to-centre guide lines — rendered at scaled-space coords */}
        {showGuides && (
          <>
            <div
              aria-hidden="true"
              className="absolute inset-y-0 pointer-events-none"
              style={{ left: "50%", width: 1, borderLeft: "1px dashed rgba(255,255,255,0.7)" }}
            />
            <div
              aria-hidden="true"
              className="absolute inset-x-0 pointer-events-none"
              style={{ top: "50%", height: 1, borderTop: "1px dashed rgba(255,255,255,0.7)" }}
            />
          </>
        )}

        {/* Safe zone overlay — 8% inset margin guide */}
        {showSafeZone && (
          <div
            aria-hidden="true"
            className="absolute pointer-events-none rounded"
            style={{
              inset: "8%",
              border: "1px dashed rgba(255,255,255,0.4)",
            }}
          />
        )}
      </div>
    </div>
  );
}

"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SlideUpPanelProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

// Use a plain positioned div (NOT <dialog>) — native dialogs create a stacking
// context that conflicts with Pickr popups which append to document.body.
export function SlideUpPanel({ open, onClose, title, children }: SlideUpPanelProps) {
  return (
    <>
      {/* Backdrop — only blocks interaction with canvas while panel is open */}
      {open && (
        <div
          className="absolute inset-0 z-10"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <div
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
        className={cn(
          "absolute bottom-0 left-0 right-0 z-20 bg-[#1a1a1a] rounded-t-2xl",
          "transition-transform duration-200 ease-out will-change-transform",
          open ? "translate-y-0" : "translate-y-full pointer-events-none"
        )}
      >
        {/* Drag handle */}
        <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mt-3" aria-hidden="true" />

        <div className="flex items-center justify-between px-4 pt-3 pb-1">
          {title && <span className="text-white text-sm font-semibold">{title}</span>}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            className="ml-auto p-1 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-4 pb-6 pt-1 max-h-[55vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </>
  );
}

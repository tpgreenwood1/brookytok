"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { FONT_FAMILIES } from "../constants";

interface FontsPanelProps {
  selectedFontFamily: string;
  onFontSelect: (family: string) => void;
}

export function FontsPanel({ selectedFontFamily, onFontSelect }: FontsPanelProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSelect = async (family: string) => {
    if (family === selectedFontFamily) return;
    setLoading(family);
    try {
      // Dynamic import so WebFontLoader never runs server-side
      const WF = (await import("webfontloader")).default;
      await new Promise<void>((resolve, reject) => {
        WF.load({
          google: { families: [family] },
          fontactive: () => resolve(),
          fontinactive: () => reject(new Error(`Failed to load ${family}`)),
          timeout: 5000,
        });
      });
      onFontSelect(family);
    } catch {
      // Font load failed — still update so the UI doesn't get stuck
      onFontSelect(family);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      {FONT_FAMILIES.map((family) => {
        const isSelected = selectedFontFamily === family;
        const isLoading  = loading === family;
        return (
          <button
            key={family}
            type="button"
            onClick={() => handleSelect(family)}
            disabled={isLoading}
            className={cn(
              "relative flex flex-col items-start gap-1 px-3 py-3 rounded-xl border transition-all text-left",
              isSelected
                ? "border-white bg-white/15"
                : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
            )}
          >
            {/* Font name in that font (renders in system fallback until lazy-loaded) */}
            <span
              className="text-white text-lg leading-tight truncate w-full"
              style={{ fontFamily: `"${family}", sans-serif` }}
            >
              Aa
            </span>
            <span className="text-white/60 text-[11px] leading-tight truncate w-full">
              {family}
            </span>

            {isSelected && !isLoading && (
              <Check className="absolute top-2 right-2 w-3.5 h-3.5 text-white" />
            )}
            {isLoading && (
              <span className="absolute top-2 right-2 w-3 h-3 rounded-full border border-white/40 border-t-white animate-spin" />
            )}
          </button>
        );
      })}
    </div>
  );
}

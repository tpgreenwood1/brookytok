"use client";

import { useEffect, useRef } from "react";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Minus,
  Plus,
  Sunset,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Pickr CSS
import "@simonwep/pickr/dist/themes/nano.min.css";

interface TextPanelProps {
  // fabric.IText is a browser-only type; use a generic record to avoid importing fabric at module level
  selectedObject: Record<string, unknown> | null;
  onUpdate: (props: Record<string, unknown>) => void;
  onCenterH: () => void;
  onCenterV: () => void;
}

function PickrTrigger({
  color,
  onChange,
  label,
}: {
  color: string;
  onChange: (hex: string) => void;
  label: string;
}) {
  const elRef   = useRef<HTMLButtonElement>(null);
  const pickrRef = useRef<import("@simonwep/pickr").default | null>(null);

  useEffect(() => {
    if (!elRef.current) return;
    let destroyed = false;
    import("@simonwep/pickr").then((mod) => {
      if (destroyed || !elRef.current) return;
      const Pickr = mod.default;
      const p = Pickr.create({
        el: elRef.current!,
        theme: "nano",
        default: color || "#ffffff",
        components: {
          preview: true,
          opacity: true,
          hue: true,
          interaction: { hex: true, input: true, save: true },
        },
      });
      p.on("save", (c: import("@simonwep/pickr").default.HSVaColor | null) => {
        if (!c) return;
        onChange(c.toHEXA().toString());
        p.hide();
      });
      pickrRef.current = p;
    });
    return () => {
      destroyed = true;
      pickrRef.current?.destroy();
      pickrRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (color) pickrRef.current?.setColor(color);
  }, [color]);

  return (
    <button
      ref={elRef}
      type="button"
      aria-label={label}
      className="w-10 h-10 rounded-lg border-2 border-white/20 cursor-pointer"
      style={{ backgroundColor: color }}
    />
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-white/50 text-xs uppercase tracking-wider">{children}</span>;
}

export function TextPanel({ selectedObject, onUpdate, onCenterH, onCenterV }: TextPanelProps) {
  if (!selectedObject) {
    return (
      <p className="text-white/40 text-sm text-center py-6">
        Select a text object to edit its properties.
      </p>
    );
  }

  const fontSize     = (selectedObject.fontSize as number)     ?? 48;
  const fontWeight   = (selectedObject.fontWeight as string)   ?? "normal";
  const fontStyle    = (selectedObject.fontStyle as string)    ?? "normal";
  const fill         = (selectedObject.fill as string)         ?? "#ffffff";
  const textAlign    = (selectedObject.textAlign as string)    ?? "center";
  // charSpacing in Fabric is in 1/1000 em units
  const charSpacing  = (selectedObject.charSpacing as number)  ?? 0;
  const lineHeight   = (selectedObject.lineHeight as number)   ?? 1.16;
  const hasShadow    = !!(selectedObject.shadow as unknown);
  const bgHighlight  = (selectedObject.textBackgroundColor as string) ?? "";

  return (
    <div className="flex flex-col gap-5">
      {/* Font size */}
      <div className="flex flex-col gap-2">
        <SectionLabel>Size</SectionLabel>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onUpdate({ fontSize: Math.max(12, fontSize - 2) })}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20"
            aria-label="Decrease font size"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="text-white text-sm w-8 text-center tabular-nums">{fontSize}</span>
          <button
            type="button"
            onClick={() => onUpdate({ fontSize: Math.min(120, fontSize + 2) })}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20"
            aria-label="Increase font size"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <input
            type="range"
            min="12"
            max="120"
            value={fontSize}
            onChange={(e) => onUpdate({ fontSize: Number(e.target.value) })}
            className="flex-1 accent-white"
            aria-label="Font size slider"
          />
        </div>
      </div>

      {/* Style toggles + alignment */}
      <div className="flex flex-col gap-2">
        <SectionLabel>Style</SectionLabel>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Bold */}
          <button
            type="button"
            onClick={() => onUpdate({ fontWeight: fontWeight === "bold" ? "normal" : "bold" })}
            aria-pressed={fontWeight === "bold"}
            className={cn(
              "w-9 h-9 rounded-lg flex items-center justify-center transition-colors",
              fontWeight === "bold" ? "bg-white text-black" : "bg-white/10 text-white hover:bg-white/20"
            )}
            aria-label="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>

          {/* Italic */}
          <button
            type="button"
            onClick={() => onUpdate({ fontStyle: fontStyle === "italic" ? "normal" : "italic" })}
            aria-pressed={fontStyle === "italic"}
            className={cn(
              "w-9 h-9 rounded-lg flex items-center justify-center transition-colors",
              fontStyle === "italic" ? "bg-white text-black" : "bg-white/10 text-white hover:bg-white/20"
            )}
            aria-label="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>

          <div className="w-px h-7 bg-white/20 mx-1" aria-hidden="true" />

          {/* Alignment */}
          {(["left", "center", "right"] as const).map((align) => {
            const Icon = align === "left" ? AlignLeft : align === "center" ? AlignCenter : AlignRight;
            return (
              <button
                key={align}
                type="button"
                onClick={() => onUpdate({ textAlign: align })}
                aria-pressed={textAlign === align}
                className={cn(
                  "w-9 h-9 rounded-lg flex items-center justify-center transition-colors",
                  textAlign === align ? "bg-white text-black" : "bg-white/10 text-white hover:bg-white/20"
                )}
                aria-label={`Align ${align}`}
              >
                <Icon className="w-4 h-4" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Colour + highlight */}
      <div className="flex flex-col gap-2">
        <SectionLabel>Colour</SectionLabel>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-white/70 text-sm">Text</span>
            <PickrTrigger
              color={fill}
              onChange={(hex) => onUpdate({ fill: hex })}
              label="Text colour"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white/70 text-sm">Highlight</span>
            <PickrTrigger
              color={bgHighlight || "#00000000"}
              onChange={(hex) => onUpdate({ textBackgroundColor: hex })}
              label="Text highlight colour"
            />
          </div>
        </div>
      </div>

      {/* Letter spacing */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between">
          <SectionLabel>Letter spacing</SectionLabel>
          <span className="text-white/50 text-xs">{Math.round(charSpacing)}</span>
        </div>
        <input
          type="range"
          min="-200"
          max="800"
          value={charSpacing}
          onChange={(e) => onUpdate({ charSpacing: Number(e.target.value) })}
          className="w-full accent-white"
          aria-label="Letter spacing"
        />
      </div>

      {/* Line height */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between">
          <SectionLabel>Line height</SectionLabel>
          <span className="text-white/50 text-xs">{lineHeight.toFixed(2)}</span>
        </div>
        <input
          type="range"
          min="0.8"
          max="2.5"
          step="0.05"
          value={lineHeight}
          onChange={(e) => onUpdate({ lineHeight: Number(e.target.value) })}
          className="w-full accent-white"
          aria-label="Line height"
        />
      </div>

      {/* Shadow */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sunset className="w-4 h-4 text-white/50" />
          <span className="text-white/70 text-sm">Drop shadow</span>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={hasShadow}
          onClick={() =>
            onUpdate({
              shadow: hasShadow
                ? null
                : { color: "rgba(0,0,0,0.6)", blur: 12, offsetX: 3, offsetY: 3 },
            })
          }
          className={cn(
            "w-11 h-6 rounded-full transition-colors",
            hasShadow ? "bg-white" : "bg-white/20"
          )}
        >
          <span
            className={cn(
              "block w-5 h-5 rounded-full bg-black/80 shadow transition-transform mx-0.5",
              hasShadow ? "translate-x-5" : "translate-x-0"
            )}
          />
        </button>
      </div>

      {/* Snap / centre helpers */}
      <div className="flex flex-col gap-2">
        <SectionLabel>Position</SectionLabel>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCenterH}
            className="flex-1 py-2 rounded-xl bg-white/10 text-white/80 text-sm hover:bg-white/20 transition-colors"
          >
            Centre horizontal
          </button>
          <button
            type="button"
            onClick={onCenterV}
            className="flex-1 py-2 rounded-xl bg-white/10 text-white/80 text-sm hover:bg-white/20 transition-colors"
          >
            Centre vertical
          </button>
        </div>
      </div>
    </div>
  );
}

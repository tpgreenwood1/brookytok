"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { BackgroundConfig, BackgroundMode, GradientConfig } from "../types";
import { PRESET_GRADIENTS } from "../constants";

// Pickr CSS — loaded client-side only (Next.js bundles CSS from node_modules for client components)
import "@simonwep/pickr/dist/themes/nano.min.css";

interface BackgroundPanelProps {
  bgConfig: BackgroundConfig;
  onUpdate: (cfg: BackgroundConfig) => void;
}

const MODE_TABS: { id: BackgroundMode; label: string }[] = [
  { id: "solid",    label: "Solid" },
  { id: "gradient", label: "Gradient" },
  { id: "image",    label: "Image" },
];

// ── Pickr colour swatch ──────────────────────────────────────────────────────

interface PickrSwatchProps {
  color: string;
  onChange: (hex: string) => void;
}

function PickrSwatch({ color, onChange }: PickrSwatchProps) {
  const elRef  = useRef<HTMLButtonElement>(null);
  const pickrRef = useRef<import("@simonwep/pickr").default | null>(null);

  useEffect(() => {
    if (!elRef.current) return;
    let destroyed = false;

    // Dynamic import so Pickr never runs server-side
    import("@simonwep/pickr").then((mod) => {
      if (destroyed || !elRef.current) return;
      const Pickr = mod.default;
      const p = Pickr.create({
        el: elRef.current!,
        theme: "nano",
        default: color,
        components: {
          preview: true,
          opacity: false,
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

  // Sync colour display when it changes from parent
  useEffect(() => {
    pickrRef.current?.setColor(color);
  }, [color]);

  return (
    <button
      ref={elRef}
      type="button"
      aria-label="Pick colour"
      className="w-10 h-10 rounded-lg border-2 border-white/20 cursor-pointer"
      style={{ backgroundColor: color }}
    />
  );
}

// ── Preset gradient swatch ───────────────────────────────────────────────────

function gradientCSS(g: GradientConfig): string {
  const { stops, angleDeg } = g;
  return `linear-gradient(${angleDeg}deg, ${stops[0].color}, ${stops[1].color})`;
}

// ── Main panel ───────────────────────────────────────────────────────────────

export function BackgroundPanel({ bgConfig, onUpdate }: BackgroundPanelProps) {
  const [mode, setMode] = useState<BackgroundMode>(bgConfig.mode);

  const update = (partial: Partial<BackgroundConfig>) => {
    onUpdate({ ...bgConfig, ...partial });
  };

  const switchMode = (m: BackgroundMode) => {
    setMode(m);
    update({ mode: m });
  };

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      update({ imageDataUrl: ev.target?.result as string, mode: "image" });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Mode tabs */}
      <div className="flex gap-1 bg-white/10 rounded-xl p-1">
        {MODE_TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => switchMode(id)}
            className={cn(
              "flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors",
              mode === id ? "bg-white text-black" : "text-white/60 hover:text-white"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Solid tab */}
      {mode === "solid" && (
        <div className="flex items-center gap-3">
          <span className="text-white/70 text-sm">Colour</span>
          <PickrSwatch
            color={bgConfig.solidColor}
            onChange={(hex) => update({ solidColor: hex, mode: "solid" })}
          />
        </div>
      )}

      {/* Gradient tab */}
      {mode === "gradient" && (
        <div className="flex flex-col gap-4">
          {/* Preset swatches */}
          <div className="grid grid-cols-4 gap-2">
            {PRESET_GRADIENTS.map((preset, i) => (
              <button
                key={i}
                type="button"
                onClick={() => update({ gradient: preset, mode: "gradient" })}
                className={cn(
                  "h-12 rounded-xl transition-all",
                  gradientCSS(bgConfig.gradient) === gradientCSS(preset)
                    ? "ring-2 ring-white ring-offset-2 ring-offset-[#1a1a1a]"
                    : "hover:scale-105"
                )}
                style={{ background: gradientCSS(preset) }}
                aria-label={`Gradient preset ${i + 1}`}
              />
            ))}
          </div>

          {/* Custom stop colours */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-white/70 text-sm">From</span>
              <PickrSwatch
                color={bgConfig.gradient.stops[0].color}
                onChange={(hex) =>
                  update({
                    gradient: {
                      ...bgConfig.gradient,
                      stops: [
                        { ...bgConfig.gradient.stops[0], color: hex },
                        bgConfig.gradient.stops[1],
                      ],
                    },
                  })
                }
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white/70 text-sm">To</span>
              <PickrSwatch
                color={bgConfig.gradient.stops[1].color}
                onChange={(hex) =>
                  update({
                    gradient: {
                      ...bgConfig.gradient,
                      stops: [
                        bgConfig.gradient.stops[0],
                        { ...bgConfig.gradient.stops[1], color: hex },
                      ],
                    },
                  })
                }
              />
            </div>
          </div>

          {/* Angle */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between">
              <span className="text-white/70 text-sm">Angle</span>
              <span className="text-white/50 text-sm">{bgConfig.gradient.angleDeg}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              value={bgConfig.gradient.angleDeg}
              onChange={(e) =>
                update({
                  gradient: { ...bgConfig.gradient, angleDeg: Number(e.target.value) },
                })
              }
              className="w-full accent-white"
            />
          </div>
        </div>
      )}

      {/* Image tab */}
      {mode === "image" && (
        <div className="flex flex-col gap-4">
          <label className="flex flex-col items-center justify-center gap-2 h-24 border border-dashed border-white/20 rounded-xl cursor-pointer hover:bg-white/5 transition-colors">
            <span className="text-white/60 text-sm">
              {bgConfig.imageDataUrl ? "Change photo" : "Upload photo"}
            </span>
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleImageFile}
            />
          </label>

          {bgConfig.imageDataUrl && (
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between">
                <span className="text-white/70 text-sm">Blur</span>
                <span className="text-white/50 text-sm">{bgConfig.imageBlurPx}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                value={bgConfig.imageBlurPx}
                onChange={(e) => update({ imageBlurPx: Number(e.target.value) })}
                className="w-full accent-white"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

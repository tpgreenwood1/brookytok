"use client";

import { useState } from "react";
import { X, Loader2, Eye, EyeOff } from "lucide-react";
import { useCanvas } from "./use-canvas";
import { CanvasArea } from "./canvas-area";
import { Toolbar } from "./toolbar";
import { SlideUpPanel } from "./slide-up-panel";
import { BackgroundPanel } from "./panels/background-panel";
import { TextPanel } from "./panels/text-panel";
import { FontsPanel } from "./panels/fonts-panel";
import { StickersPanel } from "./panels/stickers-panel";
import type { ActivePanel } from "./types";

interface TextCardCreatorProps {
  onExport: (blob: Blob) => void;
  onClose:  () => void;
}

export function TextCardCreator({ onExport, onClose }: TextCardCreatorProps) {
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const [isExporting, setIsExporting] = useState(false);

  const {
    canvasElRef,
    containerRef,
    dims,
    scaledDims,
    aspectRatio,
    setAspectRatio,
    bgConfig,
    setBgConfig,
    selectedObject,
    showSafeZone,
    setShowSafeZone,
    showGuides,
    addTextObject,
    updateSelectedText,
    centerH,
    centerV,
    undo,
    redo,
    canUndo,
    canRedo,
    exportJpeg,
  } = useCanvas();

  const togglePanel = (panel: ActivePanel) => {
    setActivePanel((prev) => (prev === panel ? null : panel));
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = await exportJpeg();
      onExport(blob);
    } finally {
      setIsExporting(false);
    }
  };

  // Cast selectedObject to a plain record for panel props (avoids importing fabric types in this file)
  const selectedObjectRecord = selectedObject as unknown as Record<string, unknown> | null;
  const selectedFontFamily =
    (selectedObjectRecord?.fontFamily as string) ?? "Montserrat";

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[60] flex flex-col bg-black"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close text card creator"
          className="p-1 text-white/70 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <span className="text-white font-semibold text-sm">Create</span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowSafeZone((v) => !v)}
            aria-label={showSafeZone ? "Hide safe zone" : "Show safe zone"}
            className="p-1 text-white/50 hover:text-white transition-colors"
          >
            {showSafeZone ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white text-black text-sm font-semibold disabled:opacity-60 transition-opacity"
          >
            {isExporting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {isExporting ? "Exporting…" : "Done"}
          </button>
        </div>
      </div>

      {/* Canvas area + slide-up panels — flex-1 so this fills remaining space */}
      <div className="flex-1 flex items-center justify-center overflow-hidden relative px-4 py-2">
        <CanvasArea
          canvasElRef={canvasElRef}
          dims={dims}
          scaledDims={scaledDims}
          aspectRatio={aspectRatio}
          onAspectRatioChange={setAspectRatio}
          showSafeZone={showSafeZone}
          showGuides={showGuides}
        />

        {/* Panels slide up from the bottom of this flex container */}
        <SlideUpPanel
          open={activePanel === "background"}
          onClose={() => setActivePanel(null)}
          title="Background"
        >
          <BackgroundPanel bgConfig={bgConfig} onUpdate={setBgConfig} />
        </SlideUpPanel>

        <SlideUpPanel
          open={activePanel === "text"}
          onClose={() => setActivePanel(null)}
          title="Text"
        >
          <TextPanel
            selectedObject={selectedObjectRecord}
            onUpdate={updateSelectedText}
            onCenterH={centerH}
            onCenterV={centerV}
          />
        </SlideUpPanel>

        <SlideUpPanel
          open={activePanel === "fonts"}
          onClose={() => setActivePanel(null)}
          title="Fonts"
        >
          <FontsPanel
            selectedFontFamily={selectedFontFamily}
            onFontSelect={(family) => {
              updateSelectedText({ fontFamily: family });
              setActivePanel(null);
            }}
          />
        </SlideUpPanel>

        <SlideUpPanel
          open={activePanel === "stickers"}
          onClose={() => setActivePanel(null)}
          title="Stickers"
        >
          <StickersPanel />
        </SlideUpPanel>
      </div>

      {/* Persistent bottom toolbar */}
      <Toolbar
        activePanel={activePanel}
        onPanelToggle={togglePanel}
        onAddText={() => {
          addTextObject();
          setActivePanel("text");
        }}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
      />
    </div>
  );
}

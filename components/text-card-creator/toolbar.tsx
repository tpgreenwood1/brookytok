"use client";

import {
  Type,
  Palette,
  Smile,
  Undo2,
  Redo2,
  ScanText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ActivePanel } from "./types";

interface ToolbarProps {
  activePanel: ActivePanel;
  onPanelToggle: (panel: ActivePanel) => void;
  onAddText: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

interface ToolbarButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
}

function ToolbarButton({ icon, label, onClick, active, disabled }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-colors min-w-[52px]",
        active  ? "text-white bg-white/15" : "text-white/70 hover:text-white hover:bg-white/10",
        disabled && "opacity-30 cursor-not-allowed hover:bg-transparent hover:text-white/70"
      )}
    >
      <span className="w-5 h-5">{icon}</span>
      <span className="text-[10px] leading-none">{label}</span>
    </button>
  );
}

export function Toolbar({
  activePanel,
  onPanelToggle,
  onAddText,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: ToolbarProps) {
  return (
    <div className="flex items-center justify-around px-2 py-1 border-t border-white/10 bg-black/80 backdrop-blur-sm">
      <ToolbarButton
        icon={<Type className="w-5 h-5" />}
        label="Text"
        onClick={onAddText}
      />
      <ToolbarButton
        icon={<Palette className="w-5 h-5" />}
        label="Background"
        onClick={() => onPanelToggle(activePanel === "background" ? null : "background")}
        active={activePanel === "background"}
      />
      <ToolbarButton
        icon={<ScanText className="w-5 h-5" />}
        label="Fonts"
        onClick={() => onPanelToggle(activePanel === "fonts" ? null : "fonts")}
        active={activePanel === "fonts"}
      />
      <ToolbarButton
        icon={<Smile className="w-5 h-5" />}
        label="Stickers"
        onClick={() => onPanelToggle(activePanel === "stickers" ? null : "stickers")}
        active={activePanel === "stickers"}
        disabled
      />
      <ToolbarButton
        icon={<Undo2 className="w-5 h-5" />}
        label="Undo"
        onClick={onUndo}
        disabled={!canUndo}
      />
      <ToolbarButton
        icon={<Redo2 className="w-5 h-5" />}
        label="Redo"
        onClick={onRedo}
        disabled={!canRedo}
      />
    </div>
  );
}

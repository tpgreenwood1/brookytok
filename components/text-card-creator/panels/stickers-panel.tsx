"use client";

import { Smile } from "lucide-react";

export function StickersPanel() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10 text-white/40">
      <Smile className="w-10 h-10" />
      <p className="text-sm">Stickers coming soon</p>
    </div>
  );
}

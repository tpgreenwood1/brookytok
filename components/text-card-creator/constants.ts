import type { AspectRatio, BackgroundConfig, CanvasDimensions, GradientConfig } from "./types";

export const CANVAS_DIMS: Record<AspectRatio, CanvasDimensions> = {
  "1:1":  { width: 1080, height: 1080 },
  "4:5":  { width: 864,  height: 1080 },
  "9:16": { width: 607,  height: 1080 },
};

export const FONT_FAMILIES: string[] = [
  "Playfair Display",
  "Merriweather",
  "Montserrat",
  "Raleway",
  "Space Grotesk",
  "Oswald",
  "Bebas Neue",
  "Abril Fatface",
  "DM Serif Display",
  "Lobster",
  "Pacifico",
  "Dancing Script",
];

export const PRESET_GRADIENTS: GradientConfig[] = [
  { stops: [{ color: "#f97316", offset: 0 }, { color: "#ec4899", offset: 1 }], angleDeg: 135 },
  { stops: [{ color: "#6366f1", offset: 0 }, { color: "#8b5cf6", offset: 1 }], angleDeg: 135 },
  { stops: [{ color: "#0ea5e9", offset: 0 }, { color: "#06b6d4", offset: 1 }], angleDeg: 135 },
  { stops: [{ color: "#10b981", offset: 0 }, { color: "#3b82f6", offset: 1 }], angleDeg: 160 },
  { stops: [{ color: "#f43f5e", offset: 0 }, { color: "#fb923c", offset: 1 }], angleDeg: 45  },
  { stops: [{ color: "#1e1b4b", offset: 0 }, { color: "#312e81", offset: 1 }], angleDeg: 180 },
  { stops: [{ color: "#fde68a", offset: 0 }, { color: "#fca5a5", offset: 1 }], angleDeg: 90  },
  { stops: [{ color: "#030712", offset: 0 }, { color: "#1f2937", offset: 1 }], angleDeg: 135 },
];

export const DEFAULT_BG_CONFIG: BackgroundConfig = {
  mode: "gradient",
  solidColor: "#1e1b4b",
  gradient: PRESET_GRADIENTS[0],
  imageDataUrl: null,
  imageBlurPx: 0,
};

export const MAX_HISTORY = 20;
export const DEFAULT_FONT_SIZE = 48;
export const DEFAULT_FONT_FAMILY = "Montserrat";
export const DEFAULT_TEXT_COLOR = "#FFFFFF";
export const SNAP_THRESHOLD = 10;

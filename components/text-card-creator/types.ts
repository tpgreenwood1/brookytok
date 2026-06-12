export type AspectRatio = "1:1" | "4:5" | "9:16";
export type BackgroundMode = "solid" | "gradient" | "image";
export type ActivePanel = "text" | "background" | "fonts" | "stickers" | null;

export interface GradientStop {
  color: string;
  offset: number;
}

export interface GradientConfig {
  stops: [GradientStop, GradientStop];
  angleDeg: number;
}

export interface BackgroundConfig {
  mode: BackgroundMode;
  solidColor: string;
  gradient: GradientConfig;
  imageDataUrl: string | null;
  imageBlurPx: number;
}

export interface CanvasDimensions {
  width: number;
  height: number;
}

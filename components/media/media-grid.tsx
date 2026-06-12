"use client";

import type { MediaItem } from "@/types";
import { VideoPlayer } from "./video-player";
import { MediaCarousel } from "./media-carousel";

interface MediaGridProps {
  media: MediaItem[];
  className?: string;
}

export function MediaGrid({ media, className }: MediaGridProps) {
  if (media.length === 0) return null;

  if (media.length >= 2) {
    return <MediaCarousel items={media.slice(0, 4)} className={className} />;
  }

  const item = media[0];

  if (item.mediaType === "video") {
    return (
      <VideoPlayer item={item} className={`aspect-video w-full ${className ?? ""}`} />
    );
  }

  return (
    <div className={`relative aspect-square bg-surface overflow-hidden ${className ?? ""}`}>
      {/* Using <img> instead of next/image to support any R2 public URL without config changes */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.url}
        alt={item.fileName}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover"
      />
    </div>
  );
}

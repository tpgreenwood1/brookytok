"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MediaItem } from "@/types";

interface VideoPlayerProps {
  item: MediaItem;
  shouldPlay?: boolean;
  showControls?: boolean;
  className?: string;
}

export function VideoPlayer({
  item,
  shouldPlay,
  showControls = true,
  className,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isIntersecting, setIsIntersecting] = useState(false);

  // IntersectionObserver: autoplay when ≥50% of the video is in the viewport.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const intersecting = entry.isIntersecting;
        setIsIntersecting(intersecting);
        const wantPlay =
          intersecting && (shouldPlay === undefined || shouldPlay === true);
        if (wantPlay) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(video);
    return () => {
      observer.disconnect();
      video.pause();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // React to shouldPlay changes while the post is already in the viewport.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const wantPlay =
      isIntersecting && (shouldPlay === undefined || shouldPlay === true);
    if (wantPlay) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [shouldPlay, isIntersecting]);

  function toggleMute() {
    const video = videoRef.current;
    if (!video) return;
    const next = !isMuted;
    video.muted = next;
    setIsMuted(next);
  }

  return (
    <div className={cn("relative group bg-surface overflow-hidden", className)}>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        ref={videoRef}
        src={item.url}
        muted
        loop
        playsInline
        preload="metadata"
        controls={showControls}
        aria-label={item.fileName}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <button
        type="button"
        onClick={toggleMute}
        aria-label={isMuted ? "Unmute" : "Mute"}
        className="absolute bottom-2 right-2 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-black/50 text-white backdrop-blur-sm transition-opacity opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
      >
        {isMuted ? (
          <VolumeX className="w-4 h-4" />
        ) : (
          <Volume2 className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}

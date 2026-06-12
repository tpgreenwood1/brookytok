"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { MediaItem } from "@/types";
import { VideoPlayer } from "./video-player";

interface MediaCarouselProps {
  items: MediaItem[];
  className?: string;
}

export function MediaCarousel({ items, className }: MediaCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  function handleScroll(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    const index = Math.min(
      Math.max(Math.round(el.scrollLeft / el.clientWidth), 0),
      items.length - 1
    );
    if (index !== activeIndex) setActiveIndex(index);
  }

  function scrollToIndex(index: number) {
    scrollRef.current?.scrollTo({
      left: index * (scrollRef.current.clientWidth ?? 0),
      behavior: "smooth",
    });
  }

  return (
    <div className={className}>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
      >
        {items.map((item, i) => (
          <div
            key={item.id}
            className="snap-start flex-none w-full aspect-square relative overflow-hidden bg-surface"
          >
            {item.mediaType === "video" ? (
              <VideoPlayer
                item={item}
                shouldPlay={i === activeIndex}
                showControls={false}
                className="absolute inset-0 w-full h-full aspect-square"
              />
            ) : (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.url}
                  alt={item.fileName}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </>
            )}
          </div>
        ))}
      </div>

      {items.length > 1 && (
        <div
          role="tablist"
          aria-label="Media items"
          className="flex justify-center gap-1.5 pt-2 pb-1"
        >
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === activeIndex}
              aria-label={`Item ${i + 1}`}
              onClick={() => scrollToIndex(i)}
              className={cn(
                "w-1.5 h-1.5 rounded-full transition-colors duration-150",
                i === activeIndex ? "bg-brand" : "bg-border"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}

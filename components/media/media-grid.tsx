import type { MediaItem } from "@/types";
import { cn } from "@/lib/utils";

interface MediaGridProps {
  media: MediaItem[];
  className?: string;
}

// Renders 1–4 media items in a Twitter-style grid.
// 1 item  → full width
// 2 items → side by side
// 3 items → left full-height, right stacked
// 4 items → 2 × 2 grid
export function MediaGrid({ media, className }: MediaGridProps) {
  if (media.length === 0) return null;

  const count = Math.min(media.length, 4);
  const items = media.slice(0, count);

  return (
    <div
      className={cn(
        "overflow-hidden",
        count === 1 && "grid grid-cols-1",
        count === 2 && "grid grid-cols-2 gap-0.5",
        count === 3 && "grid grid-cols-2 gap-0.5",
        count === 4 && "grid grid-cols-2 gap-0.5",
        className
      )}
    >
      {count === 3 ? (
        <>
          <div className="row-span-2">
            <MediaCell item={items[0]} tall />
          </div>
          <MediaCell item={items[1]} />
          <MediaCell item={items[2]} />
        </>
      ) : (
        items.map((item) => <MediaCell key={item.id} item={item} />)
      )}
    </div>
  );
}

interface MediaCellProps {
  item: MediaItem;
  tall?: boolean;
}

function MediaCell({ item, tall }: MediaCellProps) {
  const isVideo = item.mediaType === "video";

  const cellClass = cn(
    "relative bg-surface overflow-hidden",
    tall ? "h-full min-h-[200px]" : "aspect-square"
  );

  if (isVideo) {
    return (
      <div className={cellClass}>
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          src={item.url}
          controls
          preload="metadata"
          className="absolute inset-0 w-full h-full object-cover"
          aria-label={item.fileName}
        />
      </div>
    );
  }

  return (
    <div className={cellClass}>
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

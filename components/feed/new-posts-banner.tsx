"use client";

interface NewPostsBannerProps {
  count: number;
  onRefresh: () => void;
}

export function NewPostsBanner({ count, onRefresh }: NewPostsBannerProps) {
  if (count === 0) return null;

  return (
    <div className="sticky top-[49px] z-20 flex justify-center px-4 py-2 pointer-events-none">
      <button
        type="button"
        onClick={onRefresh}
        className="pointer-events-auto bg-sky-500 text-white text-sm font-semibold px-4 py-2 rounded-full shadow-lg hover:bg-sky-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
        aria-live="polite"
        aria-atomic="true"
      >
        {count} new {count === 1 ? "post" : "posts"} — click to refresh
      </button>
    </div>
  );
}

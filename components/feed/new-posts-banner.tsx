"use client";

interface NewPostsBannerProps {
  count: number;
  onRefresh: () => void;
}

export function NewPostsBanner({ count, onRefresh }: NewPostsBannerProps) {
  if (count === 0) return null;

  return (
    <div className="sticky top-[49px] z-20 flex justify-center px-4 py-2 pointer-events-none animate-slide-up">
      <button
        type="button"
        onClick={onRefresh}
        className="pointer-events-auto bg-brand text-white text-sm font-semibold px-5 py-2 rounded-full shadow-lg hover:bg-brand-hover active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
        aria-live="polite"
        aria-atomic="true"
      >
        {count} new {count === 1 ? "post" : "posts"} — tap to refresh
      </button>
    </div>
  );
}

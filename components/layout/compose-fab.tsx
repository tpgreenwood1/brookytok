"use client";

import { Pencil } from "lucide-react";

export function ComposeFab() {
  function scrollToComposer() {
    document
      .querySelector<HTMLTextAreaElement>("textarea[aria-label='Post content']")
      ?.focus({ preventScroll: false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <button
      onClick={scrollToComposer}
      aria-label="Write a new post"
      className="hidden fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-4 z-40 w-14 h-14 bg-brand hover:bg-brand-hover active:scale-90 text-white rounded-full shadow-xl flex items-center justify-center transition-transform"
    >
      <Pencil className="w-5 h-5" />
    </button>
  );
}

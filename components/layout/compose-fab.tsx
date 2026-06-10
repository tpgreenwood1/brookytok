"use client";

import { Pencil } from "lucide-react";

export function ComposeFab() {
  function scrollToComposer() {
    document.querySelector<HTMLTextAreaElement>("textarea[aria-label='Post content']")?.focus({ preventScroll: false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <button
      onClick={scrollToComposer}
      aria-label="Write a new post"
      className="md:hidden fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] right-4 z-40 w-14 h-14 bg-sky-500 hover:bg-sky-600 active:scale-95 text-white rounded-full shadow-lg flex items-center justify-center transition-transform"
    >
      <Pencil className="w-6 h-6" />
    </button>
  );
}

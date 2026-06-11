"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export function SearchBar({ initialQuery = "" }: { initialQuery?: string }) {
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = (e.currentTarget.elements.namedItem("q") as HTMLInputElement).value.trim();
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <form onSubmit={handleSubmit} role="search">
      <div className="relative">
        <Search
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-muted pointer-events-none"
          aria-hidden
        />
        <input
          name="q"
          type="search"
          defaultValue={initialQuery}
          placeholder="Search people…"
          autoComplete="off"
          className="w-full pl-10 pr-4 py-2.5 rounded-full border border-border bg-surface text-foreground text-base placeholder:text-fg-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-shadow"
        />
      </div>
    </form>
  );
}

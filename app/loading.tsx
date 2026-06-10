import { Shell } from "@/components/layout/shell";

export default function Loading() {
  return (
    <Shell>
      <div className="sticky top-0 bg-white/90 backdrop-blur-sm border-b border-slate-200 px-4 py-3">
        <div className="h-6 w-16 bg-slate-200 rounded animate-pulse" />
      </div>
      <div className="p-4 border-b border-slate-100 flex gap-3">
        <div className="w-10 h-10 rounded-full bg-slate-200 animate-pulse flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-16 bg-slate-100 rounded animate-pulse" />
        </div>
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="p-4 border-b border-slate-100 flex gap-3"
          aria-hidden="true"
        >
          <div className="w-10 h-10 rounded-full bg-slate-200 animate-pulse flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-200 rounded animate-pulse w-32" />
            <div className="h-4 bg-slate-100 rounded animate-pulse w-full" />
            <div className="h-4 bg-slate-100 rounded animate-pulse w-3/4" />
          </div>
        </div>
      ))}
    </Shell>
  );
}

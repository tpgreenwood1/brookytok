import { Shell } from "@/components/layout/shell";

export default function ProfileLoading() {
  return (
    <Shell>
      <div>
        <div className="h-32 bg-slate-200 animate-pulse" />
        <div className="px-4 pb-4">
          <div className="flex justify-between items-start -mt-10 mb-3">
            <div className="w-16 h-16 rounded-full bg-slate-300 animate-pulse ring-4 ring-white" />
          </div>
          <div className="space-y-2">
            <div className="h-6 w-40 bg-slate-200 rounded animate-pulse" />
            <div className="h-4 w-24 bg-slate-100 rounded animate-pulse" />
            <div className="h-4 w-48 bg-slate-100 rounded animate-pulse" />
          </div>
        </div>
        <div className="border-b border-slate-200 h-10" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="p-4 border-b border-slate-100 flex gap-3"
          aria-hidden="true"
        >
          <div className="w-10 h-10 rounded-full bg-slate-200 animate-pulse flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-200 rounded animate-pulse w-32" />
            <div className="h-4 bg-slate-100 rounded animate-pulse w-full" />
          </div>
        </div>
      ))}
    </Shell>
  );
}

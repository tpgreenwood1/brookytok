import { Sidebar } from "./sidebar";
import { BottomNav } from "./bottom-nav";

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-white">
      <Sidebar />
      <main className="flex-1 min-w-0 max-w-2xl border-r border-slate-200 pb-20 md:pb-0">
        {children}
      </main>
      {/* Right panel spacer for wide screens */}
      <div className="hidden xl:block flex-1" aria-hidden="true" />
      <BottomNav />
    </div>
  );
}

import { Sidebar } from "./sidebar";
import { BottomNav } from "./bottom-nav";
import { ComposeFab } from "./compose-fab";
import { TimeTrackingShell } from "./time-tracking-shell";

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      <main className="flex-1 min-w-0 max-w-2xl border-r border-border pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0">
        <TimeTrackingShell>{children}</TimeTrackingShell>
      </main>
      <div className="hidden xl:block flex-1" aria-hidden="true" />
      <ComposeFab />
      <BottomNav />
    </div>
  );
}

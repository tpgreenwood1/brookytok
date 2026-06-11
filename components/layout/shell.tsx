import { BottomNav } from "./bottom-nav";
import { TimeTrackingShell } from "./time-tracking-shell";

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto w-full max-w-[470px] pb-[calc(3rem+env(safe-area-inset-bottom))]">
        <TimeTrackingShell>{children}</TimeTrackingShell>
      </main>
      <BottomNav />
    </div>
  );
}

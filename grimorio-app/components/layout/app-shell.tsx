import { BottomNav } from "./bottom-nav";
import { Sidebar } from "./sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-zinc-100">
      <div
        aria-hidden
        className="bg-ambient pointer-events-none fixed inset-0 -z-10"
      />
      <Sidebar />
      <main className="pb-[calc(3.25rem+env(safe-area-inset-bottom))] md:pl-60 md:pb-0">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
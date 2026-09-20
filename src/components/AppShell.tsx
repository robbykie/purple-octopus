import type { ReactNode } from "react";
import { MobileNav } from "./MobileNav";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="grain flex min-w-0 flex-1 flex-col">
        <MobileNav />
        <TopBar />
        <main className="flex-1 px-6 pt-10 pb-12 sm:px-10">{children}</main>
        <footer className="flex flex-wrap items-center justify-between gap-2 px-6 pb-8 sm:px-10">
          <p className="text-[0.76rem] text-faint">
            Northstar is a personal view, not financial advice.
          </p>
          <p className="eyebrow text-[0.58rem] text-faint">Built for the long view</p>
        </footer>
      </div>
    </div>
  );
}

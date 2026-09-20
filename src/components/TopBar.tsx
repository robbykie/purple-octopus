"use client";

import { usePathname } from "next/navigation";
import { useHydrated } from "@/hooks/useHydrated";
import { usePortfolio } from "@/hooks/usePortfolio";
import { formatLongDate } from "@/lib/format";
import { RefreshIcon } from "./Icons";

const TITLES: Record<string, string> = {
  "/": "Overview",
  "/holdings": "Holdings",
  "/export": "Export report",
};

export function TopBar() {
  const pathname = usePathname();
  const { refresh, loading } = usePortfolio();

  // Held back until hydration is done: the server and the viewer may sit in
  // different time zones, and a mismatched date would be a hydration error.
  const hydrated = useHydrated();
  const today = hydrated ? formatLongDate(new Date()) : null;

  return (
    <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b border-line px-6 py-4 sm:px-10">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[0.82rem]">
        <span className="size-1.5 rounded-full bg-sage" aria-hidden />
        <span className="text-muted">Personal portfolio</span>
        <span className="text-faint" aria-hidden>
          /
        </span>
        <span className="text-body">{TITLES[pathname] ?? "Overview"}</span>
      </nav>

      <div className="flex items-center gap-5">
        <p className="text-right max-sm:hidden">
          <span className="block text-[0.82rem] text-body">{today ?? " "}</span>
          <span className="eyebrow block text-[0.58rem] text-faint">Market hours · New York</span>
        </p>

        <button
          type="button"
          onClick={() => void refresh()}
          disabled={loading}
          className="focus-ring flex items-center gap-2 rounded-lg bg-ink px-3.5 py-2.5 text-[0.82rem] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          <RefreshIcon className={`size-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Refreshing…" : "Refresh quotes"}
        </button>
      </div>
    </header>
  );
}

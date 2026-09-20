"use client";

import { usePortfolio } from "@/hooks/usePortfolio";
import {
  formatCompactCurrency,
  formatCurrency,
  formatPercent,
  formatSignedCurrency,
} from "@/lib/format";
import { PulseIcon } from "./Icons";
import { Sparkline } from "./Sparkline";

export function PortfolioHero() {
  const { summary, history } = usePortfolio();
  const down = summary.dayChange < 0;
  const arrow = down ? "↘" : "↗";

  return (
    <section className="grid grid-cols-1 overflow-hidden rounded-2xl bg-ink text-white lg:grid-cols-[1.35fr_1fr]">
      <div className="relative px-8 pt-8 pb-7">
        {/* Faint concentric rings, echoing the logo. */}
        <svg
          className="pointer-events-none absolute -top-16 right-[-60px] size-[360px] opacity-[0.07]"
          viewBox="0 0 200 200"
          aria-hidden
        >
          <circle cx="100" cy="100" r="95" fill="none" stroke="white" strokeWidth="1" />
          <circle cx="100" cy="100" r="66" fill="none" stroke="white" strokeWidth="1" />
          <circle cx="100" cy="100" r="38" fill="none" stroke="white" strokeWidth="1" />
        </svg>

        <p className="eyebrow mb-5 flex items-center gap-2.5 text-white/45">
          Portfolio value
          <span className="rounded-md bg-white/10 px-2 py-0.5 text-[0.55rem] text-white/70">
            USD
          </span>
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <h2 className="tabular text-[3.4rem] leading-none font-semibold tracking-tight">
            {formatCompactCurrency(summary.totalValue)}
          </h2>
          <span
            className={`tabular rounded-lg px-2.5 py-1.5 text-[0.8rem] ${
              down ? "bg-clay/25 text-clay-soft" : "bg-sage/25 text-sage"
            }`}
          >
            {arrow} {formatCurrency(Math.abs(summary.dayChange))}
          </span>
        </div>

        <p className="tabular mt-3 text-[0.82rem] text-white/50">
          Total return{" "}
          <span className={down && summary.totalReturn < 0 ? "text-clay-soft" : "text-white/80"}>
            {formatSignedCurrency(summary.totalReturn)} (
            {formatPercent(summary.totalReturnPercent)})
          </span>
        </p>

        <div className="mt-8 h-[76px]">
          <Sparkline values={history.map((point) => point.value)} />
        </div>

        <div className="eyebrow mt-3 flex justify-between text-[0.55rem] text-white/30">
          <span>1 month ago</span>
          <span>Today</span>
        </div>
      </div>

      <div className="border-white/10 px-8 pt-8 pb-7 max-lg:border-t lg:border-l">
        <div className="mb-6 flex items-start justify-between">
          <p className="eyebrow text-white/45">Today&rsquo;s movement</p>
          <span className="eyebrow text-[0.55rem] text-white/30">24h</span>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div>
            <p
              className={`tabular text-[2.1rem] leading-none font-medium ${
                down ? "text-clay-soft" : "text-sage"
              }`}
            >
              {formatSignedCurrency(summary.dayChange)}
            </p>
            <p className="tabular mt-3 text-[0.8rem] text-white/45">
              {formatPercent(summary.dayChangePercent)} since yesterday
            </p>
          </div>
          <PulseIcon className={`size-6 ${down ? "text-clay-soft/70" : "text-sage/70"}`} />
        </div>

        <dl className="mt-8 grid grid-cols-2 gap-6 border-t border-white/10 pt-6">
          <div>
            <dt className="eyebrow mb-2 text-white/40">Invested</dt>
            <dd className="tabular text-[1.05rem] text-white">
              {formatCompactCurrency(summary.totalInvested)}
            </dd>
          </div>
          <div>
            <dt className="eyebrow mb-2 text-white/40">Positions</dt>
            <dd className="tabular text-[1.05rem] text-white">{summary.positions.length}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}

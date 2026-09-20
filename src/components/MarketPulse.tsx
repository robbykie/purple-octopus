"use client";

import { usePortfolio } from "@/hooks/usePortfolio";
import { formatCurrency, formatPercent } from "@/lib/format";
import { AssetAvatar } from "./AssetAvatar";

export function MarketPulse() {
  const { summary, ready } = usePortfolio();

  // Loudest movers first — that is what a glance at this card is for.
  const movers = [...summary.positions]
    .filter((position) => position.quote)
    .sort((a, b) => Math.abs(b.dayChangePercent) - Math.abs(a.dayChangePercent))
    .slice(0, 6);

  return (
    <section className="panel flex min-w-0 flex-col p-7">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <p className="eyebrow mb-2 text-faint">Market pulse</p>
          <h3 className="text-[1.3rem] font-semibold">The names moving today</h3>
        </div>
        <span className="eyebrow text-[0.58rem] text-faint">{movers.length} tracked</span>
      </div>

      {movers.length === 0 ? (
        <p className="py-10 text-center text-[0.88rem] text-muted">
          {ready ? "Waiting on the first quotes…" : "Loading…"}
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {movers.map((position) => {
            const down = position.dayChangePercent < 0;
            return (
              <li
                key={position.id}
                className="flex items-center gap-3 rounded-xl border border-line/70 bg-paper/50 px-4 py-3.5"
              >
                <AssetAvatar symbol={position.symbol} size={34} />
                <div className="min-w-0 flex-1">
                  <p className="tabular text-[0.85rem] font-medium">
                    {position.symbol.replace("-USD", "")}
                  </p>
                  <p className="truncate text-[0.72rem] text-faint">
                    {position.quote?.shortName ?? position.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="tabular text-[0.85rem]">{formatCurrency(position.price)}</p>
                  <p className={`tabular text-[0.72rem] ${down ? "text-clay" : "text-sage-deep"}`}>
                    {formatPercent(position.dayChangePercent)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

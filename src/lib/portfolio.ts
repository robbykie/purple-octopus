import type {
  AllocationSlice,
  AssetClass,
  AssetGroup,
  Holding,
  HistorySeries,
  PortfolioSummary,
  Position,
  QuoteMap,
} from "./types";

const GROUP_BY_CLASS: Record<AssetClass, AssetGroup> = {
  stock: "stocks",
  etf: "stocks",
  crypto: "crypto",
  metal: "metals",
  currency: "currency",
};

/** The allocation card always shows all four buckets, in this order. */
export const ASSET_GROUPS: { group: AssetGroup; label: string }[] = [
  { group: "stocks", label: "Stocks" },
  { group: "metals", label: "Metals" },
  { group: "currency", label: "Currency" },
  { group: "crypto", label: "Crypto" },
];

export function groupOf(assetClass: AssetClass): AssetGroup {
  return GROUP_BY_CLASS[assetClass];
}

/** Join one holding with its quote and derive every number the UI shows. */
export function buildPosition(holding: Holding, quotes: QuoteMap): Position {
  const quote = quotes[holding.symbol.toUpperCase()];
  // With no quote we value the position at cost rather than at zero, so a
  // provider outage reads as "unchanged", not "your portfolio vanished".
  const price = quote?.price ?? holding.costBasis;
  const previousClose = quote?.previousClose ?? price;

  const value = holding.quantity * price;
  const invested = holding.quantity * holding.costBasis;
  const dayChange = quote ? holding.quantity * (price - previousClose) : 0;
  const previousValue = holding.quantity * previousClose;
  const totalReturn = value - invested;

  return {
    ...holding,
    quote,
    price,
    value,
    invested,
    dayChange,
    dayChangePercent: previousValue === 0 ? 0 : (dayChange / previousValue) * 100,
    totalReturn,
    totalReturnPercent: invested === 0 ? 0 : (totalReturn / invested) * 100,
    stale: !quote,
  };
}

export function summarize(holdings: Holding[], quotes: QuoteMap): PortfolioSummary {
  const positions = holdings.map((holding) => buildPosition(holding, quotes));

  const totalValue = sum(positions.map((p) => p.value));
  const totalInvested = sum(positions.map((p) => p.invested));
  const dayChange = sum(positions.map((p) => p.dayChange));
  const totalReturn = totalValue - totalInvested;
  const previousValue = totalValue - dayChange;

  return {
    positions,
    totalValue,
    totalInvested,
    dayChange,
    dayChangePercent: previousValue === 0 ? 0 : (dayChange / previousValue) * 100,
    totalReturn,
    totalReturnPercent: totalInvested === 0 ? 0 : (totalReturn / totalInvested) * 100,
    allocation: allocate(positions, totalValue),
    staleSymbols: positions.filter((p) => p.stale).map((p) => p.symbol),
  };
}

function allocate(positions: Position[], totalValue: number): AllocationSlice[] {
  return ASSET_GROUPS.map(({ group, label }) => {
    const value = sum(positions.filter((p) => groupOf(p.assetClass) === group).map((p) => p.value));
    return {
      group,
      label,
      value,
      percent: totalValue === 0 ? 0 : (value / totalValue) * 100,
    };
  });
}

/**
 * Value the current holdings against historical closes, so the hero sparkline
 * shows what this portfolio would have been worth on each of those days.
 * Days where a symbol has no close are carried forward from the last one.
 */
export function portfolioHistory(
  holdings: Holding[],
  series: HistorySeries,
): { t: number; value: number }[] {
  const tracked = holdings.filter((h) => (series[h.symbol.toUpperCase()] ?? []).length > 0);
  if (tracked.length === 0) return [];

  const timeline = [
    ...new Set(tracked.flatMap((h) => series[h.symbol.toUpperCase()].map((p) => p.t))),
  ].sort((a, b) => a - b);

  const cursors = new Map<string, number>();
  const lastClose = new Map<string, number>();

  return timeline.map((t) => {
    let value = 0;
    for (const holding of tracked) {
      const symbol = holding.symbol.toUpperCase();
      const points = series[symbol];
      let i = cursors.get(symbol) ?? 0;
      while (i < points.length && points[i].t <= t) {
        lastClose.set(symbol, points[i].close);
        i += 1;
      }
      cursors.set(symbol, i);
      value += holding.quantity * (lastClose.get(symbol) ?? points[0].close);
    }
    return { t, value };
  });
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

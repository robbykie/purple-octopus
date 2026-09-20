import { describe, expect, it } from "vitest";
import { buildPosition, portfolioHistory, summarize } from "../src/lib/portfolio";
import type { Holding, QuoteMap } from "../src/lib/types";

function quote(symbol: string, price: number, previousClose: number) {
  return {
    symbol,
    price,
    previousClose,
    change: price - previousClose,
    changePercent: ((price - previousClose) / previousClose) * 100,
    currency: "USD",
    asOf: 0,
  };
}

const holdings: Holding[] = [
  { id: "1", symbol: "AAPL", name: "Apple", assetClass: "stock", quantity: 10, costBasis: 100 },
  { id: "2", symbol: "BTC-USD", name: "Bitcoin", assetClass: "crypto", quantity: 2, costBasis: 1000 },
];

const quotes: QuoteMap = {
  AAPL: quote("AAPL", 110, 120),
  "BTC-USD": quote("BTC-USD", 1500, 1400),
};

describe("buildPosition", () => {
  it("derives value, day change and return from quantity and quote", () => {
    const position = buildPosition(holdings[0], quotes);

    expect(position.value).toBe(1100);
    expect(position.invested).toBe(1000);
    expect(position.dayChange).toBe(-100);
    expect(position.dayChangePercent).toBeCloseTo(-8.333, 3);
    expect(position.totalReturn).toBe(100);
    expect(position.totalReturnPercent).toBeCloseTo(10);
    expect(position.stale).toBe(false);
  });

  it("values a position at cost when no quote came back", () => {
    const position = buildPosition(holdings[0], {});

    expect(position.stale).toBe(true);
    expect(position.price).toBe(100);
    expect(position.value).toBe(1000);
    expect(position.dayChange).toBe(0);
    expect(position.totalReturn).toBe(0);
  });

  it("matches symbols case-insensitively", () => {
    const lower = { ...holdings[0], symbol: "aapl" };
    expect(buildPosition(lower, quotes).price).toBe(110);
  });

  it("does not divide by zero on a free position", () => {
    const free = { ...holdings[0], costBasis: 0 };
    expect(buildPosition(free, quotes).totalReturnPercent).toBe(0);
  });
});

describe("summarize", () => {
  it("totals value, cost and day change across positions", () => {
    const summary = summarize(holdings, quotes);

    expect(summary.totalValue).toBe(1100 + 3000);
    expect(summary.totalInvested).toBe(1000 + 2000);
    expect(summary.dayChange).toBe(-100 + 200);
    expect(summary.totalReturn).toBe(1100);
    // Previous close value was 1200 + 2800 = 4000; +100 on that is +2.5%.
    expect(summary.dayChangePercent).toBeCloseTo(2.5);
  });

  it("reports all four allocation buckets, zeros included", () => {
    const allocation = summarize(holdings, quotes).allocation;

    expect(allocation.map((slice) => slice.group)).toEqual([
      "stocks",
      "metals",
      "currency",
      "crypto",
    ]);
    expect(allocation.find((s) => s.group === "stocks")?.percent).toBeCloseTo(26.829, 3);
    expect(allocation.find((s) => s.group === "crypto")?.percent).toBeCloseTo(73.171, 3);
    expect(allocation.find((s) => s.group === "metals")?.value).toBe(0);
  });

  it("groups ETFs with stocks", () => {
    const etf: Holding = {
      id: "3", symbol: "VTI", name: "Vanguard", assetClass: "etf", quantity: 1, costBasis: 100,
    };
    const summary = summarize([etf], { VTI: quote("VTI", 200, 200) });

    expect(summary.allocation.find((s) => s.group === "stocks")?.percent).toBe(100);
  });

  it("handles an empty portfolio without NaN", () => {
    const summary = summarize([], {});

    expect(summary.totalValue).toBe(0);
    expect(summary.dayChangePercent).toBe(0);
    expect(summary.totalReturnPercent).toBe(0);
    expect(summary.allocation.every((slice) => slice.percent === 0)).toBe(true);
  });

  it("lists symbols that came back unpriced", () => {
    expect(summarize(holdings, { AAPL: quotes.AAPL }).staleSymbols).toEqual(["BTC-USD"]);
  });
});

describe("portfolioHistory", () => {
  const series = {
    AAPL: [
      { t: 1, close: 100 },
      { t: 2, close: 110 },
      { t: 3, close: 120 },
    ],
    "BTC-USD": [
      { t: 1, close: 1000 },
      { t: 3, close: 1200 },
    ],
  };

  it("values current quantities against each day's closes", () => {
    const history = portfolioHistory(holdings, series);

    expect(history).toEqual([
      { t: 1, value: 10 * 100 + 2 * 1000 },
      { t: 2, value: 10 * 110 + 2 * 1000 }, // BTC has no t=2 close; carried forward.
      { t: 3, value: 10 * 120 + 2 * 1200 },
    ]);
  });

  it("skips holdings with no series at all", () => {
    const withUnknown = [
      ...holdings,
      { id: "4", symbol: "XYZ", name: "Unknown", assetClass: "stock" as const, quantity: 5, costBasis: 1 },
    ];
    expect(portfolioHistory(withUnknown, series)).toEqual(portfolioHistory(holdings, series));
  });

  it("returns nothing when no symbol has history", () => {
    expect(portfolioHistory(holdings, {})).toEqual([]);
  });
});

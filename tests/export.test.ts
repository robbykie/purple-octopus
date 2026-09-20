import { describe, expect, it } from "vitest";
import { toCsv, toJson } from "../src/lib/export";
import { summarize } from "../src/lib/portfolio";
import type { Holding } from "../src/lib/types";

const holdings: Holding[] = [
  { id: "1", symbol: "AAPL", name: "Apple, Inc.", assetClass: "stock", quantity: 10, costBasis: 100 },
];

const quotes = {
  AAPL: {
    symbol: "AAPL",
    price: 110,
    previousClose: 100,
    change: 10,
    changePercent: 10,
    currency: "USD",
    asOf: 1_700_000_000_000,
  },
};

describe("toCsv", () => {
  it("writes a header, a row per position and a totals row", () => {
    const lines = toCsv(summarize(holdings, quotes)).split("\n");

    expect(lines).toHaveLength(3);
    expect(lines[0]).toMatch(/^symbol,name,asset_class/);
    expect(lines[1]).toContain("AAPL");
    expect(lines[2]).toMatch(/^TOTAL,/);
  });

  it("quotes fields containing a comma", () => {
    expect(toCsv(summarize(holdings, quotes))).toContain('"Apple, Inc."');
  });
});

describe("toJson", () => {
  it("carries totals, allocation and quote timestamps", () => {
    const report = JSON.parse(toJson(summarize(holdings, quotes)));

    expect(report.totals.marketValue).toBe(1100);
    expect(report.allocation).toHaveLength(4);
    expect(report.positions[0].quotedAt).toBe("2023-11-14T22:13:20.000Z");
  });

  it("marks an unpriced position as never quoted", () => {
    const report = JSON.parse(toJson(summarize(holdings, {})));
    expect(report.positions[0].quotedAt).toBeNull();
  });
});

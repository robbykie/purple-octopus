import { beforeEach, describe, expect, it, vi } from "vitest";
import { SEED_HOLDINGS, loadHoldings, saveHoldings } from "../src/lib/storage";

const KEY = "northstar.holdings.v1";

function mockBrowser() {
  const store = new Map<string, string>();
  vi.stubGlobal("window", {
    localStorage: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => void store.set(key, value),
    },
  });
  return store;
}

describe("loadHoldings", () => {
  beforeEach(() => vi.unstubAllGlobals());

  it("seeds a first-time visitor", () => {
    mockBrowser();
    expect(loadHoldings()).toEqual(SEED_HOLDINGS);
  });

  it("keeps an explicitly emptied portfolio empty", () => {
    const store = mockBrowser();
    store.set(KEY, "[]");
    expect(loadHoldings()).toEqual([]);
  });

  it("drops malformed records instead of throwing", () => {
    const store = mockBrowser();
    store.set(
      KEY,
      JSON.stringify([
        { id: "a", symbol: "AAPL", name: "Apple", assetClass: "stock", quantity: 1, costBasis: 2 },
        { id: "b", symbol: "", quantity: 1, costBasis: 2 },
        { id: "c", symbol: "MSFT", quantity: "not a number", costBasis: 2 },
        "garbage",
      ]),
    );

    const holdings = loadHoldings();
    expect(holdings).toHaveLength(1);
    expect(holdings[0].symbol).toBe("AAPL");
  });

  it("normalises tickers and fills a missing name and class", () => {
    const store = mockBrowser();
    store.set(KEY, JSON.stringify([{ id: "a", symbol: " btc-usd ", quantity: 1, costBasis: 2 }]));

    const [holding] = loadHoldings();
    expect(holding.symbol).toBe("BTC-USD");
    expect(holding.name).toBe("BTC-USD");
    expect(holding.assetClass).toBe("stock");
  });

  it("recovers from a corrupt blob", () => {
    const store = mockBrowser();
    store.set(KEY, "{not json");
    expect(loadHoldings()).toEqual([]);
  });

  it("round-trips through save", () => {
    mockBrowser();
    saveHoldings(SEED_HOLDINGS);
    expect(loadHoldings()).toEqual(SEED_HOLDINGS);
  });
});

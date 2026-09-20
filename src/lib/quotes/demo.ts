import type { HistoryPoint, Quote } from "../types";

/**
 * Offline provider. Used when QUOTES_PROVIDER=demo, and as the fallback when
 * the network is unavailable, so the UI can be developed and demoed without
 * reaching a market data vendor. Prices are deterministic per symbol and day —
 * not real, and the UI labels them as such.
 */

const BASE_PRICES: Record<string, number> = {
  AAPL: 336.13,
  MSFT: 493.78,
  VTI: 375.43,
  NVDA: 214.8,
  "BTC-USD": 80358.0,
  "ETH-USD": 2574.4,
  "GC=F": 4190.5,
  "SI=F": 51.2,
  "EURUSD=X": 1.0842,
};

const NAMES: Record<string, string> = {
  AAPL: "Apple Inc.",
  MSFT: "Microsoft Corporation",
  VTI: "Vanguard Total Stock Market ETF",
  NVDA: "NVIDIA Corporation",
  "BTC-USD": "Bitcoin",
  "ETH-USD": "Ethereum",
  "GC=F": "Gold Futures",
  "SI=F": "Silver Futures",
  "EURUSD=X": "EUR/USD",
};

/** Stable hash so a symbol always gets the same pseudo-random sequence. */
function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Deterministic value in [-1, 1) for a symbol on a given day index. */
function wobble(symbol: string, day: number): number {
  const seed = hash(`${symbol}:${day}`);
  return (seed % 2000) / 1000 - 1;
}

function basePrice(symbol: string): number {
  return BASE_PRICES[symbol] ?? 50 + (hash(symbol) % 45000) / 100;
}

const DAY_MS = 86_400_000;

export async function fetchQuote(symbol: string): Promise<Quote> {
  const key = symbol.toUpperCase();
  const today = Math.floor(Date.now() / DAY_MS);
  const base = basePrice(key);

  const previousClose = round(base * (1 + wobble(key, today - 1) * 0.01), key);
  const price = round(previousClose * (1 + wobble(key, today) * 0.015), key);
  const change = price - previousClose;

  return {
    symbol: key,
    price,
    previousClose,
    change,
    changePercent: previousClose === 0 ? 0 : (change / previousClose) * 100,
    currency: "USD",
    shortName: NAMES[key],
    asOf: Date.now(),
  };
}

export async function fetchHistory(symbol: string, range = "1mo"): Promise<HistoryPoint[]> {
  const key = symbol.toUpperCase();
  const days = range === "3mo" ? 66 : range === "6mo" ? 130 : range === "1y" ? 252 : 22;
  const today = Math.floor(Date.now() / DAY_MS);
  const base = basePrice(key);

  const points: HistoryPoint[] = [];
  let level = base * 0.94;
  for (let i = days; i >= 0; i -= 1) {
    const day = today - i;
    level *= 1 + wobble(key, day) * 0.012 + 0.0025;
    points.push({ t: day * DAY_MS, close: round(level, key) });
  }
  return points;
}

function round(value: number, symbol: string): number {
  const decimals = symbol.endsWith("=X") ? 4 : 2;
  return Number(value.toFixed(decimals));
}

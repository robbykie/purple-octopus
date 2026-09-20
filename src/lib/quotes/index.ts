import type { HistoryPoint, Quote, QuoteMap } from "../types";
import * as demo from "./demo";
import * as yahoo from "./yahoo";

export type ProviderName = "yahoo" | "demo";

export function configuredProvider(): ProviderName {
  return process.env.QUOTES_PROVIDER === "demo" ? "demo" : "yahoo";
}

function cacheTtlMs(): number {
  const seconds = Number(process.env.QUOTES_CACHE_TTL ?? 30);
  return (Number.isFinite(seconds) && seconds > 0 ? seconds : 30) * 1000;
}

type CacheEntry<T> = { value: T; expires: number };

// Process-local cache. A dev refresh loop or several open tabs then cost the
// upstream provider one request per symbol per TTL, not one per page view.
const quoteCache = new Map<string, CacheEntry<Quote>>();
const historyCache = new Map<string, CacheEntry<HistoryPoint[]>>();

function cached<T>(store: Map<string, CacheEntry<T>>, key: string): T | undefined {
  const entry = store.get(key);
  if (!entry) return undefined;
  if (entry.expires < Date.now()) {
    store.delete(key);
    return undefined;
  }
  return entry.value;
}

export type QuotesResult = {
  quotes: QuoteMap;
  provider: ProviderName;
  /** Symbols the provider could not price. */
  failed: string[];
  /** True when the live provider failed and demo data stood in for it. */
  degraded: boolean;
};

export async function getQuotes(symbols: string[]): Promise<QuotesResult> {
  const configured = configuredProvider();
  const unique = [...new Set(symbols.map((s) => s.trim().toUpperCase()).filter(Boolean))];

  const quotes: QuoteMap = {};
  const failed: string[] = [];
  let degraded = false;

  await Promise.all(
    unique.map(async (symbol) => {
      const hit = cached(quoteCache, symbol);
      if (hit) {
        quotes[symbol] = hit;
        return;
      }

      try {
        const quote = await provider(configured).fetchQuote(symbol);
        quoteCache.set(symbol, { value: quote, expires: Date.now() + cacheTtlMs() });
        quotes[symbol] = quote;
      } catch (error) {
        if (configured === "yahoo" && allowDemoFallback()) {
          // The network is unavailable or the vendor is down. Serve demo
          // numbers rather than an empty dashboard, and flag it loudly.
          degraded = true;
          quotes[symbol] = await demo.fetchQuote(symbol);
        } else {
          failed.push(symbol);
          console.warn(`[quotes] ${symbol}: ${(error as Error).message}`);
        }
      }
    }),
  );

  return { quotes, provider: degraded ? "demo" : configured, failed, degraded };
}

export async function getHistory(
  symbols: string[],
  range: string,
): Promise<{ series: Record<string, HistoryPoint[]>; degraded: boolean }> {
  const configured = configuredProvider();
  const unique = [...new Set(symbols.map((s) => s.trim().toUpperCase()).filter(Boolean))];

  const series: Record<string, HistoryPoint[]> = {};
  let degraded = false;

  await Promise.all(
    unique.map(async (symbol) => {
      const key = `${symbol}:${range}`;
      const hit = cached(historyCache, key);
      if (hit) {
        series[symbol] = hit;
        return;
      }

      try {
        const points = await provider(configured).fetchHistory(symbol, range);
        // History only moves once a day; hold it far longer than a quote.
        historyCache.set(key, { value: points, expires: Date.now() + 15 * 60 * 1000 });
        series[symbol] = points;
      } catch (error) {
        if (configured === "yahoo" && allowDemoFallback()) {
          degraded = true;
          series[symbol] = await demo.fetchHistory(symbol, range);
        } else {
          console.warn(`[history] ${symbol}: ${(error as Error).message}`);
        }
      }
    }),
  );

  return { series, degraded };
}

function provider(name: ProviderName) {
  return name === "demo" ? demo : yahoo;
}

function allowDemoFallback(): boolean {
  return process.env.QUOTES_DEMO_FALLBACK !== "off";
}

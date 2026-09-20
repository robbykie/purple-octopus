import type { HistoryPoint, Quote } from "../types";

const CHART = "https://query1.finance.yahoo.com/v8/finance/chart";

// Yahoo's public chart endpoint rejects requests without a browser-ish agent.
const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
  Accept: "application/json",
};

type ChartMeta = {
  symbol?: string;
  currency?: string;
  regularMarketPrice?: number;
  previousClose?: number;
  chartPreviousClose?: number;
  regularMarketTime?: number;
  shortName?: string;
  longName?: string;
};

type ChartResponse = {
  chart?: {
    result?: {
      meta?: ChartMeta;
      timestamp?: number[];
      indicators?: { quote?: { close?: (number | null)[] }[] };
    }[];
    error?: { description?: string } | null;
  };
};

async function chart(symbol: string, range: string, interval: string): Promise<ChartResponse> {
  const url = `${CHART}/${encodeURIComponent(symbol)}?interval=${interval}&range=${range}`;
  const response = await fetch(url, { headers: HEADERS, cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Yahoo responded ${response.status} for ${symbol}`);
  }
  return (await response.json()) as ChartResponse;
}

export async function fetchQuote(symbol: string): Promise<Quote> {
  const data = await chart(symbol, "5d", "1d");
  const result = data.chart?.result?.[0];
  const meta = result?.meta;
  const price = meta?.regularMarketPrice;

  if (!meta || typeof price !== "number") {
    throw new Error(`No price for ${symbol}`);
  }

  // previousClose is the official prior session; chartPreviousClose is the
  // close before the chart's first candle. Either works as a day-change base.
  const previousClose = meta.previousClose ?? meta.chartPreviousClose ?? price;
  const change = price - previousClose;

  return {
    symbol: symbol.toUpperCase(),
    price,
    previousClose,
    change,
    changePercent: previousClose === 0 ? 0 : (change / previousClose) * 100,
    currency: meta.currency ?? "USD",
    shortName: meta.shortName ?? meta.longName,
    asOf: meta.regularMarketTime ? meta.regularMarketTime * 1000 : Date.now(),
  };
}

export async function fetchHistory(symbol: string, range = "1mo"): Promise<HistoryPoint[]> {
  const data = await chart(symbol, range, "1d");
  const result = data.chart?.result?.[0];
  const stamps = result?.timestamp ?? [];
  const closes = result?.indicators?.quote?.[0]?.close ?? [];

  const points: HistoryPoint[] = [];
  for (let i = 0; i < stamps.length; i += 1) {
    const close = closes[i];
    // Holidays and halts come back as nulls; drop them rather than plot zeros.
    if (typeof close === "number" && Number.isFinite(close)) {
      points.push({ t: stamps[i] * 1000, close });
    }
  }
  return points;
}

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  getServerSnapshot,
  getSnapshot,
  subscribe,
  updateHoldings,
} from "@/lib/holdingsStore";
import { newId } from "@/lib/storage";
import { portfolioHistory, summarize } from "@/lib/portfolio";
import type { Holding, HistorySeries, PortfolioSummary, QuoteMap } from "@/lib/types";
import { useHydrated } from "./useHydrated";

const REFRESH_MS = 60_000;

const NO_QUOTES: QuoteMap = {};
const NO_SERIES: HistorySeries = {};

export type ConnectionState = "connecting" | "connected" | "demo" | "offline";

type PortfolioContextValue = {
  holdings: Holding[];
  quotes: QuoteMap;
  summary: PortfolioSummary;
  history: { t: number; value: number }[];
  connection: ConnectionState;
  lastSyncedAt: number | null;
  loading: boolean;
  /** False until the browser's stored holdings have been read. */
  ready: boolean;
  refresh: () => Promise<void>;
  addHolding: (holding: Omit<Holding, "id">) => void;
  updateHolding: (id: string, patch: Partial<Omit<Holding, "id">>) => void;
  removeHolding: (id: string) => void;
};

const PortfolioContext = createContext<PortfolioContextValue | null>(null);

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const holdings = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const ready = useHydrated();

  const [quotes, setQuotes] = useState<QuoteMap>(NO_QUOTES);
  const [series, setSeries] = useState<HistorySeries>(NO_SERIES);
  const [fetchState, setFetchState] = useState<"idle" | "demo" | "offline">("idle");
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const symbols = useMemo(
    () => [...new Set(holdings.map((h) => h.symbol.toUpperCase()))].sort(),
    [holdings],
  );
  const symbolKey = symbols.join(",");

  // Held in a ref so the polling effect does not restart on every fetch.
  const inFlight = useRef(false);

  /**
   * `spinner` is off for the background poll: the button shows progress when a
   * person asks for it, while the timer refreshes quietly. It also keeps the
   * automatic path free of state updates until the first response lands.
   */
  const load = useCallback(
    async (spinner: boolean) => {
      if (!symbolKey || inFlight.current) return;
      inFlight.current = true;
      if (spinner) setLoading(true);

      try {
        const [quoteResponse, historyResponse] = await Promise.all([
          fetch(`/api/quotes?symbols=${encodeURIComponent(symbolKey)}`),
          fetch(`/api/history?symbols=${encodeURIComponent(symbolKey)}&range=1mo`),
        ]);

        if (!quoteResponse.ok) throw new Error(`quotes: ${quoteResponse.status}`);

        const quoteData = (await quoteResponse.json()) as {
          quotes: QuoteMap;
          degraded?: boolean;
          provider?: string;
        };
        setQuotes(quoteData.quotes ?? NO_QUOTES);
        setFetchState(quoteData.degraded || quoteData.provider === "demo" ? "demo" : "idle");
        setLastSyncedAt(Date.now());

        if (historyResponse.ok) {
          const historyData = (await historyResponse.json()) as { series: HistorySeries };
          setSeries(historyData.series ?? NO_SERIES);
        }
      } catch (error) {
        console.warn("[portfolio] refresh failed", error);
        setFetchState("offline");
      } finally {
        inFlight.current = false;
        if (spinner) setLoading(false);
      }
    },
    [symbolKey],
  );

  /** What the Refresh button calls. */
  const refresh = useCallback(() => load(true), [load]);

  useEffect(() => {
    if (!symbolKey) return;

    // Every state update inside `load` happens after an await, in a response
    // handler — not synchronously during this effect. The lint rule cannot see
    // through the async boundary, and polling an external API on an interval
    // is precisely the subscription an effect is meant to own.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load(false);
    const timer = setInterval(() => void load(false), REFRESH_MS);
    return () => clearInterval(timer);
  }, [symbolKey, load]);

  // An empty portfolio has nothing to look up, so its quotes are empty by
  // derivation rather than by clearing state from an effect.
  const activeQuotes = symbolKey ? quotes : NO_QUOTES;
  const activeSeries = symbolKey ? series : NO_SERIES;

  const connection: ConnectionState = !symbolKey
    ? "connected"
    : fetchState === "demo"
      ? "demo"
      : fetchState === "offline"
        ? "offline"
        : lastSyncedAt === null
          ? "connecting"
          : "connected";

  const summary = useMemo(() => summarize(holdings, activeQuotes), [holdings, activeQuotes]);
  const history = useMemo(
    () => portfolioHistory(holdings, activeSeries),
    [holdings, activeSeries],
  );

  const addHolding = useCallback((holding: Omit<Holding, "id">) => {
    updateHoldings((current) => [...current, { ...holding, id: newId() }]);
  }, []);

  const updateHolding = useCallback((id: string, patch: Partial<Omit<Holding, "id">>) => {
    updateHoldings((current) => current.map((h) => (h.id === id ? { ...h, ...patch } : h)));
  }, []);

  const removeHolding = useCallback((id: string) => {
    updateHoldings((current) => current.filter((h) => h.id !== id));
  }, []);

  const value: PortfolioContextValue = {
    holdings,
    quotes: activeQuotes,
    summary,
    history,
    connection,
    lastSyncedAt,
    loading,
    ready,
    refresh,
    addHolding,
    updateHolding,
    removeHolding,
  };

  return <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>;
}

export function usePortfolio(): PortfolioContextValue {
  const context = useContext(PortfolioContext);
  if (!context) throw new Error("usePortfolio must be used inside a PortfolioProvider");
  return context;
}

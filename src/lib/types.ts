export type AssetClass = "stock" | "etf" | "crypto" | "metal" | "currency";

/** A position as the user entered it. This is the only thing we persist. */
export type Holding = {
  id: string;
  /** Ticker as the quote provider knows it, e.g. AAPL, VTI, BTC-USD. */
  symbol: string;
  name: string;
  assetClass: AssetClass;
  quantity: number;
  /** Average price paid, in the portfolio currency. */
  costBasis: number;
};

/** A live quote for one symbol. */
export type Quote = {
  symbol: string;
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  currency: string;
  /** Provider's name for the instrument, used to fill in blanks. */
  shortName?: string;
  /** Epoch millis of the last trade the provider saw. */
  asOf: number;
};

export type QuoteMap = Record<string, Quote>;

/** One holding joined with its quote, plus everything derived from the pair. */
export type Position = Holding & {
  quote?: Quote;
  price: number;
  value: number;
  invested: number;
  dayChange: number;
  dayChangePercent: number;
  totalReturn: number;
  totalReturnPercent: number;
  /** True when no quote came back and we are valuing at cost. */
  stale: boolean;
};

export type AllocationSlice = {
  group: AssetGroup;
  label: string;
  value: number;
  percent: number;
};

/** The four buckets the allocation card reports on. */
export type AssetGroup = "stocks" | "metals" | "currency" | "crypto";

export type PortfolioSummary = {
  positions: Position[];
  totalValue: number;
  totalInvested: number;
  dayChange: number;
  dayChangePercent: number;
  totalReturn: number;
  totalReturnPercent: number;
  allocation: AllocationSlice[];
  /** Symbols we asked for but got no quote back on. */
  staleSymbols: string[];
};

export type HistoryPoint = { t: number; close: number };

export type HistorySeries = Record<string, HistoryPoint[]>;

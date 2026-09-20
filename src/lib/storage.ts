import type { AssetClass, Holding } from "./types";

const STORAGE_KEY = "northstar.holdings.v1";

/** What a first-time visitor sees, so the dashboard is never an empty shell. */
export const SEED_HOLDINGS: Holding[] = [
  { id: "seed-aapl", symbol: "AAPL", name: "Apple", assetClass: "stock", quantity: 18, costBasis: 164.21 },
  { id: "seed-btc", symbol: "BTC-USD", name: "Bitcoin", assetClass: "crypto", quantity: 0.42, costBasis: 38200 },
  { id: "seed-msft", symbol: "MSFT", name: "Microsoft", assetClass: "stock", quantity: 11, costBasis: 312.8 },
  { id: "seed-vti", symbol: "VTI", name: "Vanguard Total Stock Market", assetClass: "etf", quantity: 24, costBasis: 218.43 },
  { id: "seed-eth", symbol: "ETH-USD", name: "Ethereum", assetClass: "crypto", quantity: 2.8, costBasis: 1840 },
];

const ASSET_CLASSES: AssetClass[] = ["stock", "etf", "crypto", "metal", "currency"];

export const ASSET_CLASS_LABELS: Record<AssetClass, string> = {
  stock: "US stock",
  etf: "ETF",
  crypto: "Crypto",
  metal: "Metal",
  currency: "Currency",
};

export function loadHoldings(): Holding[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return SEED_HOLDINGS;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // An empty array is a real state (the user deleted everything), so it is
    // kept as-is — only a missing key reseeds.
    return parsed.map(sanitize).filter((h): h is Holding => h !== null);
  } catch {
    return [];
  }
}

export function saveHoldings(holdings: Holding[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(holdings));
  } catch (error) {
    console.warn("[storage] could not persist holdings", error);
  }
}

/** Accept only well-formed records, so a hand-edited or stale blob can't crash the app. */
function sanitize(value: unknown): Holding | null {
  if (typeof value !== "object" || value === null) return null;
  const record = value as Record<string, unknown>;

  const symbol = typeof record.symbol === "string" ? record.symbol.trim().toUpperCase() : "";
  const quantity = Number(record.quantity);
  const costBasis = Number(record.costBasis);

  if (!symbol || !Number.isFinite(quantity) || !Number.isFinite(costBasis)) return null;

  const assetClass = ASSET_CLASSES.includes(record.assetClass as AssetClass)
    ? (record.assetClass as AssetClass)
    : "stock";

  return {
    id: typeof record.id === "string" && record.id ? record.id : newId(),
    symbol,
    name: typeof record.name === "string" && record.name ? record.name : symbol,
    assetClass,
    quantity,
    costBasis,
  };
}

export function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `h_${Math.random().toString(36).slice(2, 10)}`;
}

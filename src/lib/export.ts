import type { PortfolioSummary } from "./types";

const COLUMNS = [
  "symbol",
  "name",
  "asset_class",
  "quantity",
  "cost_basis",
  "price",
  "market_value",
  "invested",
  "day_change",
  "day_change_percent",
  "total_return",
  "total_return_percent",
] as const;

/** Spreadsheet-ready snapshot of every position, plus a totals row. */
export function toCsv(summary: PortfolioSummary): string {
  const rows = summary.positions.map((position) => [
    position.symbol,
    position.name,
    position.assetClass,
    position.quantity,
    position.costBasis,
    round(position.price),
    round(position.value),
    round(position.invested),
    round(position.dayChange),
    round(position.dayChangePercent),
    round(position.totalReturn),
    round(position.totalReturnPercent),
  ]);

  rows.push([
    "TOTAL",
    "",
    "",
    "",
    "",
    "",
    round(summary.totalValue),
    round(summary.totalInvested),
    round(summary.dayChange),
    round(summary.dayChangePercent),
    round(summary.totalReturn),
    round(summary.totalReturnPercent),
  ]);

  return [COLUMNS.join(","), ...rows.map((row) => row.map(escape).join(","))].join("\n");
}

export function toJson(summary: PortfolioSummary): string {
  return JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      totals: {
        marketValue: round(summary.totalValue),
        invested: round(summary.totalInvested),
        dayChange: round(summary.dayChange),
        dayChangePercent: round(summary.dayChangePercent),
        totalReturn: round(summary.totalReturn),
        totalReturnPercent: round(summary.totalReturnPercent),
      },
      allocation: summary.allocation.map((slice) => ({
        group: slice.group,
        value: round(slice.value),
        percent: round(slice.percent),
      })),
      positions: summary.positions.map((position) => ({
        symbol: position.symbol,
        name: position.name,
        assetClass: position.assetClass,
        quantity: position.quantity,
        costBasis: position.costBasis,
        price: round(position.price),
        marketValue: round(position.value),
        totalReturn: round(position.totalReturn),
        totalReturnPercent: round(position.totalReturnPercent),
        quotedAt: position.quote ? new Date(position.quote.asOf).toISOString() : null,
      })),
    },
    null,
    2,
  );
}

/** Quote any field carrying a comma, quote or newline, per RFC 4180. */
function escape(value: string | number): string {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function round(value: number): number {
  return Number(value.toFixed(2));
}

export function download(filename: string, contents: string, mime: string): void {
  const blob = new Blob([contents], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

"use client";

import { usePortfolio } from "@/hooks/usePortfolio";
import { formatCurrency, formatPercent, formatSignedCurrency } from "@/lib/format";

export function HoldingsSummary() {
  const { summary } = usePortfolio();

  const best = [...summary.positions].sort(
    (a, b) => b.totalReturnPercent - a.totalReturnPercent,
  )[0];

  const stats = [
    { label: "Market value", value: formatCurrency(summary.totalValue) },
    { label: "Cost basis", value: formatCurrency(summary.totalInvested) },
    {
      label: "Unrealised return",
      value: formatSignedCurrency(summary.totalReturn),
      tone: summary.totalReturn < 0 ? "text-clay" : "text-sage-deep",
    },
    {
      label: "Today",
      value: formatSignedCurrency(summary.dayChange),
      tone: summary.dayChange < 0 ? "text-clay" : "text-sage-deep",
    },
    {
      label: "Best performer",
      value: best ? `${best.symbol.replace("-USD", "")} ${formatPercent(best.totalReturnPercent)}` : "—",
    },
  ];

  return (
    <dl className="panel grid grid-cols-1 gap-6 p-7 sm:grid-cols-3 lg:grid-cols-5">
      {stats.map((stat) => (
        <div key={stat.label}>
          <dt className="eyebrow mb-2.5 text-faint">{stat.label}</dt>
          <dd className={`tabular text-[1.15rem] font-medium ${stat.tone ?? ""}`}>{stat.value}</dd>
        </div>
      ))}
    </dl>
  );
}

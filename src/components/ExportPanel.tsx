"use client";

import { usePortfolio } from "@/hooks/usePortfolio";
import { download, toCsv, toJson } from "@/lib/export";
import { formatCurrency } from "@/lib/format";
import { ExportIcon } from "./Icons";

export function ExportPanel() {
  const { summary, holdings } = usePortfolio();
  const stamp = new Date().toISOString().slice(0, 10);

  return (
    <section className="panel p-7">
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <p className="text-[0.9rem] text-muted">
          <span className="tabular text-body">{summary.positions.length}</span> positions ·{" "}
          <span className="tabular text-body">{formatCurrency(summary.totalValue)}</span> market
          value
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card
          title="Spreadsheet"
          description="One row per position plus a totals row. Opens in Excel, Numbers or Sheets."
          action="Download CSV"
          onClick={() => download(`northstar-${stamp}.csv`, toCsv(summary), "text/csv")}
        />
        <Card
          title="Full snapshot"
          description="Totals, allocation and positions with quote timestamps, as JSON."
          action="Download JSON"
          onClick={() => download(`northstar-${stamp}.json`, toJson(summary), "application/json")}
        />
        <Card
          title="Backup"
          description="Just your holdings, in the shape this app stores them. Keep it somewhere safe."
          action="Download backup"
          onClick={() =>
            download(
              `northstar-holdings-${stamp}.json`,
              JSON.stringify(holdings, null, 2),
              "application/json",
            )
          }
        />
      </div>
    </section>
  );
}

function Card({
  title,
  description,
  action,
  onClick,
}: {
  title: string;
  description: string;
  action: string;
  onClick: () => void;
}) {
  return (
    <div className="flex flex-col rounded-xl border border-line bg-paper/50 p-5">
      <ExportIcon className="mb-4 size-5 text-sage-deep" />
      <h3 className="mb-2 text-[0.95rem] font-medium">{title}</h3>
      <p className="mb-5 text-[0.82rem] leading-relaxed text-muted">{description}</p>
      <button
        type="button"
        onClick={onClick}
        className="focus-ring mt-auto self-start rounded-lg border border-line bg-card px-3.5 py-2.5 text-[0.82rem] font-medium transition-colors hover:bg-card/60"
      >
        {action}
      </button>
    </div>
  );
}

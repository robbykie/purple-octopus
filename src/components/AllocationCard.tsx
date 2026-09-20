"use client";

import { usePortfolio } from "@/hooks/usePortfolio";
import { formatCompactCurrency } from "@/lib/format";
import type { AssetGroup } from "@/lib/types";
import { DotsIcon, SparkIcon } from "./Icons";

const COLORS: Record<AssetGroup, string> = {
  stocks: "#12322e",
  metals: "#cf8140",
  currency: "#e3d6b4",
  crypto: "#7fa08c",
};

export function AllocationCard() {
  const { summary } = usePortfolio();
  const slices = summary.allocation;
  const allocated = slices.reduce((total, slice) => total + slice.percent, 0);

  return (
    <section className="panel flex min-w-0 flex-col p-7">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <p className="eyebrow mb-2 text-faint">Allocation</p>
          <h3 className="text-[1.3rem] font-semibold">Where your money sits</h3>
        </div>
        <DotsIcon className="size-5 text-faint" />
      </div>

      <div className="flex flex-wrap items-center gap-8">
        <Donut slices={slices} allocated={allocated} />

        <dl className="min-w-[180px] flex-1 space-y-5">
          {slices.map((slice) => (
            <div key={slice.group} className="flex items-baseline justify-between gap-4">
              <dt className="flex items-center gap-2.5 text-[0.92rem]">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: COLORS[slice.group] }}
                  aria-hidden
                />
                {slice.label}
              </dt>
              <dd className="text-right">
                <span className="tabular block text-[0.92rem] font-medium">
                  {Math.round(slice.percent)}%
                </span>
                <span className="tabular block text-[0.75rem] text-faint">
                  {slice.value === 0 ? "$0" : formatCompactCurrency(slice.value)}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <p className="mt-7 flex items-start gap-2.5 border-t border-line pt-5 text-[0.82rem] text-muted">
        <SparkIcon className="mt-0.5 size-4 shrink-0 text-amber" />
        {verdict(slices.find((s) => s.group === "crypto")?.percent ?? 0)}
      </p>
    </section>
  );
}

/** A plain-language read on concentration, shown under the chart. */
function verdict(cryptoPercent: number): string {
  if (cryptoPercent >= 70) return "Heavily weighted to crypto — one asset class carries this book.";
  if (cryptoPercent >= 40) return "A balanced base with a little room for conviction.";
  if (cryptoPercent > 0) return "A steady core, with a small satellite position.";
  return "Entirely in traditional markets.";
}

function Donut({
  slices,
  allocated,
}: {
  slices: { group: AssetGroup; label: string; percent: number }[];
  allocated: number;
}) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;

  const arcs = layOutArcs(slices, circumference);

  return (
    <div className="relative size-[152px] shrink-0">
      <svg viewBox="0 0 140 140" className="size-full -rotate-90" role="img" aria-label="Allocation by asset class">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="#efeadd" strokeWidth="20" />
        {arcs.map((arc) => (
          <circle
            key={arc.group}
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke={COLORS[arc.group]}
            strokeWidth="20"
            strokeDasharray={`${arc.length} ${circumference - arc.length}`}
            strokeDashoffset={-arc.offset}
          >
            <title>{`${arc.label}: ${arc.percent.toFixed(1)}%`}</title>
          </circle>
        ))}
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="eyebrow text-[0.5rem] text-faint">Allocation</span>
        <span className="tabular text-[1.45rem] font-semibold">{Math.round(allocated)}%</span>
      </div>
    </div>
  );
}

type Arc = { group: AssetGroup; label: string; percent: number; length: number; offset: number };

/** Each arc starts where the previous one ended. Pure, so render stays free of mutation. */
function layOutArcs(
  slices: { group: AssetGroup; label: string; percent: number }[],
  circumference: number,
): Arc[] {
  return slices
    .filter((slice) => slice.percent > 0)
    .reduce<Arc[]>((arcs, slice) => {
      const previous = arcs[arcs.length - 1];
      const length = (slice.percent / 100) * circumference;
      return [...arcs, { ...slice, length, offset: previous ? previous.offset + previous.length : 0 }];
    }, []);
}

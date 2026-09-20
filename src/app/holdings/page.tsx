import { HoldingsSummary } from "@/components/HoldingsSummary";
import { HoldingsTable } from "@/components/HoldingsTable";

export default function HoldingsPage() {
  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
      <div className="mb-2">
        <p className="eyebrow mb-3 text-faint">Your positions</p>
        <h1 className="text-[2.6rem] leading-none font-semibold tracking-tight">Holdings</h1>
        <p className="mt-4 text-[0.95rem] text-muted">
          Every position, what it cost, and what it is worth right now.
        </p>
      </div>

      <HoldingsSummary />
      <HoldingsTable />
    </div>
  );
}

import { AllocationCard } from "@/components/AllocationCard";
import { HoldingsTable } from "@/components/HoldingsTable";
import { LiveStatus } from "@/components/LiveStatus";
import { MarketPulse } from "@/components/MarketPulse";
import { PortfolioHero } from "@/components/PortfolioHero";

export default function OverviewPage() {
  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
      <div className="mb-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-3 text-faint">Good morning</p>
          <h1 className="text-[2.6rem] leading-none font-semibold tracking-tight">
            Your northstar.
          </h1>
          <p className="mt-4 text-[0.95rem] text-muted">
            A clear view of what you own, where it is, and how it is moving.
          </p>
        </div>
        <LiveStatus />
      </div>

      <PortfolioHero />

      <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.4fr)]">
        <AllocationCard />
        <MarketPulse />
      </div>

      <HoldingsTable />
    </div>
  );
}

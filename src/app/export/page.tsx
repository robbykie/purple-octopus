import { ExportPanel } from "@/components/ExportPanel";

export default function ExportPage() {
  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
      <div className="mb-2">
        <p className="eyebrow mb-3 text-faint">Take it with you</p>
        <h1 className="text-[2.6rem] leading-none font-semibold tracking-tight">Export report</h1>
        <p className="mt-4 max-w-[46ch] text-[0.95rem] text-muted">
          A snapshot of today&rsquo;s positions, priced at the most recent quote we received.
        </p>
      </div>

      <ExportPanel />

      <section id="how-it-works" className="panel scroll-mt-24 p-7">
        <p className="eyebrow mb-2 text-faint">How Northstar works</p>
        <h2 className="mb-6 text-[1.3rem] font-semibold">Three things worth knowing</h2>

        <dl className="grid grid-cols-1 gap-7 sm:grid-cols-3">
          <div>
            <dt className="mb-2 text-[0.95rem] font-medium">Your positions stay local</dt>
            <dd className="text-[0.85rem] leading-relaxed text-muted">
              Holdings live in this browser&rsquo;s local storage. They are never sent to a server,
              which also means clearing site data clears them — export before you do.
            </dd>
          </div>
          <div>
            <dt className="mb-2 text-[0.95rem] font-medium">Quotes are the one lookup</dt>
            <dd className="text-[0.85rem] leading-relaxed text-muted">
              The app asks its own API route for prices by ticker alone. Quantities and cost basis
              never leave the page, so the quote provider cannot see your position sizes.
            </dd>
          </div>
          <div>
            <dt className="mb-2 text-[0.95rem] font-medium">Prices refresh on a timer</dt>
            <dd className="text-[0.85rem] leading-relaxed text-muted">
              Quotes refresh every minute while a tab is open, and cache for 30 seconds on the
              server. Hit <em>Refresh quotes</em> any time you want them sooner.
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}

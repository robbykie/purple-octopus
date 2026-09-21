# Northstar

A personal live asset tracker. One page that answers what you own, where it
sits, and how it moved today — across stocks, ETFs, crypto, metals and cash.

Your positions stay in your browser's local storage. The only thing the app
looks up is prices, by ticker, through its own API route — so the quote
provider never sees your quantities or cost basis.

## Running it

```bash
npm install
npm run dev          # http://localhost:3000
```

That's it — no API key, no account, no database. On first load the dashboard
seeds a sample portfolio so it isn't an empty shell; edit or delete those
positions and yours take over.

```bash
npm run build && npm start   # production
npm test                     # unit tests
npm run typecheck            # tsc --noEmit
```

## What's in it

| Route | What it does |
| --- | --- |
| `/` | Portfolio value, today's movement, a one-month sparkline, allocation by asset class, and the day's biggest movers |
| `/holdings` | Every position with price, day change, value and unrealised return; add, edit, remove, search |
| `/export` | CSV, a full JSON snapshot, and a holdings-only backup |
| `/api/quotes?symbols=…` | Live prices for the given tickers |
| `/api/history?symbols=…&range=1mo` | Daily closes, used to draw the sparkline |

Quotes refresh every 60 seconds while a tab is open, and cache for 30 seconds
on the server so several tabs cost one upstream request.

## Tickers

Symbols are whatever the quote provider uses:

| Asset | Example |
| --- | --- |
| US stock / ETF | `AAPL`, `VTI` |
| Crypto | `BTC-USD`, `ETH-USD` |
| Metals | `GC=F` (gold), `SI=F` (silver) |
| Currency | `EURUSD=X` |

A ticker the provider can't price still shows up — valued at cost and flagged
`No quote`, rather than silently reading as zero.

## Putting it online

GitHub hosts the source, not a running copy: this app has server routes
(`/api/quotes`, `/api/history`), so GitHub Pages — which only serves static
files — cannot run it. It needs a host that executes Next.js.

**Vercel** (free tier, no configuration needed):

1. Go to [vercel.com/new](https://vercel.com/new) and sign in with GitHub
2. Import `purple-octopus` — Vercel detects Next.js on its own
3. Deploy. No environment variables are required; quotes default to Yahoo

You get a public `https://<project>.vercel.app` URL, and every push to the
deployed branch ships an update. Netlify and Render work the same way.

Two things to know before you share that URL:

- Quotes are fetched by the server on behalf of whoever loads the page, so a
  public deployment sends your host's traffic to Yahoo's undocumented,
  unauthenticated endpoint. It rate-limits. Fine for a personal link, not for
  something you post widely.
- Holdings are stored per browser, so every visitor sees the seeded sample
  portfolio and edits only their own copy. Nobody can see yours.

## Configuration

Copy `.env.example` to `.env.local` if you want to change the defaults:

| Variable | Default | Meaning |
| --- | --- | --- |
| `QUOTES_PROVIDER` | `yahoo` | `demo` serves deterministic offline fixtures — useful with no network |
| `QUOTES_CACHE_TTL` | `30` | Seconds a quote is cached server-side |
| `QUOTES_DEMO_FALLBACK` | on | Set to `off` to fail loudly instead of falling back to demo data |

When the live provider can't be reached, the app falls back to demo prices and
says so — the status pill reads *Demo data* and the table footer reads
*Demo quotes — no live provider reached*. It never passes made-up numbers off
as live ones.

## Adding a quote provider

`src/lib/quotes/` holds one module per provider, each exporting `fetchQuote`
and `fetchHistory`. `index.ts` picks between them and layers on caching and
the fallback. A new vendor is a third module and one line in `provider()`.

## Layout

```
src/
  app/            routes and the two API handlers
  components/     the shell, cards, table and dialog
  hooks/          usePortfolio — holdings, quotes and derived state
  lib/
    portfolio.ts  all the money maths
    quotes/       provider modules
    storage.ts    local storage, with validation on read
    export.ts     CSV and JSON output
tests/            unit tests for the maths, formatting, storage and export
```

## Notes

- Yahoo's endpoint is undocumented and unauthenticated. It's fine for personal
  use and rate-limits if you hammer it; swap in a keyed vendor if you need SLAs.
- Clearing site data clears your holdings. Export a backup from `/export` first.
- Northstar is a personal view, not financial advice.

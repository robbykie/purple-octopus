import { NextResponse } from "next/server";
import { getQuotes } from "@/lib/quotes";

export const dynamic = "force-dynamic";

/**
 * GET /api/quotes?symbols=AAPL,BTC-USD
 *
 * The only outbound call the app makes. Holdings never leave the browser —
 * the client sends bare tickers and gets prices back.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbols = (searchParams.get("symbols") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (symbols.length === 0) {
    return NextResponse.json({ quotes: {}, provider: "none", failed: [], degraded: false });
  }

  if (symbols.length > 100) {
    return NextResponse.json({ error: "Too many symbols (max 100)" }, { status: 400 });
  }

  const result = await getQuotes(symbols);
  return NextResponse.json(
    { ...result, fetchedAt: Date.now() },
    { headers: { "Cache-Control": "no-store" } },
  );
}

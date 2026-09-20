import { NextResponse } from "next/server";
import { getHistory } from "@/lib/quotes";

export const dynamic = "force-dynamic";

const RANGES = new Set(["1mo", "3mo", "6mo", "1y"]);

/**
 * GET /api/history?symbols=AAPL,BTC-USD&range=1mo
 *
 * Daily closes per symbol. The client multiplies these by the quantities it
 * holds locally to draw the portfolio sparkline.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbols = (searchParams.get("symbols") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const range = searchParams.get("range") ?? "1mo";

  if (!RANGES.has(range)) {
    return NextResponse.json({ error: `Unsupported range: ${range}` }, { status: 400 });
  }

  if (symbols.length === 0) {
    return NextResponse.json({ series: {}, degraded: false });
  }

  if (symbols.length > 100) {
    return NextResponse.json({ error: "Too many symbols (max 100)" }, { status: 400 });
  }

  const result = await getHistory(symbols, range);
  return NextResponse.json(
    { ...result, range, fetchedAt: Date.now() },
    { headers: { "Cache-Control": "no-store" } },
  );
}

import { type NextRequest, NextResponse } from "next/server";
import { getPriceSeries } from "@/lib/goldrush";
import { apySeriesByWindow, currentApyByWindow, APY_WINDOWS } from "@/lib/apy-windows";

export const dynamic = "force-dynamic";

// GET /api/vault-series?address=0x..&chain=eth-mainnet&days=90
//
// Returns the vault share token's real daily USD price history (from GoldRush)
// plus the trailing-window APY analytics derived from it. Live-only: when
// GoldRush has no price history for the token we return an empty series and
// hasData:false, never synthetic points.
export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address");
  const chain = req.nextUrl.searchParams.get("chain") ?? "eth-mainnet";
  const daysStr = req.nextUrl.searchParams.get("days") ?? "90";
  const timestamp = new Date().toISOString();

  if (!address || !/^0x[0-9a-fA-F]{40}$/.test(address)) {
    return NextResponse.json(
      { error: "A valid `address` query param is required", errorCode: "INVALID_ADDRESS", timestamp },
      { status: 400 }
    );
  }

  const days = Math.min(Math.max(parseInt(daysStr, 10) || 90, 1), 365);

  try {
    const series = await getPriceSeries(chain, address, days);

    return NextResponse.json(
      {
        address: address.toLowerCase(),
        chain,
        days,
        series,
        count: series.length,
        hasData: series.length >= 2,
        windows: APY_WINDOWS,
        apyByWindow: apySeriesByWindow(series),
        currentByWindow: currentApyByWindow(series),
        timestamp,
      },
      {
        headers: {
          "cache-control": "public, max-age=300",
          "X-Data-Source": "live",
        },
      }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      {
        error: `Failed to fetch vault price series: ${message}`,
        errorCode: "SERIES_FETCH_FAILED",
        address: address.toLowerCase(),
        chain,
        timestamp,
        suggestedAction: "Historical pricing is temporarily unavailable. Please try again in a moment.",
      },
      { status: 503 }
    );
  }
}

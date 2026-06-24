import { getAllOpportunities, filterOpportunities, sortOpportunities } from "@/lib/opportunities-data";
import { recursiveDecompose } from "@/lib/vault";
import { type SupportedChain } from "@/types/vault";
import { type NextRequest, NextResponse } from "next/server";

export const revalidate = 60; // Cache for 60 seconds

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const chain = searchParams.get("chain") || undefined;
  const protocol = searchParams.get("protocol") || undefined;
  const riskLevel = searchParams.get("riskLevel") || undefined;
  const search = searchParams.get("q") || undefined;
  const sortBy = (searchParams.get("sort") as "name" | "apy-desc" | "apy-asc" | "tvl-desc") || "name";

  try {
    let opportunities = getAllOpportunities();

    // Apply filters
    opportunities = filterOpportunities(opportunities, {
      chain,
      protocol,
      riskLevel,
      search,
    });

    // Sort opportunities
    let sorted = opportunities;
    if (sortBy === "apy-desc") {
      sorted = [...opportunities].sort((a, b) => (b.apy || 0) - (a.apy || 0));
    } else if (sortBy === "apy-asc") {
      sorted = [...opportunities].sort((a, b) => (a.apy || 0) - (b.apy || 0));
    } else if (sortBy === "tvl-desc") {
      sorted = [...opportunities].sort((a, b) => (b.tvl || 0) - (a.tvl || 0));
    } else if (sortBy === "name") {
      sorted = [...opportunities].sort((a, b) => a.name.localeCompare(b.name));
    }

    return NextResponse.json({
      opportunities: sorted,
      count: sorted.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

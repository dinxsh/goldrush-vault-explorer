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

    // Fetch live data for each opportunity (parallel)
    const withMetrics = await Promise.all(
      opportunities.map(async (opp) => {
        const vaultData = await recursiveDecompose(opp.vaultAddress, opp.chain as SupportedChain);
        const rootNode = vaultData[0];
        return {
          ...opp,
          apy: rootNode?.apy,
          tvl: rootNode?.balanceUSD,
        };
      })
    );

    // Sort by APY/TVL if requested
    let sorted = withMetrics;
    if (sortBy === "apy-desc") {
      sorted = [...withMetrics].sort((a, b) => (b.apy || 0) - (a.apy || 0));
    } else if (sortBy === "apy-asc") {
      sorted = [...withMetrics].sort((a, b) => (a.apy || 0) - (b.apy || 0));
    } else if (sortBy === "tvl-desc") {
      sorted = [...withMetrics].sort((a, b) => (b.tvl || 0) - (a.tvl || 0));
    } else {
      sorted = sortOpportunities(withMetrics, sortBy);
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

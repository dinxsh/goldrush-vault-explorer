import { getOpportunityBySlug } from "@/lib/opportunities-data";
import { recursiveDecompose } from "@/lib/vault";
import { type OpportunityWithMetrics } from "@/types/opportunity";
import { type SupportedChain } from "@/types/vault";
import { type NextRequest, NextResponse } from "next/server";

export const revalidate = 60; // Cache for 60 seconds

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const opportunity = getOpportunityBySlug(slug);
    if (!opportunity) {
      return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
    }

    // Fetch live vault data with timeout
    let vaultData;
    try {
      vaultData = await Promise.race([
        recursiveDecompose(opportunity.vaultAddress, opportunity.chain as SupportedChain),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 8000))
      ]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch vault data";
      return NextResponse.json({ error: message }, { status: 500 });
    }

    const rootNode = (vaultData as any[])[0];
    if (!rootNode) {
      return NextResponse.json({ error: "Failed to fetch vault data" }, { status: 500 });
    }

    // Calculate 24h change percentage (relative to TVL)
    const apyChange24h = rootNode.balanceUSD > 0 ? rootNode.balance24hChange / rootNode.balanceUSD : 0;

    // Build response with live metrics
    const response: OpportunityWithMetrics = {
      ...opportunity,
      apy: rootNode.apy ?? opportunity.apy ?? null,
      tvl: rootNode.balanceUSD,
      apyChange24h: apyChange24h,
      updatedAt: Date.now(),
    };

    return NextResponse.json(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

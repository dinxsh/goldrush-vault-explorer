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
    let apyChange24h = 0;
    let tvl = opportunity.tvl || 0;

    try {
      vaultData = await Promise.race([
        recursiveDecompose(opportunity.vaultAddress, opportunity.chain as SupportedChain),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 8000))
      ]);

      const rootNode = (vaultData as any[])[0];
      if (rootNode) {
        tvl = rootNode.balanceUSD || tvl;
        apyChange24h = rootNode.balanceUSD > 0 ? rootNode.balance24hChange / rootNode.balanceUSD : 0;
      }
    } catch (err) {
      // Continue with static data if vault fetch fails
    }

    // Build response with live metrics, fallback to static data if unavailable
    const response: OpportunityWithMetrics = {
      ...opportunity,
      apy: opportunity.apy ?? null,
      tvl: tvl,
      apyChange24h: apyChange24h,
      updatedAt: Date.now(),
    };

    return NextResponse.json(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

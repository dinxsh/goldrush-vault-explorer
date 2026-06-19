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

    // Fetch live vault data
    const vaultData = await recursiveDecompose(opportunity.vaultAddress, opportunity.chain as SupportedChain);
    const rootNode = vaultData[0];

    if (!rootNode) {
      return NextResponse.json({ error: "Failed to fetch vault data" }, { status: 500 });
    }

    // Build response with live metrics
    const response: OpportunityWithMetrics = {
      ...opportunity,
      apy: rootNode.apy || null,
      tvl: rootNode.balanceUSD,
      apyChange24h: rootNode.balance24hChange,
      updatedAt: Date.now(),
    };

    return NextResponse.json(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

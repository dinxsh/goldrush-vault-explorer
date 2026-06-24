import { getOpportunityBySlug } from "@/lib/complete-vault-database";
import { recursiveDecompose } from "@/lib/vault";
import { type OpportunityWithMetrics } from "@/types/opportunity";
import { type SupportedChain } from "@/types/vault";
import { type NextRequest, NextResponse } from "next/server";

export const revalidate = 60; // Cache for 60 seconds

const VAULT_FETCH_TIMEOUT = 8000; // 8 seconds

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const timestamp = new Date().toISOString();

  try {
    // Validate slug format
    if (!slug || typeof slug !== "string" || slug.length === 0) {
      return NextResponse.json(
        {
          error: "Invalid slug parameter",
          errorCode: "INVALID_SLUG",
          slug,
          timestamp,
        },
        { status: 400 }
      );
    }

    // Get opportunity from database
    const opportunity = getOpportunityBySlug(slug);
    if (!opportunity) {
      return NextResponse.json(
        {
          error: `Opportunity with slug "${slug}" not found in GoldRush database`,
          errorCode: "VAULT_NOT_FOUND",
          slug,
          timestamp,
          suggestedAction: "Check the slug is correct and try /api/opportunities to list available vaults",
        },
        { status: 404 }
      );
    }

    // Fetch live vault data with timeout (no fallback on error)
    let vaultData: any;
    let vaultDataError: string | null = null;

    try {
      vaultData = await Promise.race([
        recursiveDecompose(opportunity.vaultAddress, opportunity.chain as SupportedChain),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`Vault data fetch timeout after ${VAULT_FETCH_TIMEOUT}ms`)), VAULT_FETCH_TIMEOUT)
        ),
      ]);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error fetching vault data";
      vaultDataError = errorMsg;

      // Return error instead of fallback
      return NextResponse.json(
        {
          error: `Failed to fetch live vault data: ${errorMsg}`,
          errorCode: "VAULT_DATA_FETCH_FAILED",
          slug,
          vault: {
            address: opportunity.vaultAddress,
            chain: opportunity.chain,
            protocol: opportunity.protocol,
          },
          timestamp,
          suggestedAction: "This error indicates the blockchain data source is unreachable or timeout. Try again in a moment.",
        },
        { status: 503 } // Service Unavailable
      );
    }

    // Validate vault data
    if (!vaultData || !Array.isArray(vaultData) || vaultData.length === 0) {
      return NextResponse.json(
        {
          error: "Vault data fetch returned empty or invalid response",
          errorCode: "INVALID_VAULT_DATA",
          slug,
          timestamp,
          suggestedAction: "The blockchain data source returned an invalid response. Try again in a moment.",
        },
        { status: 503 }
      );
    }

    const rootNode = vaultData[0];
    if (!rootNode || !rootNode.balanceUSD) {
      return NextResponse.json(
        {
          error: "Vault data incomplete — missing balanceUSD",
          errorCode: "INCOMPLETE_VAULT_DATA",
          slug,
          timestamp,
          dataReceived: !!rootNode,
          fields: rootNode ? Object.keys(rootNode) : [],
        },
        { status: 503 }
      );
    }

    // Calculate 24h change percentage
    const apyChange24h =
      rootNode.balanceUSD > 0 && rootNode.balance24hChange
        ? rootNode.balance24hChange / rootNode.balanceUSD
        : 0;

    // Build response with live metrics (APY required)
    if (rootNode.apy === undefined && opportunity.apy === undefined) {
      return NextResponse.json(
        {
          error: "APY data unavailable from both live source and static data",
          errorCode: "APY_DATA_MISSING",
          slug,
          timestamp,
          vault: {
            name: opportunity.name,
            protocol: opportunity.protocol,
            chain: opportunity.chain,
          },
        },
        { status: 503 }
      );
    }

    const response: OpportunityWithMetrics = {
      ...opportunity,
      apy: rootNode.apy ?? opportunity.apy ?? null,
      tvl: rootNode.balanceUSD,
      apyChange24h: apyChange24h,
      updatedAt: Date.now(),
    };

    return NextResponse.json(response, {
      headers: { "cache-control": "public, max-age=60" },
    });
  } catch (error) {
    console.error(`[API ERROR] /api/opportunities/${slug}:`, error);

    const message = error instanceof Error ? error.message : "Unknown internal error";
    const stack = error instanceof Error ? error.stack : undefined;

    return NextResponse.json(
      {
        error: `Internal server error: ${message}`,
        errorCode: "INTERNAL_SERVER_ERROR",
        slug,
        timestamp: new Date().toISOString(),
        stack: process.env.NODE_ENV === "development" ? stack : undefined,
        supportEmail: "support@goldrush.dev",
      },
      { status: 500 }
    );
  }
}

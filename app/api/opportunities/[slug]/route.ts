import { getOpportunityBySlug } from "@/lib/complete-vault-database";
import { findAggregatedBySlug } from "@/lib/vault-aggregators";
import { recursiveDecompose } from "@/lib/vault";
import { type OpportunityWithMetrics } from "@/types/opportunity";
import { type SupportedChain } from "@/types/vault";
import { type NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const revalidate = 60; // Cache for 60 seconds

// Live decomposition is 2-4s when healthy; the function's maxDuration is 60s (vercel.json).
// 8s was too tight - a cold start or a single provider failover would trip it and surface a
// hard error page. 15s leaves headroom for cold start + fast RPC failover while still
// bounding the wait. Combined with retryCount:0 transports (lib/rpc.ts), failover happens
// inside this budget instead of after it.
const VAULT_FETCH_TIMEOUT = 15000;

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

    // Resolve from curated DB first; fall back to the live auto-discovered
    // universe (slug self-describes address + chain) so every listed vault has
    // a working detail page.
    const opportunity = getOpportunityBySlug(slug) ?? (await findAggregatedBySlug(slug));
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

    // Fetch LIVE vault data with timeout - NO FALLBACK
    let vaultData: any;

    try {
      vaultData = await Promise.race([
        recursiveDecompose(opportunity.vaultAddress, opportunity.chain as SupportedChain),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`Vault data fetch timeout after ${VAULT_FETCH_TIMEOUT}ms`)), VAULT_FETCH_TIMEOUT)
        ),
      ]);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error fetching vault data";

      // STRICT: No fallback - return error
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
          suggestedAction: "This vault's live blockchain data is currently unavailable. The blockchain data source is unreachable or the contract may not be compatible. Please try again in a moment.",
        },
        { status: 503 }
      );
    }

    // Validate that we have valid live data
    if (!vaultData || !Array.isArray(vaultData) || vaultData.length === 0) {
      return NextResponse.json(
        {
          error: "Vault returned no data from blockchain",
          errorCode: "INVALID_VAULT_DATA",
          slug,
          timestamp,
          vault: {
            address: opportunity.vaultAddress,
            chain: opportunity.chain,
            protocol: opportunity.protocol,
          },
          suggestedAction: "This vault contract did not return expected data. It may not implement the required interface. Contact the protocol team for support.",
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

    // STRICT: Only return live blockchain data, never fallback
    const response: OpportunityWithMetrics = {
      ...opportunity,
      apy: rootNode.apy ?? null, // Only use live APY, never fallback
      tvl: rootNode.balanceUSD,
      apyChange24h: apyChange24h,
      updatedAt: Date.now(),
      dataSource: "live", // Always live - no fallback
    };

    // Verify we have APY data from live source
    if (response.apy === null || response.apy === undefined) {
      return NextResponse.json(
        {
          error: "APY data unavailable from live blockchain source",
          errorCode: "APY_DATA_MISSING",
          slug,
          timestamp,
          vault: {
            name: opportunity.name,
            protocol: opportunity.protocol,
            chain: opportunity.chain,
          },
          suggestedAction: "Live APY data is not available for this vault. The contract may not expose APY information. Contact the protocol team.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(response, {
      headers: {
        "cache-control": "public, max-age=60",
        "X-Data-Source": "live",
        "X-Vault-Data": "blockchain-live",
      },
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

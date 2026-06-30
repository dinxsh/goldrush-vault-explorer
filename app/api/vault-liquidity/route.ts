import { type NextRequest, NextResponse } from "next/server";
import { recursiveDecompose } from "@/lib/vault";
import { type SupportedChain, type VaultNode } from "@/types/vault";

export const dynamic = "force-dynamic";

// GET /api/vault-liquidity?address=0x..&chain=eth-mainnet
//
// Returns the vault's TVL and its instantly-withdrawable liquidity, derived from
// the live on-chain decomposition: the idle/unallocated/available-cash portion
// that a depositor could pull out right now. Live-only — when the decomposition
// is unavailable we return hasData:false rather than a guess.
//
// Liquidity % = liquidity / TVL, the share of the vault not currently lent out
// or deployed into markets.

// A node represents idle/available liquidity if the decomposition labelled it as
// unallocated cash / reserves / available liquidity.
function isLiquidNode(n: VaultNode): boolean {
  const name = (n.name ?? "").toLowerCase();
  const sub = (n.subLabel ?? "").toLowerCase();
  return (
    /^(idle|available)/.test(name) ||
    /unallocated|reserves|idle cash/.test(sub)
  );
}

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address");
  const chain = (req.nextUrl.searchParams.get("chain") ?? "eth-mainnet") as SupportedChain;
  const timestamp = new Date().toISOString();

  if (!address || !/^0x[0-9a-fA-F]{40}$/.test(address)) {
    return NextResponse.json(
      { error: "A valid `address` query param is required", errorCode: "INVALID_ADDRESS", timestamp },
      { status: 400 }
    );
  }

  try {
    const nodes = await Promise.race([
      recursiveDecompose(address, chain),
      new Promise<VaultNode[]>((_, reject) => setTimeout(() => reject(new Error("timeout")), 12000)),
    ]);

    const root = nodes?.[0];
    if (!root || !(root.balanceUSD > 0)) {
      return NextResponse.json(
        { address: address.toLowerCase(), chain, hasData: false, timestamp },
        { headers: { "cache-control": "public, max-age=120" } }
      );
    }

    const tvlUSD = root.balanceUSD;
    const liquidityUSD = root.children.filter(isLiquidNode).reduce((sum, n) => sum + n.balanceUSD, 0);
    const liquidPct = tvlUSD > 0 ? liquidityUSD / tvlUSD : 0;

    return NextResponse.json(
      { address: address.toLowerCase(), chain, hasData: true, tvlUSD, liquidityUSD, liquidPct, timestamp },
      { headers: { "cache-control": "public, max-age=120", "X-Data-Source": "live" } }
    );
  } catch {
    // Honest empty — never fabricate liquidity.
    return NextResponse.json(
      { address: address.toLowerCase(), chain, hasData: false, timestamp },
      { status: 200, headers: { "cache-control": "public, max-age=30" } }
    );
  }
}

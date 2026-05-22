import { getGoldRushClient } from "@/lib/goldrush";
import { type SupportedChain, type VaultStats } from "@/types/vault";
import { type Chain } from "@covalenthq/client-sdk";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const address = req.nextUrl.searchParams.get("address");
    const chain = (req.nextUrl.searchParams.get("chain") ?? "eth-mainnet") as SupportedChain;

    if (!address) {
        return NextResponse.json({ error: "address query param is required" }, { status: 400 });
    }

    try {
        const resp = await getGoldRushClient().TransactionService.getTransactionSummary(chain as Chain, address);

        if (resp.error || !resp.data?.items?.[0]) {
            return NextResponse.json({ stats: null });
        }

        const item = resp.data.items[0];
        const stats: VaultStats = {
            totalCount: item?.total_count ?? 0,
            firstSeenAt:
                item?.earliest_transaction?.block_signed_at instanceof Date
                    ? item.earliest_transaction.block_signed_at.toISOString()
                    : null,
            lastActiveAt:
                item?.latest_transaction?.block_signed_at instanceof Date
                    ? item.latest_transaction.block_signed_at.toISOString()
                    : null,
        };

        return NextResponse.json({ stats });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

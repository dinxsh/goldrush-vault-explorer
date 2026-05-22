import { getGoldRushClient } from "@/lib/goldrush";
import { type SupportedChain } from "@/types/vault";
import { type Chain } from "@covalenthq/client-sdk";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const address = req.nextUrl.searchParams.get("address");
    const chain = (req.nextUrl.searchParams.get("chain") ?? "eth-mainnet") as SupportedChain;

    if (!address) {
        return NextResponse.json({ error: "address query param is required" }, { status: 400 });
    }

    try {
        const resp = await getGoldRushClient().TransactionService.getAllTransactionsForAddressByPage(
            chain as Chain,
            address,
            {
                blockSignedAtAsc: false,
                noLogs: false,
            }
        );

        if (resp.error || !resp.data?.items) {
            return NextResponse.json({ txs: [] });
        }

        const txs = resp.data.items
            .filter((tx): tx is NonNullable<(typeof resp.data.items)[number]> => tx !== null && tx !== undefined)
            .slice(0, 10)
            .map((tx) => ({
                hash: tx.tx_hash ?? "",
                timestamp: tx.block_signed_at instanceof Date ? tx.block_signed_at.toISOString() : "",
                valueUSD: tx.value_quote ?? null,
                successful: tx.successful ?? false,
                logCount: tx.log_events?.filter(Boolean).length ?? 0,
                eventName: tx.log_events?.[0]?.decoded?.name ?? null,
            }));

        return NextResponse.json({ txs });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

import { explorerTxUrl } from "@/lib/explorer";
import { getGoldRushClient } from "@/lib/goldrush";
import { type SupportedChain, type TxSummary } from "@/types/vault";
import { type Chain } from "@covalenthq/client-sdk";
import { type NextRequest, NextResponse } from "next/server";

// Events to skip — internal/system events that don't describe user intent
const SKIP_EVENTS = new Set([
    "BeforeExecution",
    "AfterExecution",
    "ExecutionSuccess",
    "ExecutionFailure",
    "GasPayment",
    "ModuleTransaction",
    "SafeSetup",
    "EnabledModule",
    "ChangedThreshold",
]);

// Priority ranking — higher index = higher priority
const EVENT_PRIORITY: Record<string, number> = {
    Approval: 1,
    ApprovalForAll: 1,
    TransferBatch: 2,
    TransferSingle: 2,
    Transfer: 3,
    Burn: 4,
    Mint: 4,
    Repay: 5,
    Borrow: 5,
    Swap: 6,
    Withdraw: 7,
    Deposit: 7,
};

function pickEventName(logEvents: Array<{ decoded?: { name?: string } | null } | null>): string | null {
    let best: string | null = null;
    let bestPriority = -1;

    for (const log of logEvents) {
        const name = log?.decoded?.name;
        if (!name || SKIP_EVENTS.has(name)) continue;
        const priority = EVENT_PRIORITY[name] ?? 0;
        if (priority > bestPriority) {
            bestPriority = priority;
            best = name;
        }
    }

    return best;
}

function categorize(eventName: string | null): TxSummary["eventCategory"] {
    if (!eventName) return "other";
    const n = eventName.toLowerCase();
    if (n.includes("deposit")) return "deposit";
    if (n.includes("withdraw")) return "withdraw";
    if (n.includes("swap")) return "swap";
    if (n.includes("transfer")) return "transfer";
    if (n.includes("approval")) return "approval";
    return "other";
}

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
            { blockSignedAtAsc: false, noLogs: false }
        );

        if (resp.error || !resp.data?.items) {
            return NextResponse.json({ txs: [] });
        }

        const txs: TxSummary[] = resp.data.items
            .filter((tx): tx is NonNullable<(typeof resp.data.items)[number]> => tx !== null && tx !== undefined)
            .slice(0, 10)
            .map((tx) => {
                const logs = (tx.log_events ?? []).filter(
                    (l): l is NonNullable<typeof l> => l !== null && l !== undefined
                );
                const eventName = pickEventName(logs);
                return {
                    hash: tx.tx_hash ?? "",
                    timestamp: tx.block_signed_at instanceof Date ? tx.block_signed_at.toISOString() : "",
                    successful: tx.successful ?? false,
                    eventName,
                    eventCategory: categorize(eventName),
                    explorerUrl: explorerTxUrl(chain, tx.tx_hash ?? ""),
                    fromAddress: tx.from_address ?? "",
                };
            });

        return NextResponse.json({ txs });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

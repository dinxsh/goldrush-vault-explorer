import { explorerTxUrl } from "@/lib/explorer";
import { getGoldRushClient } from "@/lib/goldrush";
import { type SupportedChain, type TxSummary } from "@/types/vault";
import { type Chain } from "@covalenthq/client-sdk";
import { type NextRequest, NextResponse } from "next/server";

const cache = new Map<string, { txs: TxSummary[]; ts: number }>();
const CACHE_TTL = 5 * 60 * 1000;

// Internal/system events that don't describe user intent
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
    "AddedOwner",
    "RemovedOwner",
]);

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
    Supply: 6,
    Swap: 6,
    Withdraw: 7,
    Deposit: 7,
};

// A decoded log event, loosely typed to the fields we read off it.
interface LogEvent {
    decoded?: { name?: string; params?: Array<{ name?: string; value?: unknown } | null> | null } | null;
    sender_contract_decimals?: number | null;
    sender_contract_ticker_symbol?: string | null;
}

// Pick the log event that best describes user intent (highest-priority name), so
// we can read both its name and its amount off the same event.
function pickEvent(logEvents: LogEvent[]): LogEvent | null {
    let best: LogEvent | null = null;
    let bestPriority = -1;
    for (const log of logEvents) {
        const name = log?.decoded?.name;
        if (!name || SKIP_EVENTS.has(name)) continue;
        const priority = EVENT_PRIORITY[name] ?? 0;
        if (priority > bestPriority) {
            bestPriority = priority;
            best = log;
        }
    }
    return best;
}

// Human-format a raw integer token amount (string) with the token's decimals.
function formatTokenAmount(raw: string, decimals: number): string | null {
    try {
        const bi = BigInt(raw);
        if (bi === 0n) return "0";
        const divisor = 10n ** BigInt(decimals);
        const whole = Number(bi / divisor);
        const frac = Number(bi % divisor) / Number(divisor);
        const val = whole + frac;
        if (val >= 1_000_000) return `${(val / 1_000_000).toLocaleString("en-US", { maximumFractionDigits: 2 })}M`;
        if (val >= 1000) return val.toLocaleString("en-US", { maximumFractionDigits: 0 });
        if (val >= 1) return val.toLocaleString("en-US", { maximumFractionDigits: 2 });
        return val.toLocaleString("en-US", { maximumFractionDigits: 6 });
    } catch {
        return null;
    }
}

// Pull the primary amount + token symbol from the picked event's decoded params.
// Preference covers ERC-4626 (assets/shares), ERC-20 Transfer (value) and common
// lending events (amount/wad).
function extractAmount(log: LogEvent | null): { amount: string | null; tokenSymbol: string | null } {
    if (!log) return { amount: null, tokenSymbol: null };
    const symbol = log.sender_contract_ticker_symbol ?? null;
    const params = log.decoded?.params ?? [];
    const get = (n: string): string | null => {
        const p = params?.find((x) => x?.name === n && x?.value != null);
        return p?.value != null ? String(p.value) : null;
    };
    const raw = get("assets") ?? get("value") ?? get("amount") ?? get("wad") ?? get("_value") ?? get("shares");
    if (raw == null) return { amount: null, tokenSymbol: symbol };
    const decimals = log.sender_contract_decimals ?? 18;
    return { amount: formatTokenAmount(raw, decimals), tokenSymbol: symbol };
}

function categorize(eventName: string | null): TxSummary["eventCategory"] {
    if (!eventName) return "other";
    const n = eventName.toLowerCase();
    if (n.includes("deposit")) return "deposit";
    if (n.includes("withdraw")) return "withdraw";
    if (n.includes("swap") || n.includes("supply")) return "swap";
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

    const cacheKey = `${chain}:${address.toLowerCase()}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
        return NextResponse.json({ txs: cached.txs });
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
            .map((tx) => {
                const logs = (tx.log_events ?? []).filter(
                    (l): l is NonNullable<typeof l> => l !== null && l !== undefined
                );
                const picked = pickEvent(logs as LogEvent[]);
                const eventName = picked?.decoded?.name ?? null;
                const { amount, tokenSymbol } = extractAmount(picked);
                return {
                    hash: tx.tx_hash ?? "",
                    timestamp: tx.block_signed_at instanceof Date ? tx.block_signed_at.toISOString() : "",
                    successful: tx.successful ?? false,
                    eventName,
                    eventCategory: categorize(eventName),
                    explorerUrl: explorerTxUrl(chain, tx.tx_hash ?? ""),
                    fromAddress: tx.from_address ?? "",
                    amount,
                    tokenSymbol,
                };
            });

        cache.set(cacheKey, { txs, ts: Date.now() });
        return NextResponse.json({ txs });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

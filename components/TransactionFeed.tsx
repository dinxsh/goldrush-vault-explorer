"use client";

import { type TxSummary } from "@/types/vault";

interface Props {
    txs: TxSummary[];
}

function relativeTime(timestamp: string): string {
    const now = Date.now();
    const then = new Date(timestamp).getTime();
    if (isNaN(then)) return "unknown";
    const diffMs = now - then;
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 30) return `${diffDay}d ago`;
    const diffMo = Math.floor(diffDay / 30);
    if (diffMo < 12) return `${diffMo}mo ago`;
    return `${Math.floor(diffMo / 12)}y ago`;
}

function truncateHash(hash: string): string {
    if (!hash || hash.length < 14) return hash;
    return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
}

export default function TransactionFeed({ txs }: Props) {
    if (txs.length === 0) {
        return (
            <div
                className="rounded border py-10 text-center text-sm"
                style={{
                    background: "var(--card)",
                    borderColor: "var(--border)",
                    color: "var(--text-secondary)",
                }}
            >
                No recent transactions found.
            </div>
        );
    }

    return (
        <div
            className="rounded border overflow-hidden"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
        >
            {txs.map((tx, i) => (
                <div
                    key={tx.hash}
                    className="flex items-start justify-between gap-4 px-4 py-3"
                    style={{
                        borderBottom: i < txs.length - 1 ? "1px solid var(--border)" : undefined,
                    }}
                >
                    {/* Left side */}
                    <div className="flex items-start gap-3 min-w-0">
                        {/* Status dot */}
                        <span
                            className="mt-1 shrink-0 rounded-full"
                            style={{
                                width: 8,
                                height: 8,
                                background: tx.successful ? "var(--positive)" : "var(--negative)",
                                display: "inline-block",
                            }}
                        />
                        <div className="min-w-0">
                            {/* Event name */}
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                                    {tx.eventName ?? "Transfer"}
                                </span>
                                {tx.logCount > 0 && (
                                    <span
                                        className="rounded px-1.5 py-0.5 text-xs"
                                        style={{ background: "var(--border)", color: "var(--text-secondary)" }}
                                    >
                                        {tx.logCount} {tx.logCount === 1 ? "log" : "logs"}
                                    </span>
                                )}
                            </div>
                            {/* Truncated hash */}
                            <span
                                className="text-xs"
                                style={{
                                    color: "var(--text-secondary)",
                                    fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                                }}
                            >
                                {truncateHash(tx.hash)}
                            </span>
                        </div>
                    </div>

                    {/* Right side */}
                    <div className="flex flex-col items-end shrink-0 gap-0.5">
                        <span className="text-sm tabular-nums" style={{ color: "var(--text-primary)" }}>
                            {tx.valueUSD !== null
                                ? tx.valueUSD.toLocaleString("en-US", { style: "currency", currency: "USD" })
                                : "—"}
                        </span>
                        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                            {tx.timestamp ? relativeTime(tx.timestamp) : "—"}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}

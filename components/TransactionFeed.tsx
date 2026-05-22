"use client";

import { type TxSummary } from "@/types/vault";

interface Props {
    txs: TxSummary[];
}

const CATEGORY_STYLE: Record<TxSummary["eventCategory"], { dot: string; badge: string; label: string }> = {
    deposit: { dot: "#22c55e", badge: "rgba(34,197,94,0.12)", label: "#4ade80" },
    withdraw: { dot: "#f97316", badge: "rgba(249,115,22,0.12)", label: "#fb923c" },
    swap: { dot: "#3b82f6", badge: "rgba(59,130,246,0.12)", label: "#60a5fa" },
    transfer: { dot: "#888", badge: "rgba(136,136,136,0.10)", label: "#aaa" },
    approval: { dot: "#8b5cf6", badge: "rgba(139,92,246,0.10)", label: "#a78bfa" },
    other: { dot: "#888", badge: "rgba(136,136,136,0.10)", label: "#aaa" },
};

function relativeTime(timestamp: string): string {
    const now = Date.now();
    const then = new Date(timestamp).getTime();
    if (isNaN(then)) return "—";
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

function truncateAddr(addr: string): string {
    if (!addr || addr.length < 10) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
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
                style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--text-secondary)" }}
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
            {txs.map((tx, i) => {
                const style = CATEGORY_STYLE[tx.eventCategory];
                return (
                    <div
                        key={tx.hash}
                        className="px-4 py-3"
                        style={{ borderBottom: i < txs.length - 1 ? "1px solid var(--border)" : undefined }}
                    >
                        {/* Row 1: event badge + status + time */}
                        <div className="flex items-center justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2">
                                <span
                                    className="shrink-0 rounded-full"
                                    style={{
                                        width: 7,
                                        height: 7,
                                        display: "inline-block",
                                        background: tx.successful ? style.dot : "var(--negative)",
                                    }}
                                />
                                <span
                                    className="rounded px-1.5 py-0.5 text-xs font-semibold"
                                    style={{ background: style.badge, color: style.label }}
                                >
                                    {tx.eventName ?? "Interaction"}
                                </span>
                            </div>
                            <span className="text-xs shrink-0" style={{ color: "var(--text-secondary)" }}>
                                {tx.timestamp ? relativeTime(tx.timestamp) : "—"}
                            </span>
                        </div>

                        {/* Row 2: hash link + from address */}
                        <div className="flex items-center justify-between gap-2">
                            {tx.explorerUrl ? (
                                <a
                                    href={tx.explorerUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs hover:underline"
                                    style={{
                                        color: "var(--text-secondary)",
                                        fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                                    }}
                                >
                                    {truncateHash(tx.hash)} ↗
                                </a>
                            ) : (
                                <span
                                    className="text-xs"
                                    style={{
                                        color: "var(--text-secondary)",
                                        fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                                    }}
                                >
                                    {truncateHash(tx.hash)}
                                </span>
                            )}
                            {tx.fromAddress && (
                                <span
                                    className="text-xs shrink-0"
                                    style={{
                                        color: "var(--text-secondary)",
                                        fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                                        opacity: 0.7,
                                    }}
                                    title={tx.fromAddress}
                                >
                                    from {truncateAddr(tx.fromAddress)}
                                </span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

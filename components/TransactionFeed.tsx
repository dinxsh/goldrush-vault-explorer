"use client";

import { type TxSummary } from "@/types/vault";

interface Props {
    txs: TxSummary[];
}

type Category = TxSummary["eventCategory"];

// Per-category color + directional glyph so each row is scannable at a glance:
// deposits flow in (down), withdrawals out (up), swaps reverse, transfers move across.
const CATEGORY: Record<Category, { color: string; bg: string; icon: string }> = {
    deposit: { color: "#4ade80", bg: "rgba(34,197,94,0.12)", icon: "M7 2.5V10M4 7l3 3 3-3" },
    withdraw: { color: "#fb923c", bg: "rgba(249,115,22,0.12)", icon: "M7 11.5V4M4 7l3-3 3 3" },
    swap: { color: "#60a5fa", bg: "rgba(59,130,246,0.12)", icon: "M3 5h7L8 3M11 9H4l2 2" },
    transfer: { color: "#9ca3af", bg: "rgba(156,163,175,0.12)", icon: "M2.5 7h9M8.5 4l3 3-3 3" },
    approval: { color: "#a78bfa", bg: "rgba(139,92,246,0.12)", icon: "M3 7l3 3 5-5.5" },
    other: { color: "#9ca3af", bg: "rgba(156,163,175,0.12)", icon: "M3.5 7h7" },
};

function relativeTime(timestamp: string): string {
    const now = Date.now();
    const then = new Date(timestamp).getTime();
    if (isNaN(then)) return "—";
    const diffSec = Math.floor((now - then) / 1000);
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

function absoluteTime(timestamp: string): string {
    const d = new Date(timestamp);
    return isNaN(d.getTime()) ? "" : d.toLocaleString();
}

function truncateAddr(addr: string): string {
    if (!addr || addr.length < 10) return addr;
    return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function truncateHash(hash: string): string {
    if (!hash || hash.length < 14) return hash;
    return `${hash.slice(0, 8)}…${hash.slice(-6)}`;
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
        <div className="rounded border overflow-hidden" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            {txs.map((tx, i) => {
                const cat = CATEGORY[tx.eventCategory];
                const failed = !tx.successful;
                const mono = '"JetBrains Mono", ui-monospace, monospace';
                return (
                    <a
                        key={tx.hash}
                        href={tx.explorerUrl || undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white/[0.035]"
                        style={{ borderBottom: i < txs.length - 1 ? "1px solid var(--border)" : undefined }}
                    >
                        {/* Directional icon */}
                        <span
                            className="shrink-0 flex items-center justify-center rounded-full"
                            style={{
                                width: 30,
                                height: 30,
                                background: failed ? "rgba(239,68,68,0.12)" : cat.bg,
                                boxShadow: failed ? "inset 0 0 0 1px var(--negative)" : undefined,
                            }}
                        >
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <path
                                    d={cat.icon}
                                    stroke={failed ? "var(--negative)" : cat.color}
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </span>

                        {/* Event + hash */}
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-medium leading-tight flex items-center gap-1.5">
                                <span style={{ color: failed ? "var(--negative)" : cat.color }}>
                                    {tx.eventName ?? "Interaction"}
                                </span>
                                {failed && (
                                    <span
                                        className="rounded px-1 text-[10px] font-semibold"
                                        style={{ background: "rgba(239,68,68,0.14)", color: "var(--negative)" }}
                                    >
                                        Failed
                                    </span>
                                )}
                            </span>
                            <span
                                className="text-xs leading-tight truncate"
                                style={{ color: "var(--text-secondary)", fontFamily: mono }}
                            >
                                {truncateHash(tx.hash)}
                            </span>
                        </div>

                        <div className="flex-1" />

                        {/* Amount moved (how much deposited / withdrawn / transferred) */}
                        {tx.amount && (
                            <div className="hidden sm:flex flex-col items-end shrink-0">
                                <span
                                    className="text-sm font-semibold leading-tight tabular-nums"
                                    style={{ color: failed ? "var(--negative)" : cat.color, fontFamily: mono }}
                                >
                                    {tx.amount}
                                </span>
                                {tx.tokenSymbol && (
                                    <span className="text-[11px] leading-tight" style={{ color: "var(--text-secondary)" }}>
                                        {tx.tokenSymbol}
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Time + from */}
                        <div className="flex flex-col items-end shrink-0" style={{ minWidth: 88 }}>
                            <span
                                className="text-xs leading-tight"
                                style={{ color: "var(--text-secondary)" }}
                                title={tx.timestamp ? absoluteTime(tx.timestamp) : undefined}
                            >
                                {tx.timestamp ? relativeTime(tx.timestamp) : "—"}
                            </span>
                            {tx.fromAddress && (
                                <span
                                    className="text-xs leading-tight"
                                    style={{ color: "var(--text-secondary)", fontFamily: mono, opacity: 0.65 }}
                                    title={tx.fromAddress}
                                >
                                    from {truncateAddr(tx.fromAddress)}
                                </span>
                            )}
                        </div>

                        {/* External-link affordance */}
                        <span
                            className="shrink-0 transition-opacity opacity-0 group-hover:opacity-100"
                            style={{ color: "var(--text-secondary)" }}
                        >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M7 17L17 7M17 7H8M17 7v9" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </span>
                    </a>
                );
            })}
        </div>
    );
}

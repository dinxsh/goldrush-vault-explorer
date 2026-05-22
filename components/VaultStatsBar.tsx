"use client";

import { type VaultStats, type SupportedChain } from "@/types/vault";

interface Props {
    stats: VaultStats | null;
    chain: SupportedChain;
    totalUSD: number;
    holdingCount: number;
}

const CHAIN_LABELS: Record<SupportedChain, string> = {
    "eth-mainnet": "Ethereum",
    "base-mainnet": "Base",
    "matic-mainnet": "Polygon",
    "arbitrum-mainnet": "Arbitrum",
    "optimism-mainnet": "Optimism",
    "bsc-mainnet": "BNB Chain",
};

function shortDate(iso: string | null): string {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

interface StatProps {
    label: string;
    value: string;
    accent?: boolean;
}

function Stat({ label, value, accent }: StatProps) {
    return (
        <div className="flex flex-col gap-0.5">
            <span className="text-xs uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
                {label}
            </span>
            <span
                className="text-sm font-semibold tabular-nums"
                style={{
                    color: accent ? "var(--accent)" : "var(--text-primary)",
                    fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                }}
            >
                {value}
            </span>
        </div>
    );
}

export default function VaultStatsBar({ stats, chain, totalUSD, holdingCount }: Props) {
    const totalFormatted = totalUSD.toLocaleString("en-US", { style: "currency", currency: "USD" });

    return (
        <div
            className="rounded border px-5 py-4 grid gap-x-8 gap-y-4"
            style={{
                background: "var(--card)",
                borderColor: "var(--border)",
                gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
            }}
        >
            <Stat label="Total Value" value={totalFormatted} accent />
            <Stat label="Holdings" value={holdingCount.toString()} />
            <Stat label="Network" value={CHAIN_LABELS[chain]} />
            {stats && <Stat label="Lifetime Txs" value={stats.totalCount.toLocaleString()} />}
            {stats?.firstSeenAt && <Stat label="First Active" value={shortDate(stats.firstSeenAt)} />}
            {stats?.lastActiveAt && <Stat label="Last Active" value={shortDate(stats.lastActiveAt)} />}
        </div>
    );
}

"use client";

import HoldingsTable from "@/components/HoldingsTable";
import TransactionFeed from "@/components/TransactionFeed";
import VaultStatsBar from "@/components/VaultStatsBar";
import { explorerAddressUrl, explorerName } from "@/lib/explorer";
import { type VaultNode, type TxSummary, type VaultStats, type SupportedChain } from "@/types/vault";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

function SkeletonLoader({ rows = 4 }: { rows?: number }) {
    return (
        <div className="flex flex-col gap-2.5 animate-pulse">
            {Array.from({ length: rows }, (_, i) => i).map((i) => (
                <div key={i} className="h-9 rounded" style={{ background: "var(--border)", opacity: 1 - i * 0.15 }} />
            ))}
        </div>
    );
}

function ErrorBox({ message }: { message: string }) {
    return (
        <div
            className="rounded border px-4 py-3 text-sm"
            style={{ background: "rgba(239,68,68,0.08)", borderColor: "var(--negative)", color: "var(--negative)" }}
        >
            {message}
        </div>
    );
}

function CopyIcon({ done }: { done: boolean }) {
    if (done) {
        return (
            <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <polyline points="20 6 9 17 4 12" />
            </svg>
        );
    }
    return (
        <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
    );
}

export default function VaultPage() {
    const params = useParams();
    const searchParams = useSearchParams();

    const address = typeof params.address === "string" ? params.address : (params.address?.[0] ?? "");
    const chain = (searchParams.get("chain") ?? "eth-mainnet") as SupportedChain;

    const [holdings, setHoldings] = useState<VaultNode[] | null>(null);
    const [txs, setTxs] = useState<TxSummary[] | null>(null);
    const [stats, setStats] = useState<VaultStats | null | undefined>(undefined);
    const [holdingsError, setHoldingsError] = useState<string | null>(null);
    const [txsError, setTxsError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!address) return;

        const enc = encodeURIComponent;

        const fetchHoldings = fetch(`/api/vault?address=${enc(address)}&chain=${enc(chain)}`)
            .then((r) => r.json())
            .then((data: { holdings?: VaultNode[]; error?: string }) => {
                if (data.error) setHoldingsError(data.error);
                else setHoldings(data.holdings ?? []);
            })
            .catch((err: unknown) => setHoldingsError(err instanceof Error ? err.message : "Failed to load holdings"));

        const fetchTxs = fetch(`/api/transactions?address=${enc(address)}&chain=${enc(chain)}`)
            .then((r) => r.json())
            .then((data: { txs?: TxSummary[]; error?: string }) => {
                if (data.error) setTxsError(data.error);
                else setTxs(data.txs ?? []);
            })
            .catch((err: unknown) => setTxsError(err instanceof Error ? err.message : "Failed to load transactions"));

        const fetchStats = fetch(`/api/vault-stats?address=${enc(address)}&chain=${enc(chain)}`)
            .then((r) => r.json())
            .then((data: { stats?: VaultStats | null }) => setStats(data.stats ?? null))
            .catch(() => setStats(null));

        void Promise.all([fetchHoldings, fetchTxs, fetchStats]);
    }, [address, chain]);

    function handleCopy() {
        void navigator.clipboard.writeText(address).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        });
    }

    const totalUSD = holdings?.reduce((s, n) => s + n.balanceUSD, 0) ?? 0;
    const holdingCount = holdings?.length ?? 0;
    const explorerUrl = explorerAddressUrl(chain, address);
    const explorerLabel = explorerName(chain);

    return (
        <main
            className="min-h-screen px-4 py-8 md:px-8"
            style={{ background: "var(--bg)", color: "var(--text-primary)" }}
        >
            <div className="mx-auto max-w-6xl flex flex-col gap-5">
                {/* Back */}
                <div>
                    <Link
                        href="/"
                        className="text-sm transition-colors hover:text-[var(--accent)]"
                        style={{ color: "var(--text-secondary)" }}
                    >
                        ← Back
                    </Link>
                </div>

                {/* Address header */}
                <div
                    className="flex flex-wrap items-center gap-3 rounded border px-4 py-3"
                    style={{ background: "var(--card)", borderColor: "var(--border)" }}
                >
                    <span
                        className="text-sm break-all flex-1"
                        style={{
                            color: "var(--text-secondary)",
                            fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                        }}
                    >
                        {address}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={handleCopy}
                            title={copied ? "Copied!" : "Copy address"}
                            className="flex items-center gap-1.5 rounded border px-2.5 py-1.5 text-xs transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
                            style={{
                                borderColor: "var(--border)",
                                color: copied ? "var(--positive)" : "var(--text-secondary)",
                            }}
                        >
                            <CopyIcon done={copied} />
                            {copied ? "Copied!" : "Copy"}
                        </button>
                        <a
                            href={explorerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 rounded border px-2.5 py-1.5 text-xs transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
                            style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
                        >
                            {explorerLabel} ↗
                        </a>
                    </div>
                </div>

                {/* Stats bar */}
                {stats !== undefined && (
                    <VaultStatsBar stats={stats} chain={chain} totalUSD={totalUSD} holdingCount={holdingCount} />
                )}
                {stats === undefined && (
                    <div
                        className="h-20 rounded border animate-pulse"
                        style={{ background: "var(--card)", borderColor: "var(--border)" }}
                    />
                )}

                {/* Holdings — full width */}
                <div className="flex flex-col gap-3">
                    <h2
                        className="text-xs font-semibold uppercase tracking-widest"
                        style={{ color: "var(--text-secondary)" }}
                    >
                        Holdings
                    </h2>
                    {holdings === null && holdingsError === null ? (
                        <SkeletonLoader rows={5} />
                    ) : holdingsError ? (
                        <ErrorBox message={holdingsError} />
                    ) : (
                        <HoldingsTable nodes={holdings!} />
                    )}
                </div>

                {/* Transactions — full width below */}
                <div className="flex flex-col gap-3">
                    <h2
                        className="text-xs font-semibold uppercase tracking-widest"
                        style={{ color: "var(--text-secondary)" }}
                    >
                        Recent Transactions
                    </h2>
                    {txs === null && txsError === null ? (
                        <SkeletonLoader rows={6} />
                    ) : txsError ? (
                        <ErrorBox message={txsError} />
                    ) : (
                        <TransactionFeed txs={txs!} />
                    )}
                </div>
            </div>
        </main>
    );
}

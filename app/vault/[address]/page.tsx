"use client";

import HoldingsTable from "@/components/HoldingsTable";
import TransactionFeed from "@/components/TransactionFeed";
import { type VaultNode, type TxSummary, type SupportedChain } from "@/types/vault";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

function SkeletonLoader() {
    return (
        <div className="flex flex-col gap-3 animate-pulse">
            {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-8 rounded" style={{ background: "var(--border)" }} />
            ))}
        </div>
    );
}

function ErrorBox({ message }: { message: string }) {
    return (
        <div
            className="rounded border px-4 py-3 text-sm"
            style={{
                background: "rgba(239,68,68,0.08)",
                borderColor: "var(--negative)",
                color: "var(--negative)",
            }}
        >
            {message}
        </div>
    );
}

export default function VaultPage() {
    const params = useParams();
    const searchParams = useSearchParams();

    const address = typeof params.address === "string" ? params.address : (params.address?.[0] ?? "");
    const chain = (searchParams.get("chain") ?? "eth-mainnet") as SupportedChain;

    const [holdings, setHoldings] = useState<VaultNode[] | null>(null);
    const [txs, setTxs] = useState<TxSummary[] | null>(null);
    const [holdingsError, setHoldingsError] = useState<string | null>(null);
    const [txsError, setTxsError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!address) return;

        const fetchHoldings = fetch(
            `/api/vault?address=${encodeURIComponent(address)}&chain=${encodeURIComponent(chain)}`
        )
            .then((res) => res.json())
            .then((data: { holdings?: VaultNode[]; error?: string }) => {
                if (data.error) {
                    setHoldingsError(data.error);
                } else {
                    setHoldings(data.holdings ?? []);
                }
            })
            .catch((err: unknown) => {
                setHoldingsError(err instanceof Error ? err.message : "Failed to load holdings");
            });

        const fetchTxs = fetch(
            `/api/transactions?address=${encodeURIComponent(address)}&chain=${encodeURIComponent(chain)}`
        )
            .then((res) => res.json())
            .then((data: { txs?: TxSummary[]; error?: string }) => {
                if (data.error) {
                    setTxsError(data.error);
                } else {
                    setTxs(data.txs ?? []);
                }
            })
            .catch((err: unknown) => {
                setTxsError(err instanceof Error ? err.message : "Failed to load transactions");
            });

        void Promise.all([fetchHoldings, fetchTxs]);
    }, [address, chain]);

    function handleCopy() {
        void navigator.clipboard.writeText(address).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        });
    }

    return (
        <main
            className="min-h-screen px-4 py-8 md:px-8"
            style={{ background: "var(--bg)", color: "var(--text-primary)" }}
        >
            <div className="mx-auto max-w-6xl flex flex-col gap-6">
                {/* Back button */}
                <div>
                    <Link
                        href="/"
                        className="text-sm transition-colors hover:text-[var(--accent)]"
                        style={{ color: "var(--text-secondary)" }}
                    >
                        ← Back
                    </Link>
                </div>

                {/* Vault address header */}
                <div
                    className="flex flex-wrap items-center gap-3 rounded border px-4 py-3"
                    style={{ background: "var(--card)", borderColor: "var(--border)" }}
                >
                    <span
                        className="text-sm break-all"
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
                            className="rounded border px-2.5 py-1 text-xs transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
                            style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
                            title="Copy address"
                        >
                            {copied ? "Copied!" : "Copy"}
                        </button>
                        <a
                            href={`https://etherscan.io/address/${address}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded border px-2.5 py-1 text-xs transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
                            style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
                            title="View on Etherscan"
                        >
                            Etherscan ↗
                        </a>
                    </div>
                </div>

                {/* Two-panel layout */}
                <div className="flex flex-col gap-6 lg:flex-row">
                    {/* Left panel — Holdings (60%) */}
                    <div className="flex flex-col gap-3 lg:w-3/5">
                        <h2
                            className="text-sm font-semibold uppercase tracking-wider"
                            style={{ color: "var(--text-secondary)" }}
                        >
                            Holdings
                        </h2>
                        {holdings === null && holdingsError === null ? (
                            <SkeletonLoader />
                        ) : holdingsError ? (
                            <ErrorBox message={holdingsError} />
                        ) : (
                            <HoldingsTable nodes={holdings!} />
                        )}
                    </div>

                    {/* Right panel — Transactions (40%) */}
                    <div className="flex flex-col gap-3 lg:w-2/5">
                        <h2
                            className="text-sm font-semibold uppercase tracking-wider"
                            style={{ color: "var(--text-secondary)" }}
                        >
                            Recent Transactions
                        </h2>
                        {txs === null && txsError === null ? (
                            <SkeletonLoader />
                        ) : txsError ? (
                            <ErrorBox message={txsError} />
                        ) : (
                            <TransactionFeed txs={txs!} />
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}

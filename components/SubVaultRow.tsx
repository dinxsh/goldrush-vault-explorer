"use client";

import { type VaultNode } from "@/types/vault";
import { useState } from "react";

interface Props {
    node: VaultNode;
}

const LOGO_PLACEHOLDER_COLORS = ["#f97316", "#3b82f6", "#8b5cf6", "#10b981", "#ec4899", "#f59e0b"];

function placeholderColor(address: string): string {
    let hash = 0;
    for (let i = 0; i < address.length; i++) {
        hash = address.charCodeAt(i) + ((hash << 5) - hash);
    }
    return LOGO_PLACEHOLDER_COLORS[Math.abs(hash) % LOGO_PLACEHOLDER_COLORS.length];
}

function chainLabel(chain: string): string {
    const map: Record<string, string> = {
        "eth-mainnet": "ETH",
        "base-mainnet": "BASE",
        "matic-mainnet": "MATIC",
        "arbitrum-mainnet": "ARB",
        "optimism-mainnet": "OP",
        "bsc-mainnet": "BSC",
    };
    return map[chain] ?? chain.toUpperCase().slice(0, 6);
}

function formatPrice(price: number | null): string {
    if (price === null) return "—";
    if (price < 0.01) return `$${price.toFixed(6)}`;
    if (price < 1) return `$${price.toFixed(4)}`;
    return price.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export default function SubVaultRow({ node }: Props) {
    const [expanded, setExpanded] = useState(false);
    const [logoFailed, setLogoFailed] = useState(false);
    const hasChildren = node.children.length > 0;

    const formattedValue = node.balanceUSD.toLocaleString("en-US", { style: "currency", currency: "USD" });

    const change = node.balance24hChange;
    const formattedChange =
        change === 0
            ? "—"
            : change > 0
              ? `+${change.toLocaleString("en-US", { style: "currency", currency: "USD" })}`
              : change.toLocaleString("en-US", { style: "currency", currency: "USD" });
    const changeColor = change > 0 ? "var(--positive)" : change < 0 ? "var(--negative)" : "var(--text-secondary)";

    const indentLeft = 12 + node.depth * 16;

    return (
        <>
            <tr
                style={{ borderBottom: "1px solid var(--border)" }}
                className={hasChildren ? "cursor-pointer hover:bg-white/[0.04]" : "hover:bg-white/[0.02]"}
                onClick={hasChildren ? () => setExpanded((v) => !v) : undefined}
            >
                {/* Token */}
                <td className="py-2.5 pr-3" style={{ paddingLeft: indentLeft }}>
                    <div className="flex items-center gap-2">
                        <span
                            className="shrink-0 select-none"
                            style={{ width: 14, opacity: hasChildren ? 1 : 0, color: "var(--accent)" }}
                        >
                            <svg
                                width="12"
                                height="12"
                                viewBox="0 0 12 12"
                                fill="none"
                                style={{
                                    display: "block",
                                    transition: "transform 0.15s",
                                    transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
                                }}
                            >
                                <path
                                    d="M4 2.5L8 6L4 9.5"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </span>
                        {node.logoUrl && !logoFailed ? (
                            <img
                                src={node.logoUrl}
                                alt=""
                                width={18}
                                height={18}
                                className="rounded-full shrink-0 object-cover"
                                onError={() => setLogoFailed(true)}
                            />
                        ) : (
                            <span
                                className="rounded-full shrink-0 flex items-center justify-center text-[9px] font-bold text-white"
                                style={{ width: 18, height: 18, background: placeholderColor(node.address) }}
                            >
                                {node.ticker.slice(0, 1)}
                            </span>
                        )}
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm leading-tight" style={{ color: "var(--text-primary)" }}>
                                {node.name}
                            </span>
                            <span className="text-xs leading-tight" style={{ color: "var(--text-secondary)" }}>
                                {node.ticker || chainLabel(node.chain)}
                            </span>
                        </div>
                    </div>
                </td>

                {/* Balance */}
                <td className="py-2.5 px-3 text-sm tabular-nums" style={{ color: "var(--text-secondary)" }}>
                    {node.rawBalance ?? "—"}
                </td>

                {/* Price */}
                <td className="py-2.5 px-3 text-right text-sm tabular-nums" style={{ color: "var(--text-secondary)" }}>
                    {formatPrice(node.priceUSD)}
                </td>

                {/* USD Value */}
                <td
                    className="py-2.5 px-3 text-right text-sm tabular-nums font-medium"
                    style={{ color: "var(--text-primary)" }}
                >
                    {formattedValue}
                </td>

                {/* 24h Change */}
                <td className="py-2.5 px-3 text-right text-sm tabular-nums" style={{ color: changeColor }}>
                    {formattedChange}
                </td>

                {/* Protocol */}
                <td className="py-2.5 px-3">
                    {node.protocolName ? (
                        <span
                            className="rounded px-1.5 py-0.5 text-xs"
                            style={{ background: "rgba(249,115,22,0.12)", color: "var(--accent)" }}
                        >
                            {node.protocolName}
                        </span>
                    ) : (
                        <span style={{ color: "var(--text-secondary)", fontSize: 12 }}>—</span>
                    )}
                </td>

                {/* Type */}
                <td className="py-2.5 pl-3 pr-3">
                    {hasChildren ? (
                        <span
                            className="rounded px-1.5 py-0.5 text-xs font-medium whitespace-nowrap"
                            style={{ background: "rgba(59,130,246,0.12)", color: "#60a5fa" }}
                        >
                            ERC-4626
                        </span>
                    ) : (
                        <span
                            className="rounded px-1.5 py-0.5 text-xs"
                            style={{ background: "var(--border)", color: "var(--text-secondary)" }}
                        >
                            Token
                        </span>
                    )}
                </td>
            </tr>

            {expanded &&
                node.children.map((child) => <SubVaultRow key={`${child.address}-${child.depth}`} node={child} />)}
        </>
    );
}

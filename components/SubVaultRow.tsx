"use client";

import { type VaultNode } from "@/types/vault";
import { useState } from "react";

interface Props {
    node: VaultNode;
    vaultTotal: number; // top-level total, for the allocation bar
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

export default function SubVaultRow({ node, vaultTotal }: Props) {
    // Expand the top-level vault by default so its positions are visible immediately;
    // deeper market drill-downs stay collapsed until clicked.
    const [expanded, setExpanded] = useState(node.depth === 0);
    const [logoFailed, setLogoFailed] = useState(false);
    const hasChildren = node.children.length > 0;

    const formattedValue =
        node.balanceUSD > 0 ? node.balanceUSD.toLocaleString("en-US", { style: "currency", currency: "USD" }) : "—";

    // Daily yield: what this position earns per day at its current APY. Meaningful for
    // every yield-bearing vault (Morpho), regardless of whether the underlying is a
    // stablecoin or a volatile asset. Positions with no APY (Compound collateral, idle)
    // show "—".
    const dailyYield = node.apy != null && node.balanceUSD > 0 ? (node.apy * node.balanceUSD) / 365 : null;
    const formattedYield =
        dailyYield != null && dailyYield > 0
            ? `+${dailyYield.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                  maximumFractionDigits: dailyYield >= 100 ? 0 : 2,
              })}`
            : "—";

    // Type badge, protocol-accurate.
    const nodeType = node.nodeType ?? (hasChildren ? "vault" : "token");
    const proto = node.protocolName;
    const blue = { bg: "rgba(59,130,246,0.12)", fg: "#60a5fa" };
    const purple = { bg: "rgba(168,85,247,0.14)", fg: "#c084fc" };
    const gray = { bg: "var(--border)", fg: "var(--text-secondary)" };
    const typeBadge =
        nodeType === "vault"
            ? { label: proto === "Compound" ? "Comet Market" : "ERC-4626 Vault", ...blue }
            : nodeType === "market"
              ? {
                    label:
                        proto === "Morpho"
                            ? "Blue Market"
                            : proto === "Euler"
                              ? "eVault"
                              : proto === "Compound"
                                ? "Comet Asset"
                                : "Position",
                    ...purple,
                }
              : { label: "Token", ...gray };

    // Allocation share of the vault's total (hidden for the vault root, which is 100%).
    const allocation = vaultTotal > 0 ? (node.balanceUSD / vaultTotal) * 100 : 0;
    const showAlloc = nodeType !== "vault" && node.balanceUSD > 0;

    const indentLeft = 12 + node.depth * 18;
    const depthBg = node.depth === 0 ? "" : node.depth === 1 ? "bg-white/[0.02]" : "bg-white/[0.035]";
    const hoverBg = hasChildren ? "cursor-pointer hover:bg-white/[0.06]" : "hover:bg-white/[0.04]";

    return (
        <>
            <tr
                style={{ borderBottom: "1px solid var(--border)" }}
                className={`${depthBg} ${hoverBg}`}
                onClick={hasChildren ? () => setExpanded((v) => !v) : undefined}
            >
                {/* Token */}
                <td
                    className="py-2.5 pr-3"
                    style={{
                        paddingLeft: indentLeft,
                        boxShadow: node.depth > 0 ? "inset 3px 0 0 rgba(249,115,22,0.25)" : undefined,
                    }}
                >
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
                        <div className="flex flex-col min-w-0 max-w-[120px] sm:max-w-[240px] lg:max-w-none">
                            <span
                                className="text-sm leading-tight truncate"
                                style={{ color: "var(--text-primary)" }}
                            >
                                {node.name}
                            </span>
                            <span
                                className="text-xs leading-tight truncate"
                                style={{ color: "var(--text-secondary)" }}
                            >
                                {node.subLabel || node.ticker || chainLabel(node.chain)}
                            </span>
                        </div>
                    </div>
                </td>

                {/* Allocation */}
                <td className="py-2.5 px-3 hidden lg:table-cell">
                    {showAlloc ? (
                        <div className="flex items-center gap-2">
                            <div
                                className="shrink-0"
                                style={{ width: 56, height: 5, borderRadius: 3, background: "var(--border)", overflow: "hidden" }}
                            >
                                <div
                                    style={{
                                        width: `${Math.min(100, allocation)}%`,
                                        height: "100%",
                                        background: "var(--accent)",
                                    }}
                                />
                            </div>
                            <span className="text-xs tabular-nums" style={{ color: "var(--text-secondary)" }}>
                                {allocation < 0.1 ? "<0.1" : allocation.toFixed(1)}%
                            </span>
                        </div>
                    ) : null}
                </td>

                {/* Balance */}
                <td
                    className="py-2.5 px-3 text-right text-sm tabular-nums hidden md:table-cell"
                    style={{ color: "var(--text-secondary)" }}
                >
                    {node.rawBalance ?? "—"}
                </td>

                {/* USD Value */}
                <td
                    className="py-2.5 px-3 text-right text-sm tabular-nums font-medium"
                    style={{ color: "var(--text-primary)" }}
                >
                    {formattedValue}
                </td>

                {/* APY */}
                <td className="py-2.5 px-3 text-right text-sm tabular-nums hidden sm:table-cell">
                    {node.apy != null ? (
                        <span style={{ color: "var(--positive)" }}>{(node.apy * 100).toFixed(2)}%</span>
                    ) : (
                        <span style={{ color: "var(--text-secondary)" }}>—</span>
                    )}
                </td>

                {/* Daily yield */}
                <td
                    className="py-2.5 px-3 text-right text-sm tabular-nums hidden lg:table-cell"
                    style={{ color: dailyYield != null && dailyYield > 0 ? "var(--positive)" : "var(--text-secondary)" }}
                >
                    {formattedYield}
                </td>

                {/* Type */}
                <td className="py-2.5 px-3 hidden sm:table-cell">
                    <span
                        className="rounded px-1.5 py-0.5 text-xs font-medium whitespace-nowrap"
                        style={{ background: typeBadge.bg, color: typeBadge.fg }}
                    >
                        {typeBadge.label}
                    </span>
                </td>
            </tr>

            {expanded &&
                node.children.map((child) => (
                    <SubVaultRow key={`${child.address}-${child.depth}`} node={child} vaultTotal={vaultTotal} />
                ))}
        </>
    );
}

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

export default function SubVaultRow({ node }: Props) {
    const [expanded, setExpanded] = useState(false);
    const hasChildren = node.children.length > 0;

    const formattedValue = node.balanceUSD.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
    });

    const change = node.balance24hChange;
    const formattedChange =
        change === 0
            ? "—"
            : change > 0
              ? `+${change.toLocaleString("en-US", { style: "currency", currency: "USD" })}`
              : change.toLocaleString("en-US", { style: "currency", currency: "USD" });

    const changeColor = change > 0 ? "var(--positive)" : change < 0 ? "var(--negative)" : "var(--text-secondary)";

    return (
        <>
            <tr
                style={{ borderBottom: "1px solid var(--border)" }}
                className={hasChildren ? "cursor-pointer hover:bg-white/5" : "hover:bg-white/[0.02]"}
                onClick={hasChildren ? () => setExpanded((v) => !v) : undefined}
            >
                {/* Token */}
                <td className="py-3 pr-4" style={{ paddingLeft: `${8 + node.depth * 16}px` }}>
                    <div className="flex items-center gap-2">
                        {/* Chevron toggle */}
                        <span
                            className="w-4 shrink-0 text-xs select-none"
                            style={{ color: "var(--text-secondary)", opacity: hasChildren ? 1 : 0 }}
                        >
                            {expanded ? "▼" : "▶"}
                        </span>

                        {/* Logo */}
                        {node.logoUrl ? (
                            <img
                                src={node.logoUrl}
                                alt=""
                                width={16}
                                height={16}
                                className="rounded-full shrink-0 object-cover"
                                onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).style.display = "none";
                                    const sibling = e.currentTarget.nextElementSibling as HTMLElement | null;
                                    if (sibling) sibling.style.display = "flex";
                                }}
                            />
                        ) : null}
                        <span
                            className="rounded-full shrink-0 items-center justify-center text-[9px] font-bold text-white"
                            style={{
                                width: 16,
                                height: 16,
                                background: placeholderColor(node.address),
                                display: node.logoUrl ? "none" : "flex",
                            }}
                        >
                            {node.ticker.slice(0, 1)}
                        </span>

                        {/* Name + ticker */}
                        <span className="text-sm" style={{ color: "var(--text-primary)" }}>
                            {node.name}
                        </span>
                        <span
                            className="rounded px-1 py-0.5 text-xs"
                            style={{ background: "var(--border)", color: "var(--text-secondary)" }}
                        >
                            {node.ticker}
                        </span>
                    </div>
                </td>

                {/* Chain */}
                <td className="py-3 px-4">
                    <span
                        className="rounded px-2 py-0.5 text-xs font-medium"
                        style={{ background: "var(--border)", color: "var(--text-secondary)" }}
                    >
                        {chainLabel(node.chain)}
                    </span>
                </td>

                {/* USD Value */}
                <td className="py-3 px-4 text-right text-sm tabular-nums" style={{ color: "var(--text-primary)" }}>
                    {formattedValue}
                </td>

                {/* 24h Change */}
                <td className="py-3 px-4 text-right text-sm tabular-nums" style={{ color: changeColor }}>
                    {formattedChange}
                </td>

                {/* Type */}
                <td className="py-3 pl-4 pr-2">
                    {hasChildren ? (
                        <span
                            className="rounded px-2 py-0.5 text-xs font-medium"
                            style={{ background: "rgba(59,130,246,0.15)", color: "#60a5fa" }}
                        >
                            ERC-4626 Vault
                        </span>
                    ) : (
                        <span
                            className="rounded px-2 py-0.5 text-xs font-medium"
                            style={{ background: "var(--border)", color: "var(--text-secondary)" }}
                        >
                            Token
                        </span>
                    )}
                </td>
            </tr>

            {expanded && node.children.map((child) => <SubVaultRow key={child.address} node={child} />)}
        </>
    );
}

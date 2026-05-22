"use client";

import SubVaultRow from "./SubVaultRow";
import { type VaultNode } from "@/types/vault";

interface Props {
    nodes: VaultNode[];
}

export default function HoldingsTable({ nodes }: Props) {
    const total = nodes.reduce((sum, n) => sum + n.balanceUSD, 0);
    const formattedTotal = total.toLocaleString("en-US", { style: "currency", currency: "USD" });

    return (
        <table
            className="w-full text-left"
            style={{
                borderCollapse: "collapse",
                background: "var(--card)",
            }}
        >
            <thead>
                <tr style={{ borderBottom: "2px solid var(--border)" }}>
                    {["Token", "Chain", "USD Value", "24h Change", "Type"].map((col, i) => (
                        <th
                            key={col}
                            className="py-3 text-xs font-semibold uppercase tracking-wider"
                            style={{
                                color: "var(--text-secondary)",
                                paddingLeft: i === 0 ? 8 : 16,
                                paddingRight: i === 4 ? 8 : 16,
                                textAlign: i >= 2 && i <= 3 ? "right" : "left",
                            }}
                        >
                            {col}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {nodes.length === 0 ? (
                    <tr>
                        <td
                            colSpan={5}
                            className="py-10 text-center text-sm"
                            style={{ color: "var(--text-secondary)" }}
                        >
                            No holdings found for this address.
                        </td>
                    </tr>
                ) : (
                    nodes.map((node) => <SubVaultRow key={node.address} node={node} />)
                )}
            </tbody>
            {nodes.length > 0 && (
                <tfoot>
                    <tr style={{ borderTop: "2px solid var(--border)" }}>
                        <td
                            colSpan={5}
                            className="py-3 px-2 text-right text-sm font-semibold"
                            style={{ color: "var(--text-primary)" }}
                        >
                            Total:{" "}
                            <span
                                style={{
                                    color: "var(--accent)",
                                    fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                                }}
                            >
                                {formattedTotal}
                            </span>
                        </td>
                    </tr>
                </tfoot>
            )}
        </table>
    );
}

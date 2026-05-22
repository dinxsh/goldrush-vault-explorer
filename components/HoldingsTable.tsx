"use client";

import SubVaultRow from "./SubVaultRow";
import { type VaultNode } from "@/types/vault";

interface Props {
    nodes: VaultNode[];
}

const COLS = ["Token", "Balance", "Price", "USD Value", "24h Change", "Protocol", "Type"];

export default function HoldingsTable({ nodes }: Props) {
    const total = nodes.reduce((sum, n) => sum + n.balanceUSD, 0);
    const formattedTotal = total > 0 ? total.toLocaleString("en-US", { style: "currency", currency: "USD" }) : "—";

    return (
        <div
            className="rounded border overflow-x-auto"
            style={{ borderColor: "var(--border)", background: "var(--card)" }}
        >
            <table className="w-full text-left" style={{ borderCollapse: "collapse", minWidth: 640 }}>
                <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                        {COLS.map((col, i) => (
                            <th
                                key={col}
                                className="py-2.5 text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                                style={{
                                    color: "var(--text-secondary)",
                                    paddingLeft: i === 0 ? 12 : 12,
                                    paddingRight: 12,
                                    textAlign: i >= 2 && i <= 4 ? "right" : "left",
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
                                colSpan={COLS.length}
                                className="py-10 text-center text-sm"
                                style={{ color: "var(--text-secondary)" }}
                            >
                                No holdings found for this address.
                            </td>
                        </tr>
                    ) : (
                        nodes.map((node) => <SubVaultRow key={`${node.address}-${node.depth}`} node={node} />)
                    )}
                </tbody>
                {nodes.length > 0 && (
                    <tfoot>
                        <tr style={{ borderTop: "1px solid var(--border)" }}>
                            <td
                                colSpan={COLS.length}
                                className="py-2.5 px-3 text-right text-sm font-semibold"
                                style={{ color: "var(--text-secondary)" }}
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
        </div>
    );
}

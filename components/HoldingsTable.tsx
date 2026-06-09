"use client";

import SubVaultRow from "./SubVaultRow";
import { type VaultNode } from "@/types/vault";

interface Props {
    nodes: VaultNode[];
}

// label, alignment, and responsive visibility. Token + USD Value + APY stay on every
// screen; the rest progressively appear as width allows so the table never overflows.
const COLS: { label: string; align: "left" | "right"; cls: string }[] = [
    { label: "Token", align: "left", cls: "" },
    { label: "Allocation", align: "left", cls: "hidden lg:table-cell" },
    { label: "Balance", align: "right", cls: "hidden md:table-cell" },
    { label: "USD Value", align: "right", cls: "" },
    { label: "APY", align: "right", cls: "hidden sm:table-cell" },
    { label: "24h", align: "right", cls: "hidden lg:table-cell" },
    { label: "Type", align: "left", cls: "hidden sm:table-cell" },
];

export default function HoldingsTable({ nodes }: Props) {
    const total = nodes.reduce((sum, n) => sum + n.balanceUSD, 0);
    const formattedTotal = total > 0 ? total.toLocaleString("en-US", { style: "currency", currency: "USD" }) : "—";

    return (
        <div
            className="rounded border overflow-x-auto"
            style={{ borderColor: "var(--border)", background: "var(--card)" }}
        >
            <table className="w-full text-left" style={{ borderCollapse: "collapse" }}>
                <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                        {COLS.map((col) => (
                            <th
                                key={col.label}
                                className={`py-2.5 px-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap ${col.cls}`}
                                style={{ color: "var(--text-secondary)", textAlign: col.align }}
                            >
                                {col.label}
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
                        nodes.map((node) => (
                            <SubVaultRow key={`${node.address}-${node.depth}`} node={node} vaultTotal={total} />
                        ))
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

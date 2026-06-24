"use client";

import { useState } from "react";
import { type Opportunity } from "@/types/opportunity";
import InfoTooltip from "./InfoTooltip";

interface OpportunityTableProps {
  opportunities: Opportunity[];
  onRowClick: (slug: string) => void;
  page: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
}

type SortKey = "chain" | "name" | "apy" | "tvl";
type SortDir = "asc" | "desc";

export default function OpportunityTable({
  opportunities,
  onRowClick,
  page,
  onPageChange,
  pageSize = 20,
}: OpportunityTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("apy");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // Sort opportunities
  const sorted = [...opportunities].sort((a, b) => {
    let aVal: string | number = "";
    let bVal: string | number = "";

    switch (sortKey) {
      case "chain":
        aVal = a.chain;
        bVal = b.chain;
        break;
      case "name":
        aVal = a.name;
        bVal = b.name;
        break;
      case "apy":
        aVal = 0; // Placeholder, would need live data
        bVal = 0;
        break;
      case "tvl":
        aVal = 0; // Placeholder
        bVal = 0;
        break;
    }

    if (typeof aVal === "string") {
      aVal = aVal.toLowerCase();
      bVal = (bVal as string).toLowerCase();
      return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }

    return sortDir === "asc" ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
  });

  // Paginate
  const totalPages = Math.ceil(sorted.length / pageSize);
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginated = sorted.slice(start, end);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  function SortIcon({ column }: { column: SortKey }) {
    if (sortKey !== column) return <span style={{ color: "var(--border)" }}>↕</span>;
    return <span style={{ color: "var(--accent)" }}>{sortDir === "asc" ? "↑" : "↓"}</span>;
  }

  return (
    <div>
      {/* Table */}
      <div className="overflow-x-auto border rounded" style={{ borderColor: "var(--border)" }}>
        <table className="w-full text-sm">
          <thead style={{ background: "var(--card)", borderBottom: `1px solid var(--border)` }}>
            <tr>
              <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-secondary)" }}>
                <button
                  onClick={() => handleSort("chain")}
                  className="flex items-center gap-1 hover:text-[var(--accent)]"
                >
                  CHAIN <SortIcon column="chain" />
                </button>
              </th>
              <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-secondary)" }}>
                <button
                  onClick={() => handleSort("name")}
                  className="flex items-center gap-1 hover:text-[var(--accent)]"
                >
                  VAULT <SortIcon column="name" />
                </button>
              </th>
              <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-secondary)" }}>
                <button
                  onClick={() => handleSort("apy")}
                  className="flex items-center gap-1 hover:text-[var(--accent)]"
                >
                  APY <InfoTooltip text="Annual Percentage Yield, updated hourly" /> <SortIcon column="apy" />
                </button>
              </th>
              <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-secondary)" }}>
                <button
                  onClick={() => handleSort("tvl")}
                  className="flex items-center gap-1 hover:text-[var(--accent)]"
                >
                  TVL <InfoTooltip text="Total Value Locked in this opportunity" /> <SortIcon column="tvl" />
                </button>
              </th>
              <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-secondary)" }}>
                30D
              </th>
              <th className="px-4 py-3 text-right font-semibold" style={{ color: "var(--text-secondary)" }}>
                ACTION
              </th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((opp, idx) => (
              <tr
                key={opp.slug}
                onClick={() => onRowClick(opp.slug)}
                className="border-t hover:bg-opacity-50 cursor-pointer transition-colors"
                style={{
                  borderColor: "var(--border)",
                  background: idx % 2 === 0 ? "transparent" : "rgba(100,116,139,0.04)",
                }}
              >
                <td className="px-4 py-3 text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                  {opp.chain.replace("-mainnet", "").toUpperCase()}
                </td>
                <td className="px-4 py-3">
                  <div style={{ color: "var(--text-primary)" }} className="font-medium">
                    {opp.name}
                  </div>
                  <div style={{ color: "var(--text-secondary)" }} className="text-xs font-mono mt-0.5">
                    {opp.vaultAddress.slice(0, 10)}…{opp.vaultAddress.slice(-8)}
                  </div>
                </td>
                <td className="px-4 py-3" style={{ color: "var(--accent)" }}>
                  —
                </td>
                <td className="px-4 py-3" style={{ color: "var(--text-primary)" }}>
                  —
                </td>
                <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>
                  —
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRowClick(opp.slug);
                    }}
                    className="text-xs font-medium transition-colors hover:text-[var(--accent)]"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    View →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <div style={{ color: "var(--text-secondary)" }}>
            Page {page} of {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page === 1}
              className="rounded px-3 py-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:border-[var(--accent)]"
              style={{
                borderColor: "var(--border)",
                color: "var(--text-secondary)",
              }}
            >
              ← Previous
            </button>
            <button
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="rounded px-3 py-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:border-[var(--accent)]"
              style={{
                borderColor: "var(--border)",
                color: "var(--text-secondary)",
              }}
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

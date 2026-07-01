"use client";

import { useEffect, useMemo, useState } from "react";
import { type Opportunity } from "@/types/opportunity";
import { type SupportedChain } from "@/types/vault";
import { explorerAddressUrl } from "@/lib/explorer";
import ChainIcon from "@/components/ChainIcon";
import InfoTooltip from "./InfoTooltip";

interface OpportunityTableProps {
  opportunities: Opportunity[];
  onRowClick: (slug: string) => void;
  page?: number;
  onPageChange?: (page: number) => void;
  pageSize?: number;
}

type SortKey = "apy" | "tvl" | "liquidity" | "liquidPct";
type SortDir = "asc" | "desc";

interface LiquidityInfo {
  liquidityUSD: number;
  liquidPct: number;
}
// Per-vault liquidity: undefined = not fetched, null = no live data, object = loaded.
type LiquidityState = Record<string, LiquidityInfo | null | undefined>;

const GREEN = "var(--accent)";
const LIQUID_PCT_GOOD = 0.05; // ≥5% instantly-withdrawable reads as healthy (green)

function fmtUsd(v: number): string {
  if (v < 1000) return `$${Math.round(v)}`;
  if (v < 1_000_000) return `$${Math.round(v / 1000)}k`;
  if (v < 1_000_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  return `$${(v / 1_000_000_000).toFixed(1)}B`;
}

function shortAddr(a: string): string {
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

// Fetch liquidity for many vaults with a small concurrency cap so a 20-row page
// doesn't fan out 20 simultaneous live decompositions.
async function fetchLiquidityPool(
  rows: { slug: string; address: string; chain: string }[],
  onResult: (slug: string, info: LiquidityInfo | null) => void,
  concurrency = 5
) {
  let i = 0;
  async function worker() {
    while (i < rows.length) {
      const row = rows[i++];
      try {
        const r = await fetch(`/api/vault-liquidity?address=${row.address}&chain=${row.chain}`);
        const d = await r.json();
        onResult(row.slug, d?.hasData ? { liquidityUSD: d.liquidityUSD, liquidPct: d.liquidPct } : null);
      } catch {
        onResult(row.slug, null);
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, rows.length) }, worker));
}

export default function OpportunityTable({ opportunities, onRowClick }: OpportunityTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("apy");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [liquidity, setLiquidity] = useState<LiquidityState>({});

  // Lazily enrich the visible rows with live liquidity.
  useEffect(() => {
    let cancelled = false;
    const rows = opportunities.map((o) => ({ slug: o.slug, address: o.vaultAddress, chain: o.chain }));
    setLiquidity((prev) => {
      const next = { ...prev };
      for (const r of rows) if (!(r.slug in next)) next[r.slug] = undefined; // mark loading
      return next;
    });
    fetchLiquidityPool(rows, (slug, info) => {
      if (!cancelled) setLiquidity((prev) => ({ ...prev, [slug]: info }));
    });
    return () => {
      cancelled = true;
    };
  }, [opportunities]);

  const sorted = useMemo(() => {
    const val = (o: Opportunity): number => {
      switch (sortKey) {
        case "apy":
          return o.apy ?? -Infinity;
        case "tvl":
          return o.tvl ?? -Infinity;
        case "liquidity":
          return liquidity[o.slug]?.liquidityUSD ?? -Infinity;
        case "liquidPct":
          return liquidity[o.slug]?.liquidPct ?? -Infinity;
      }
    };
    return [...opportunities].sort((a, b) => (sortDir === "asc" ? val(a) - val(b) : val(b) - val(a)));
  }, [opportunities, sortKey, sortDir, liquidity]);

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  function Arrow({ column }: { column: SortKey }) {
    if (sortKey !== column) return <span style={{ color: "var(--border)" }}>⇅</span>;
    return <span style={{ color: GREEN }}>{sortDir === "asc" ? "↑" : "↓"}</span>;
  }

  function HeaderCell({
    column,
    label,
    info,
    align = "right",
  }: {
    column: SortKey;
    label: string;
    info?: string;
    align?: "left" | "right";
  }) {
    return (
      <th className="px-4 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>
        {/* Clickable div (not a button) so the InfoTooltip button isn't nested
            inside another button — nested buttons are invalid HTML / hydration errors. */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => handleSort(column)}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleSort(column)}
          className="flex cursor-pointer select-none items-center gap-1.5 text-xs uppercase tracking-wider transition-colors hover:text-[var(--accent)]"
          style={{ justifyContent: align === "right" ? "flex-end" : "flex-start" }}
        >
          {label}
          {info && (
            <span onClick={(e) => e.stopPropagation()}>
              <InfoTooltip text={info} />
            </span>
          )}
          <Arrow column={column} />
        </div>
      </th>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border" style={{ borderColor: "var(--border)" }}>
      <table className="w-full text-sm">
        <thead style={{ background: "var(--card)" }}>
          <tr style={{ borderBottom: "1px solid var(--border)" }}>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
              Chain
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
              Vault
            </th>
            <HeaderCell column="apy" label="APY" />
            <HeaderCell column="tvl" label="TVL" info="Total Value Locked in this vault" />
            <HeaderCell column="liquidity" label="Liquidity" info="Instantly-withdrawable liquidity (idle / available cash), read live on-chain" />
            <HeaderCell column="liquidPct" label="Liquid %" info="Withdrawable liquidity as a share of TVL" />
            <th className="w-10 px-2 py-3" />
          </tr>
        </thead>
        <tbody>
          {sorted.map((opp) => {
            const liq = liquidity[opp.slug];
            const loading = liq === undefined;
            return (
              <tr
                key={opp.slug}
                onClick={() => onRowClick(opp.slug)}
                className="group cursor-pointer border-t transition-colors"
                style={{ borderColor: "var(--border)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {/* Chain */}
                <td className="px-4 py-4">
                  <span style={{ color: "var(--text-secondary)" }} title={opp.chain}>
                    <ChainIcon chain={opp.chain} size={22} />
                  </span>
                </td>

                {/* Vault */}
                <td className="px-4 py-4">
                  <div className="font-semibold" style={{ color: "var(--text-primary)" }}>
                    {opp.name}
                  </div>
                  <a
                    href={explorerAddressUrl(opp.chain as SupportedChain, opp.vaultAddress)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="mt-0.5 inline-flex items-center gap-1 font-mono text-xs transition-colors hover:text-[var(--accent)]"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {shortAddr(opp.vaultAddress)}
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <path d="M15 3h6v6" /><path d="M10 14 21 3" />
                    </svg>
                  </a>
                </td>

                {/* APY */}
                <td className="px-4 py-4 text-right font-semibold tabular-nums" style={{ color: "var(--gr-green)" }}>
                  {opp.apy != null ? `${(opp.apy * 100).toFixed(2)}%` : "—"}
                </td>

                {/* TVL */}
                <td className="px-4 py-4 text-right tabular-nums" style={{ color: "var(--text-primary)" }}>
                  {opp.tvl != null ? fmtUsd(opp.tvl) : "—"}
                </td>

                {/* Liquidity */}
                <td className="px-4 py-4 text-right tabular-nums" style={{ color: "var(--text-primary)" }}>
                  {loading ? <Skeleton /> : liq ? fmtUsd(liq.liquidityUSD) : <span style={{ color: "var(--text-secondary)" }}>—</span>}
                </td>

                {/* Liquid % badge */}
                <td className="px-4 py-4 text-right">
                  {loading ? (
                    <Skeleton />
                  ) : liq ? (
                    <PctBadge pct={liq.liquidPct} />
                  ) : (
                    <span style={{ color: "var(--text-secondary)" }}>—</span>
                  )}
                </td>

                {/* Chevron */}
                <td className="px-2 py-4 text-right">
                  <svg
                    width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    className="ml-auto transition-colors"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function PctBadge({ pct }: { pct: number }) {
  const good = pct >= LIQUID_PCT_GOOD;
  const color = good ? "var(--positive)" : "var(--negative)";
  return (
    <span
      className="inline-block rounded px-2 py-1 text-xs font-semibold tabular-nums"
      style={{ color, background: good ? "rgba(34,197,94,0.14)" : "rgba(239,68,68,0.14)" }}
    >
      {(pct * 100).toFixed(1)}%
    </span>
  );
}

function Skeleton() {
  return <span className="inline-block h-3 w-12 animate-pulse rounded" style={{ background: "var(--border)" }} />;
}

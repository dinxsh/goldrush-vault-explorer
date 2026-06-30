"use client";

import { type SupportedChain } from "@/types/vault";
import { useEffect, useRef, useState } from "react";
import ChainIcon from "@/components/ChainIcon";

interface OpportunityFiltersProps {
  chain?: SupportedChain;
  protocol?: string;
  riskLevel?: string;
  search: string;
  sort: string;
  minApy?: number;
  maxApy?: number;
  onFilterChange: (filters: Record<string, string | undefined>) => void;
}

const CHAINS: { value: SupportedChain; label: string }[] = [
  { value: "base-mainnet", label: "Base" },
  { value: "eth-mainnet", label: "Ethereum" },
  { value: "optimism-mainnet", label: "Optimism" },
  { value: "arbitrum-mainnet", label: "Arbitrum" },
  { value: "matic-mainnet", label: "Polygon" },
  { value: "avalanche-mainnet", label: "Avalanche" },
];

const PROTOCOLS = [
  "Morpho", "Aave", "Curve", "Yearn", "Compound", "Lido", "Rocket Pool", "Pendle",
  "Convex", "Balancer", "Uniswap", "Gearbox", "EigenLayer", "Sommelier", "GMX",
  "Camelot", "Radiant", "Beethoven", "Aerodrome", "QuickSwap",
];
const RISK_LEVELS = ["low", "medium", "high"];
const SORT_OPTIONS = [
  { value: "apy-desc", label: "Best APY" },
  { value: "apy-asc", label: "Lowest APY" },
  { value: "tvl-desc", label: "Highest TVL" },
  { value: "tvl-asc", label: "Lowest TVL" },
  { value: "name", label: "Name A–Z" },
];

const GREEN = "var(--gr-green)";

export default function OpportunityFilters({
  chain,
  protocol,
  riskLevel,
  search,
  sort,
  minApy,
  maxApy,
  onFilterChange,
}: OpportunityFiltersProps) {
  const [searchValue, setSearchValue] = useState(search);
  const [minApyValue, setMinApyValue] = useState(minApy != null ? (minApy * 100).toString() : "");
  const [maxApyValue, setMaxApyValue] = useState(maxApy != null ? (maxApy * 100).toString() : "");
  const [panelOpen, setPanelOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Keep local inputs in sync if filters change from outside (e.g. clear-all, back nav).
  useEffect(() => setSearchValue(search), [search]);
  useEffect(() => setMinApyValue(minApy != null ? (minApy * 100).toString() : ""), [minApy]);
  useEffect(() => setMaxApyValue(maxApy != null ? (maxApy * 100).toString() : ""), [maxApy]);

  // Lock body scroll while the slide-over is open.
  useEffect(() => {
    if (!panelOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [panelOpen]);

  const handleSearch = (value: string) => {
    setSearchValue(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onFilterChange({ q: value || undefined }), 250);
  };

  const toggleChain = (value: SupportedChain) => onFilterChange({ chain: chain === value ? undefined : value });

  const commitMinApy = (value: string) => {
    setMinApyValue(value);
    onFilterChange({ minApy: value ? (parseFloat(value) / 100).toString() : undefined });
  };
  const commitMaxApy = (value: string) => {
    setMaxApyValue(value);
    onFilterChange({ maxApy: value ? (parseFloat(value) / 100).toString() : undefined });
  };

  const clearAll = () => {
    setSearchValue("");
    setMinApyValue("");
    setMaxApyValue("");
    onFilterChange({ chain: undefined, protocol: undefined, riskLevel: undefined, q: undefined, minApy: undefined, maxApy: undefined, sort: "apy-desc" });
  };

  // Count advanced (slide-over) filters in effect for the button badge.
  const advancedCount = [protocol, riskLevel, minApyValue, maxApyValue, sort !== "apy-desc" ? sort : ""].filter(Boolean).length;
  const hasAny = !!(chain || protocol || riskLevel || searchValue || minApyValue || maxApyValue) || sort !== "apy-desc";

  return (
    <div>
      {/* Primary control bar */}
      <div className="flex flex-col gap-3 rounded-xl border p-3 lg:flex-row lg:items-center" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
        {/* Search */}
        <div className="relative flex-1 lg:max-w-sm">
          <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="Search vaults…"
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full rounded-lg border py-2.5 pl-9 pr-3 text-sm outline-none transition-colors"
            style={{ background: "var(--surface)", color: "var(--text-primary)", borderColor: searchValue ? GREEN : "var(--border)" }}
            onFocus={(e) => (e.currentTarget.style.borderColor = GREEN as string)}
            onBlur={(e) => (e.currentTarget.style.borderColor = searchValue ? (GREEN as string) : "var(--border)")}
          />
        </div>

        {/* Chain chips */}
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {CHAINS.map((c) => {
            const on = chain === c.value;
            return (
              <button
                key={c.value}
                onClick={() => toggleChain(c.value)}
                className="flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-xs font-medium transition-all"
                style={{
                  borderColor: on ? GREEN : "var(--border)",
                  color: on ? GREEN : "var(--text-primary)",
                  background: on ? "var(--gr-green-dim)" : "var(--surface)",
                }}
                onMouseEnter={(e) => { if (!on) e.currentTarget.style.background = "var(--surface-hover)"; }}
                onMouseLeave={(e) => { if (!on) e.currentTarget.style.background = "var(--surface)"; }}
                aria-pressed={on}
              >
                <ChainIcon chain={c.value} size={15} />
                {c.label}
              </button>
            );
          })}
        </div>

        {/* Filters button */}
        <button
          onClick={() => setPanelOpen(true)}
          className="flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors"
          style={{
            borderColor: advancedCount ? GREEN : "var(--border)",
            color: advancedCount ? GREEN : "var(--text-primary)",
            background: advancedCount ? "var(--gr-green-dim)" : "var(--surface)",
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="4" y1="6" x2="20" y2="6" /><line x1="7" y1="12" x2="17" y2="12" /><line x1="10" y1="18" x2="14" y2="18" />
          </svg>
          Filters
          {advancedCount > 0 && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold" style={{ background: GREEN, color: "var(--bg)" }}>
              {advancedCount}
            </span>
          )}
        </button>
      </div>

      {/* Active filter pills */}
      {hasAny && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {chain && <Pill label={CHAINS.find((c) => c.value === chain)?.label ?? chain} onClear={() => onFilterChange({ chain: undefined })} />}
          {protocol && <Pill label={protocol} onClear={() => onFilterChange({ protocol: undefined })} />}
          {riskLevel && <Pill label={`${cap(riskLevel)} risk`} onClear={() => onFilterChange({ riskLevel: undefined })} />}
          {minApyValue && <Pill label={`Min ${minApyValue}%`} onClear={() => commitMinApy("")} />}
          {maxApyValue && <Pill label={`Max ${maxApyValue}%`} onClear={() => commitMaxApy("")} />}
          {sort !== "apy-desc" && <Pill label={SORT_OPTIONS.find((s) => s.value === sort)?.label ?? sort} onClear={() => onFilterChange({ sort: "apy-desc" })} />}
          <button onClick={clearAll} className="text-xs underline-offset-2 transition-colors hover:underline" style={{ color: "var(--text-secondary)" }}>
            Clear all
          </button>
        </div>
      )}

      {/* Slide-over panel */}
      {panelOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setPanelOpen(false)} />
          <div
            className="absolute right-0 top-0 flex h-full w-full max-w-sm flex-col border-l shadow-2xl"
            style={{ background: "var(--bg)", borderColor: "var(--border)" }}
          >
            <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: "var(--border)" }}>
              <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Filters</h3>
              <button onClick={() => setPanelOpen(false)} className="text-lg leading-none transition-colors hover:text-[var(--gr-green)]" style={{ color: "var(--text-secondary)" }}>✕</button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
              {/* Protocol */}
              <Field label="Protocol">
                <select
                  value={protocol || ""}
                  onChange={(e) => onFilterChange({ protocol: e.target.value || undefined })}
                  className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none"
                  style={{ background: "var(--surface)", color: "var(--text-primary)", borderColor: protocol ? GREEN : "var(--border)" }}
                >
                  <option value="">All protocols</option>
                  {PROTOCOLS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </Field>

              {/* Risk */}
              <Field label="Risk level">
                <div className="flex gap-2">
                  {RISK_LEVELS.map((r) => {
                    const on = riskLevel === r;
                    return (
                      <button
                        key={r}
                        onClick={() => onFilterChange({ riskLevel: on ? undefined : r })}
                        className="flex-1 rounded-lg border py-2 text-xs font-medium capitalize transition-all"
                        style={{ borderColor: on ? GREEN : "var(--border)", color: on ? GREEN : "var(--text-primary)", background: on ? "var(--gr-green-dim)" : "var(--surface)" }}
                      >
                        {r}
                      </button>
                    );
                  })}
                </div>
              </Field>

              {/* APY range */}
              <Field label="APY range (%)">
                <div className="flex items-center gap-2">
                  <input
                    type="number" inputMode="decimal" placeholder="Min" min="0" max="200" step="0.1"
                    value={minApyValue} onChange={(e) => commitMinApy(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none"
                    style={{ background: "var(--surface)", color: "var(--text-primary)", borderColor: minApyValue ? GREEN : "var(--border)" }}
                  />
                  <span style={{ color: "var(--text-secondary)" }}>–</span>
                  <input
                    type="number" inputMode="decimal" placeholder="Max" min="0" max="200" step="0.1"
                    value={maxApyValue} onChange={(e) => commitMaxApy(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none"
                    style={{ background: "var(--surface)", color: "var(--text-primary)", borderColor: maxApyValue ? GREEN : "var(--border)" }}
                  />
                </div>
              </Field>

              {/* Sort */}
              <Field label="Sort by">
                <div className="grid grid-cols-1 gap-2">
                  {SORT_OPTIONS.map((opt) => {
                    const on = sort === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => onFilterChange({ sort: opt.value })}
                        className="flex items-center justify-between rounded-lg border px-3 py-2.5 text-sm transition-all"
                        style={{ borderColor: on ? GREEN : "var(--border)", color: on ? GREEN : "var(--text-primary)", background: on ? "var(--gr-green-dim)" : "var(--surface)" }}
                      >
                        {opt.label}
                        {on && <span>✓</span>}
                      </button>
                    );
                  })}
                </div>
              </Field>
            </div>

            <div className="flex gap-3 border-t px-5 py-4" style={{ borderColor: "var(--border)" }}>
              <button onClick={clearAll} className="flex-1 rounded-lg border py-2.5 text-sm font-medium transition-colors" style={{ borderColor: "var(--border)", color: "var(--text-primary)", background: "var(--surface)" }}>
                Clear all
              </button>
              <button onClick={() => setPanelOpen(false)} className="flex-1 rounded-lg py-2.5 text-sm font-semibold transition-opacity hover:opacity-90" style={{ background: GREEN, color: "var(--bg)" }}>
                Show results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Pill({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <button
      onClick={onClear}
      className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors"
      style={{ borderColor: "var(--gr-green)", color: "var(--gr-green)", background: "var(--gr-green-dim)" }}
    >
      {label}
      <span style={{ opacity: 0.8 }}>✕</span>
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

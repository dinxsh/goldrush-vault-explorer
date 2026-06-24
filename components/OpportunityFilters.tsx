import { type SupportedChain } from "@/types/vault";
import { useState } from "react";

interface OpportunityFiltersProps {
  chain?: SupportedChain;
  protocol?: string;
  riskLevel?: string;
  search: string;
  sort: string;
  onFilterChange: (filters: Record<string, string | undefined>) => void;
}

const CHAINS: { value: SupportedChain; label: string }[] = [
  { value: "eth-mainnet", label: "Ethereum" },
  { value: "base-mainnet", label: "Base" },
  { value: "matic-mainnet", label: "Polygon" },
  { value: "arbitrum-mainnet", label: "Arbitrum" },
  { value: "optimism-mainnet", label: "Optimism" },
  { value: "bsc-mainnet", label: "BNB Chain" },
];

const PROTOCOLS = ["Morpho", "Aave", "Euler", "Compound", "Yearn"];
const RISK_LEVELS = ["low", "medium", "high"];
const SORT_OPTIONS = [
  { value: "apy-desc", label: "Best APY" },
  { value: "apy-asc", label: "Lowest APY" },
  { value: "tvl-desc", label: "Highest TVL" },
  { value: "name", label: "Name A-Z" },
];

export default function OpportunityFilters({
  chain,
  protocol,
  riskLevel,
  search,
  sort,
  onFilterChange,
}: OpportunityFiltersProps) {
  const [searchValue, setSearchValue] = useState(search);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    onFilterChange({ q: value || undefined });
  };

  const handleChainChange = (newChain: SupportedChain | null) => {
    onFilterChange({ chain: newChain || undefined });
  };

  const handleProtocolChange = (newProtocol: string | null) => {
    onFilterChange({ protocol: newProtocol || undefined });
  };

  const handleRiskChange = (newRisk: string | null) => {
    onFilterChange({ riskLevel: newRisk || undefined });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ sort: e.target.value });
  };

  return (
    <div>
      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search opportunities, assets, protocols..."
          value={searchValue}
          onChange={handleSearchChange}
          className="w-full rounded border px-4 py-2.5 text-sm outline-none transition-colors focus:border-[var(--accent)]"
          style={{
            background: "var(--card)",
            color: "var(--text-primary)",
            borderColor: "var(--border)",
          }}
        />
      </div>

      {/* Filter Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Filter Dropdowns */}
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
          {/* Chain Filter */}
          <select
            value={chain || ""}
            onChange={(e) => handleChainChange((e.target.value as SupportedChain) || null)}
            className="rounded border px-3 py-2 text-xs outline-none transition-colors focus:border-[var(--accent)]"
            style={{
              background: "var(--card)",
              color: "var(--text-primary)",
              borderColor: chain ? "var(--accent)" : "var(--border)",
            }}
          >
            <option value="">All Chains</option>
            {CHAINS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>

          {/* Protocol Filter */}
          <select
            value={protocol || ""}
            onChange={(e) => handleProtocolChange(e.target.value || null)}
            className="rounded border px-3 py-2 text-xs outline-none transition-colors focus:border-[var(--accent)]"
            style={{
              background: "var(--card)",
              color: "var(--text-primary)",
              borderColor: protocol ? "var(--accent)" : "var(--border)",
            }}
          >
            <option value="">All Protocols</option>
            {PROTOCOLS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          {/* Risk Filter */}
          <select
            value={riskLevel || ""}
            onChange={(e) => handleRiskChange(e.target.value || null)}
            className="rounded border px-3 py-2 text-xs outline-none transition-colors focus:border-[var(--accent)]"
            style={{
              background: "var(--card)",
              color: "var(--text-primary)",
              borderColor: riskLevel ? "var(--accent)" : "var(--border)",
            }}
          >
            <option value="">All Risk Levels</option>
            {RISK_LEVELS.map((r) => (
              <option key={r} value={r}>
                {r.charAt(0).toUpperCase() + r.slice(1)} Risk
              </option>
            ))}
          </select>
        </div>

        {/* Sort Dropdown */}
        <select
          value={sort}
          onChange={handleSortChange}
          className="rounded border px-3 py-2 text-xs outline-none transition-colors focus:border-[var(--accent)]"
          style={{
            background: "var(--card)",
            color: "var(--text-primary)",
            borderColor: "var(--border)",
          }}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Active Filters Badge */}
      {(chain || protocol || riskLevel || search) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {chain && (
            <button
              onClick={() => handleChainChange(null)}
              className="rounded-full border px-3 py-1 text-xs transition-colors hover:border-[var(--accent)]"
              style={{ borderColor: "var(--accent)", color: "var(--accent)" }}
            >
              {CHAINS.find((c) => c.value === chain)?.label} ✕
            </button>
          )}
          {protocol && (
            <button
              onClick={() => handleProtocolChange(null)}
              className="rounded-full border px-3 py-1 text-xs transition-colors hover:border-[var(--accent)]"
              style={{ borderColor: "var(--accent)", color: "var(--accent)" }}
            >
              {protocol} ✕
            </button>
          )}
          {riskLevel && (
            <button
              onClick={() => handleRiskChange(null)}
              className="rounded-full border px-3 py-1 text-xs transition-colors hover:border-[var(--accent)]"
              style={{ borderColor: "var(--accent)", color: "var(--accent)" }}
            >
              {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} Risk ✕
            </button>
          )}
        </div>
      )}
    </div>
  );
}

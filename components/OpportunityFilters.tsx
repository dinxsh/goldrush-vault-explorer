import { type SupportedChain } from "@/types/vault";
import { useState } from "react";

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
  { value: "eth-mainnet", label: "Ethereum" },
  { value: "base-mainnet", label: "Base" },
  { value: "matic-mainnet", label: "Polygon" },
  { value: "arbitrum-mainnet", label: "Arbitrum" },
  { value: "optimism-mainnet", label: "Optimism" },
  { value: "avalanche-mainnet", label: "Avalanche" },
];

const PROTOCOLS = [
  "Morpho",
  "Aave",
  "Curve",
  "Yearn",
  "Compound",
  "Lido",
  "Rocket Pool",
  "Pendle",
  "Convex",
  "Balancer",
  "Uniswap",
  "Gearbox",
  "EigenLayer",
  "Sommelier",
  "GMX",
  "Camelot",
  "Radiant",
  "Beethoven",
  "Aerodrome",
  "QuickSwap",
];
const RISK_LEVELS = ["low", "medium", "high"];
const SORT_OPTIONS = [
  { value: "apy-desc", label: "Best APY" },
  { value: "apy-asc", label: "Lowest APY" },
  { value: "tvl-desc", label: "Highest TVL" },
  { value: "tvl-asc", label: "Lowest TVL" },
  { value: "name", label: "Name A-Z" },
];

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
  const [minApyValue, setMinApyValue] = useState(minApy ? (minApy * 100).toString() : "");
  const [maxApyValue, setMaxApyValue] = useState(maxApy ? (maxApy * 100).toString() : "");
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

  const handleMinApyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMinApyValue(value);
    const numValue = value ? (parseFloat(value) / 100).toString() : undefined;
    onFilterChange({ minApy: numValue });
  };

  const handleMaxApyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMaxApyValue(value);
    const numValue = value ? (parseFloat(value) / 100).toString() : undefined;
    onFilterChange({ maxApy: numValue });
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

          {/* APY Range Filter */}
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min APY %"
              value={minApyValue}
              onChange={handleMinApyChange}
              min="0"
              max="100"
              step="0.1"
              className="w-20 rounded border px-2 py-2 text-xs outline-none transition-colors focus:border-[var(--accent)]"
              style={{
                background: "var(--card)",
                color: "var(--text-primary)",
                borderColor: minApyValue ? "var(--accent)" : "var(--border)",
              }}
            />
            <input
              type="number"
              placeholder="Max APY %"
              value={maxApyValue}
              onChange={handleMaxApyChange}
              min="0"
              max="100"
              step="0.1"
              className="w-20 rounded border px-2 py-2 text-xs outline-none transition-colors focus:border-[var(--accent)]"
              style={{
                background: "var(--card)",
                color: "var(--text-primary)",
                borderColor: maxApyValue ? "var(--accent)" : "var(--border)",
              }}
            />
          </div>
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
      {(chain || protocol || riskLevel || search || minApyValue || maxApyValue) && (
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
          {minApyValue && (
            <button
              onClick={() => {
                setMinApyValue("");
                onFilterChange({ minApy: undefined });
              }}
              className="rounded-full border px-3 py-1 text-xs transition-colors hover:border-[var(--accent)]"
              style={{ borderColor: "var(--accent)", color: "var(--accent)" }}
            >
              Min {minApyValue}% ✕
            </button>
          )}
          {maxApyValue && (
            <button
              onClick={() => {
                setMaxApyValue("");
                onFilterChange({ maxApy: undefined });
              }}
              className="rounded-full border px-3 py-1 text-xs transition-colors hover:border-[var(--accent)]"
              style={{ borderColor: "var(--accent)", color: "var(--accent)" }}
            >
              Max {maxApyValue}% ✕
            </button>
          )}
        </div>
      )}
    </div>
  );
}

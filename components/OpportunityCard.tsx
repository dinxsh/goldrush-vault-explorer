import { type Opportunity } from "@/types/opportunity";

interface OpportunityCardProps {
  opportunity: Opportunity;
}

export default function OpportunityCard({ opportunity }: OpportunityCardProps) {
  const riskColor =
    opportunity.riskLevel === "low"
      ? "rgba(34, 197, 94, 0.12)"
      : opportunity.riskLevel === "medium"
        ? "rgba(249, 115, 22, 0.12)"
        : "rgba(239, 68, 68, 0.12)";

  const riskTextColor =
    opportunity.riskLevel === "low"
      ? "#22c55e"
      : opportunity.riskLevel === "medium"
        ? "#f97316"
        : "#ef4444";

  return (
    <div
      className="rounded border p-4 hover:border-[var(--accent)] transition-colors text-left group cursor-pointer h-full flex flex-col"
      style={{ borderColor: "var(--border)", background: "var(--card)" }}
    >
      {/* Header with badges */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-sm group-hover:text-[var(--accent)] transition-colors" style={{ color: "var(--text-primary)" }}>
            {opportunity.name}
          </h3>
          <p className="text-xs mt-1 line-clamp-2" style={{ color: "var(--text-secondary)" }}>
            {opportunity.description}
          </p>
        </div>
        <div className="shrink-0 flex gap-1.5">
          <span className="rounded px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap" style={{ background: "var(--gr-green-dim)", color: "var(--accent)" }}>
            {opportunity.protocol}
          </span>
          <span className="rounded px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap" style={{ background: riskColor, color: riskTextColor }}>
            {opportunity.riskLevel}
          </span>
        </div>
      </div>

      {/* Metrics - grow to fill space */}
      <div className="flex-1 flex flex-col justify-end">
        {/* Main metrics */}
        <div className="flex gap-4 items-baseline mb-2">
          <div>
            <div className="text-2xl font-bold" style={{ color: "var(--accent)" }}>
              {opportunity.apy ? `${(opportunity.apy * 100).toFixed(2)}%` : "—"}
            </div>
            <div className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color: "var(--text-secondary)" }}>
              APY
            </div>
          </div>
          <div>
            <div className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
              {opportunity.tvl ? `$${(opportunity.tvl / 1_000_000).toFixed(1)}M` : "—"}
            </div>
            <div className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color: "var(--text-secondary)" }}>
              TVL
            </div>
          </div>
        </div>

        {/* Secondary metrics */}
        <div className="text-xs flex justify-between" style={{ color: "var(--text-secondary)" }}>
          <span>{opportunity.riskLevel}</span>
          <span>View →</span>
        </div>
      </div>
    </div>
  );
}

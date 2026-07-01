"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import InfoTooltip from "@/components/InfoTooltip";
import VaultCharts from "@/components/charts/VaultCharts";
import { ToastContainer, useToast } from "@/components/Toast";
import { type OpportunityWithMetrics } from "@/types/opportunity";
import { getProtocolDeployUrl } from "@/lib/protocol-urls";

interface ApiError {
  error: string;
  errorCode: string;
  timestamp: string;
  suggestedAction?: string;
  vault?: {
    address: string;
    chain: string;
    protocol: string;
  };
}

export default function OpportunityDetailPage() {
  const router = useRouter();
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : params.slug?.[0] || "";
  const { toasts, addToast, removeToast } = useToast();

  const [opportunity, setOpportunity] = useState<OpportunityWithMetrics | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchOpportunity() {
      setLoading(true);
      setError(null);

      // Live blockchain reads can briefly time out (cold start, RPC blip). Retry a few
      // times with backoff before surfacing an error so transient failures self-heal
      // instead of dumping the user on a full error page.
      const MAX_ATTEMPTS = 3;
      let lastError: ApiError | null = null;

      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        try {
          const response = await fetch(`/api/opportunities/${slug}`);
          const data = await response.json();

          if (response.ok) {
            if (!cancelled) setOpportunity(data);
            lastError = null;
            break;
          }

          lastError = data;
          // Only retry transient live-data failures; 400/404 are terminal.
          if (response.status < 500 || attempt === MAX_ATTEMPTS) break;
        } catch (err) {
          const message = err instanceof Error ? err.message : "Failed to load opportunity";
          lastError = {
            error: message,
            errorCode: "NETWORK_ERROR",
            timestamp: new Date().toISOString(),
            suggestedAction: "Check your internet connection and try again.",
          };
          if (attempt === MAX_ATTEMPTS) break;
        }
        await new Promise((resolve) => setTimeout(resolve, 1200 * attempt));
      }

      if (cancelled) return;
      if (lastError) {
        setError(lastError);
        addToast(lastError.error || "Failed to load opportunity", "error");
      }
      setLoading(false);
    }

    if (slug) fetchOpportunity();
    return () => {
      cancelled = true;
    };
  }, [slug, addToast]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-12" style={{ background: "var(--bg)" }}>
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4" style={{ borderColor: "var(--border)", borderTopColor: "var(--accent)" }} />
          <p className="mt-4" style={{ color: "var(--text-secondary)" }}>Loading...</p>
        </div>
      </main>
    );
  }

  if (!loading && !opportunity && error) {
    const isNotFound = error.errorCode === "VAULT_NOT_FOUND";
    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-12" style={{ background: "var(--bg)" }}>
        <div className="text-center max-w-md">
          <div className="text-4xl mb-4">{isNotFound ? "🔍" : "⚠️"}</div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            {isNotFound ? "Opportunity Not Found" : "Error Loading Opportunity"}
          </h1>
          <p className="mt-2" style={{ color: "var(--text-secondary)" }}>
            {error.error}
          </p>

          {error.suggestedAction && (
            <div
              className="mt-4 rounded-lg border-l-4 p-3 text-left text-sm"
              style={{
                borderColor: "var(--accent)",
                background: "rgba(100, 116, 139, 0.05)",
              }}
            >
              <p style={{ color: "var(--text-secondary)" }}>
                <strong>Suggested action:</strong> {error.suggestedAction}
              </p>
            </div>
          )}

          {error.vault && (
            <div
              className="mt-4 rounded-lg border p-3 text-left text-xs"
              style={{
                borderColor: "var(--border)",
                background: "var(--card)",
              }}
            >
              <div style={{ color: "var(--text-secondary)" }} className="font-mono">
                <div>Protocol: {error.vault.protocol}</div>
                <div>Chain: {error.vault.chain}</div>
                <div className="mt-1 break-all">Address: {error.vault.address}</div>
              </div>
            </div>
          )}

          <div className="mt-4 text-xs" style={{ color: "var(--text-secondary)" }}>
            Error Code: <code>{error.errorCode}</code> • {new Date(error.timestamp).toLocaleTimeString()}
          </div>

          <div className="mt-6 flex gap-2">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 rounded px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-80"
              style={{ background: "var(--border)", color: "var(--text-primary)" }}
            >
              Retry
            </button>
            <button
              onClick={() => router.push("/")}
              className="flex-1 rounded px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-80"
              style={{ background: "var(--accent)", color: "#0f0f0f" }}
            >
              Back to Earn
            </button>
          </div>
        </div>
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </main>
    );
  }

  if (!opportunity) {
    return null;
  }

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
    <main className="flex min-h-screen flex-col" style={{ background: "var(--bg)" }}>
      {/* Back Button */}
      <div className="border-b px-4 py-4 sm:px-6 lg:px-8" style={{ borderColor: "var(--border)" }}>
        <button
          onClick={() => router.push("/")}
          className="text-sm transition-colors hover:text-[var(--accent)]"
          style={{ color: "var(--text-secondary)" }}
        >
          ← Back to Earn
        </button>
      </div>

      {/* Header */}
      <div className="border-b px-4 py-6 sm:px-6 lg:px-8" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-6xl mx-auto">
          {/* Badges */}
          <div className="flex gap-2 mb-3 flex-wrap">
            <span className="rounded px-2 py-1 text-xs font-semibold" style={{ background: "var(--gr-green-dim)", color: "var(--accent)" }}>
              {opportunity.protocol}
            </span>
            <span className="rounded px-2 py-1 text-xs font-semibold" style={{ background: "rgba(100,116,139,0.12)", color: "#64748b" }}>
              {opportunity.chain}
            </span>
            <span className="rounded px-2 py-1 text-xs font-semibold" style={{ background: riskColor, color: riskTextColor }}>
              {opportunity.riskLevel}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
            {opportunity.name}
          </h1>
          <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
            {opportunity.description}
          </p>

          {/* Key Metrics */}
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div>
              <div className="flex items-baseline gap-2 mb-1">
                <div className="text-2xl font-bold" style={{ color: "var(--accent)" }}>
                  {opportunity.apy !== null ? `${(opportunity.apy * 100).toFixed(2)}%` : "—"}
                </div>
                <InfoTooltip text="Annual Percentage Yield, updated hourly" />
              </div>
              <div className="text-xs uppercase tracking-wider mt-1" style={{ color: "var(--text-secondary)" }}>
                APY
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2 mb-1">
                <div className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                  ${(opportunity.tvl / 1_000_000).toFixed(1)}M
                </div>
                <InfoTooltip text="Total Value Locked in this opportunity" />
              </div>
              <div className="text-xs uppercase tracking-wider mt-1" style={{ color: "var(--text-secondary)" }}>
                TVL
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2 mb-1">
                <div className="text-2xl font-bold" style={{ color: opportunity.apyChange24h >= 0 ? "#22c55e" : "#ef4444" }}>
                  {opportunity.apyChange24h >= 0 ? "+" : ""}
                  {(opportunity.apyChange24h * 100).toFixed(2)}%
                </div>
                <InfoTooltip text="Price change in last 24 hours" />
              </div>
              <div className="text-xs uppercase tracking-wider mt-1" style={{ color: "var(--text-secondary)" }}>
                24h Change
              </div>
            </div>
          </div>

          {/* Updated */}
          <p className="mt-4 text-xs" style={{ color: "var(--text-secondary)" }}>
            Updated: {new Date(opportunity.updatedAt).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Strategy */}
            <div
              className="rounded-lg border p-6"
              style={{ borderColor: "var(--border)", background: "var(--card)" }}
            >
              <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                Strategy
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                {opportunity.highlights?.join(" • ") || "No strategy details available."}
              </p>
            </div>

            {/* Risk Factors */}
            <div
              className="rounded-lg border p-6"
              style={{ borderColor: "var(--border)", background: "var(--card)" }}
            >
              <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                Risk Factors
              </h2>
              <div className="space-y-2">
                {opportunity.riskFactors?.map((factor, i) => (
                  <div key={i} className="flex gap-2">
                    <span style={{ color: riskTextColor }}>•</span>
                    <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      {factor}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div
              className="rounded-lg border p-6 sticky top-4"
              style={{ borderColor: "var(--border)", background: "var(--card)" }}
            >
              <h2 className="text-sm font-semibold uppercase tracking-wide mb-4" style={{ color: "var(--text-secondary)" }}>
                Quick Facts
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <div className="flex items-center gap-1">
                    <span style={{ color: "var(--text-secondary)" }}>Protocol</span>
                    <InfoTooltip text="Blockchain protocol providing this opportunity" />
                  </div>
                  <span style={{ color: "var(--text-primary)" }}>{opportunity.protocol}</span>
                </div>
                <div className="flex justify-between">
                  <div className="flex items-center gap-1">
                    <span style={{ color: "var(--text-secondary)" }}>Chain</span>
                    <InfoTooltip text="Blockchain network where this vault operates" />
                  </div>
                  <span style={{ color: "var(--text-primary)" }}>{opportunity.chain}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "var(--text-secondary)" }}>Asset</span>
                  <span style={{ color: "var(--text-primary)" }}>{opportunity.asset || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <div className="flex items-center gap-1">
                    <span style={{ color: "var(--text-secondary)" }}>Risk Level</span>
                    <InfoTooltip text="Calculated from smart contract, oracle, and market risks" />
                  </div>
                  <span style={{ color: riskTextColor, textTransform: "capitalize" }}>
                    {opportunity.riskLevel}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "var(--text-secondary)" }}>Fee</span>
                  <span style={{ color: "var(--text-primary)" }}>None</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance charts & APY-window analytics (live GoldRush price history) */}
        <div className="max-w-6xl mx-auto mt-6">
          <VaultCharts address={opportunity.vaultAddress} chain={opportunity.chain} vaultName={opportunity.name} />
        </div>
      </div>

      {/* CTAs */}
      <div
        className="border-t px-4 py-6 sm:px-6 lg:px-8"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="max-w-6xl mx-auto flex gap-3">
          <button
            onClick={() => router.push(`/vault/${opportunity.vaultAddress}?chain=${opportunity.chain}`)}
            className="flex-1 rounded px-4 py-3 text-sm font-semibold transition-opacity hover:opacity-80"
            style={{ background: "var(--border)", color: "var(--text-primary)" }}
          >
            View in Vault Explorer
          </button>
          <button
            onClick={() => {
              const url = getProtocolDeployUrl(opportunity.protocol, {
                vaultAddress: opportunity.vaultAddress,
                chain: opportunity.chain,
                asset: opportunity.asset,
              });
              window.open(url, "_blank");
            }}
            className="flex-1 rounded px-4 py-3 text-sm font-semibold transition-opacity hover:opacity-80"
            style={{ background: "var(--accent)", color: "#0f0f0f" }}
            title={`Deploy on ${opportunity.protocol}`}
          >
            Deploy on {opportunity.protocol} →
          </button>
        </div>
      </div>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </main>
  );
}

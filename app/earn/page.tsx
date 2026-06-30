"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import OpportunityCard from "@/components/OpportunityCard";
import OpportunityFilters from "@/components/OpportunityFilters";
import ViewToggle from "@/components/ViewToggle";
import OpportunityTable from "@/components/OpportunityTable";
import { ToastContainer, useToast } from "@/components/Toast";
import { type Opportunity } from "@/types/opportunity";
import { type SupportedChain } from "@/types/vault";

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  pages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface ApiError {
  error: string;
  errorCode: string;
  timestamp: string;
  suggestedAction?: string;
}

export default function EarnPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toasts, addToast, removeToast } = useToast();

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [meta, setMeta] = useState<{ liveCount?: number; curatedCount?: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [view, setView] = useState<"grid" | "table">("grid");

  // Filter state from URL
  const chain = (searchParams.get("chain") as SupportedChain) || undefined;
  const protocol = searchParams.get("protocol") || undefined;
  const riskLevel = searchParams.get("risk") || undefined;
  const search = searchParams.get("q") || "";
  const sort = searchParams.get("sort") || "apy-desc";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);
  const minApy = searchParams.get("minApy") ? parseFloat(searchParams.get("minApy")!) : undefined;
  const maxApy = searchParams.get("maxApy") ? parseFloat(searchParams.get("maxApy")!) : undefined;

  // Fetch opportunities
  useEffect(() => {
    async function fetchOpportunities() {
      try {
        setLoading(true);
        setError(null);
        const params = new URLSearchParams();
        if (chain) params.append("chain", chain);
        if (protocol) params.append("protocol", protocol);
        if (riskLevel) params.append("riskLevel", riskLevel);
        if (search) params.append("q", search);
        if (minApy !== undefined) params.append("minApy", minApy.toString());
        if (maxApy !== undefined) params.append("maxApy", maxApy.toString());
        params.append("sort", sort);
        params.append("page", page.toString());
        params.append("limit", limit.toString());

        const response = await fetch(`/api/opportunities?${params}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data);
          setOpportunities([]);
          setPagination(null);
          addToast(data.error || "Failed to fetch opportunities", "error");
          return;
        }

        setOpportunities(data.opportunities || []);
        setPagination(data.pagination || null);
        setMeta(data.metadata || null);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load opportunities";
        setError({
          error: message,
          errorCode: "NETWORK_ERROR",
          timestamp: new Date().toISOString(),
          suggestedAction: "Check your internet connection and try again.",
        });
        setOpportunities([]);
        setPagination(null);
        addToast(message, "error");
      } finally {
        setLoading(false);
      }
    }

    fetchOpportunities();
  }, [chain, protocol, riskLevel, search, sort, page, limit, minApy, maxApy]);

  function updateFilters(newParams: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    // Reset to page 1 when filters change
    params.set("page", "1");
    router.push(`/earn?${params.toString()}`);
  }

  function goToPage(newPage: number) {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    router.push(`/earn?${params.toString()}`);
  }

  return (
    <main className="flex min-h-screen flex-col" style={{ background: "var(--bg)" }}>
      {/* Header */}
      <div className="border-b px-4 py-8 sm:px-6 lg:px-8" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-7xl mx-auto">
          <span className="inline-block rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest" style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>
            // Vaults
          </span>
          <h1 className="mt-3 text-4xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
            <span className="rounded px-1.5" style={{ background: "var(--gr-green)", color: "var(--bg)" }}>Earn</span>{" "}
            Vaults
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Live, decomposed yield opportunities across every supported chain and protocol — sourced directly from the
            blockchain via GoldRush. Filter, compare, and dive into per-vault performance.
          </p>

          {/* Stats Grid */}
          {!loading && opportunities.length > 0 && (() => {
            const oppsWithApy = opportunities.filter((o) => o.apy != null);
            const oppsWithTvl = opportunities.filter((o) => o.tvl != null);
            if (oppsWithApy.length === 0 || oppsWithTvl.length === 0) return null;

            const stats = [
              { label: "Eligible Vaults", value: (pagination?.total ?? opportunities.length).toLocaleString() },
              { label: "Best APY", value: `${(Math.max(...oppsWithApy.map((o) => o.apy as number)) * 100).toFixed(2)}%` },
              { label: "Total TVL", value: `$${(oppsWithTvl.reduce((sum: number, o) => sum + (o.tvl as number), 0) / 1_000_000_000).toFixed(1)}B` },
            ];

            return (
              <div className="mt-6 grid grid-cols-1 gap-px overflow-hidden rounded-xl border sm:grid-cols-3" style={{ borderColor: "var(--border)", background: "var(--border)" }}>
                {stats.map((s) => (
                  <div key={s.label} className="p-5" style={{ background: "var(--card)" }}>
                    <div className="text-xs uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>{s.label}</div>
                    <div className="mt-1 text-2xl font-bold" style={{ color: "var(--gr-green)" }}>{s.value}</div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Filters & Content */}
      <div className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Filters */}
          <OpportunityFilters
            chain={chain}
            protocol={protocol}
            riskLevel={riskLevel}
            search={search}
            sort={sort}
            minApy={minApy}
            maxApy={maxApy}
            onFilterChange={updateFilters}
          />

          {/* Result count + View Toggle */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
              {pagination?.total != null && <span>{pagination.total.toLocaleString()} vaults</span>}
              {meta?.liveCount != null && meta.liveCount > 0 && (
                <span className="flex items-center gap-1.5 rounded-full px-2 py-0.5" style={{ background: "var(--gr-green-dim)", color: "var(--gr-green)" }}>
                  <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: "var(--gr-green)" }} />
                  {meta.liveCount.toLocaleString()} live · {meta.curatedCount ?? 0} curated
                </span>
              )}
            </div>
            <ViewToggle view={view} onViewChange={setView} />
          </div>

          {/* Error State */}
          {error && !loading && (
            <div className="mt-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-start gap-3">
                  <div className="mt-1 text-red-500 text-xl">⚠</div>
                  <div className="flex-1">
                    <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>
                      {error.error}
                    </h3>
                    {error.suggestedAction && (
                      <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                        {error.suggestedAction}
                      </p>
                    )}
                    <div className="mt-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                      Error Code: <code>{error.errorCode}</code> • {new Date(error.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => window.location.reload()}
                  className="w-full mt-2 rounded px-3 py-2 text-sm font-medium transition-colors"
                  style={{
                    background: "var(--accent)",
                    color: "var(--bg)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="mt-6 flex flex-col gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-24 rounded border animate-pulse"
                  style={{ background: "var(--border)", opacity: 1 - i * 0.2 }}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && opportunities.length === 0 && (
            <div className="mt-6 text-center py-12">
              <p style={{ color: "var(--text-secondary)" }}>No opportunities match your filters. Try adjusting them.</p>
            </div>
          )}

          {/* Grid View */}
          {!loading && !error && opportunities.length > 0 && view === "grid" && (
            <div className="mt-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {opportunities.map((opp) => (
                  <div key={opp.slug} onClick={() => router.push(`/earn/${opp.slug}`)} className="cursor-pointer">
                    <OpportunityCard opportunity={opp} />
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {pagination && (
                <div className="mt-6 flex items-center justify-between rounded-lg border p-4" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
                  <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    Page {pagination.page} of {pagination.pages} • Showing {opportunities.length} of {pagination.total} results
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => goToPage(pagination.page - 1)}
                      disabled={!pagination.hasPreviousPage}
                      className="rounded px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        background: pagination.hasPreviousPage ? "var(--accent)" : "var(--border)",
                        color: pagination.hasPreviousPage ? "var(--bg)" : "var(--text-secondary)",
                      }}
                    >
                      ← Previous
                    </button>
                    <button
                      onClick={() => goToPage(pagination.page + 1)}
                      disabled={!pagination.hasNextPage}
                      className="rounded px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        background: pagination.hasNextPage ? "var(--accent)" : "var(--border)",
                        color: pagination.hasNextPage ? "var(--bg)" : "var(--text-secondary)",
                      }}
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Table View */}
          {!loading && !error && opportunities.length > 0 && view === "table" && (
            <div className="mt-6">
              <OpportunityTable
                opportunities={opportunities}
                onRowClick={(slug) => router.push(`/earn/${slug}`)}
                page={page}
                onPageChange={goToPage}
                pageSize={limit}
              />

              {/* Pagination Controls */}
              {pagination && (
                <div className="mt-6 flex items-center justify-between rounded-lg border p-4" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
                  <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    Page {pagination.page} of {pagination.pages} • Showing {opportunities.length} of {pagination.total} results
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => goToPage(pagination.page - 1)}
                      disabled={!pagination.hasPreviousPage}
                      className="rounded px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        background: pagination.hasPreviousPage ? "var(--accent)" : "var(--border)",
                        color: pagination.hasPreviousPage ? "var(--bg)" : "var(--text-secondary)",
                      }}
                    >
                      ← Previous
                    </button>
                    <button
                      onClick={() => goToPage(pagination.page + 1)}
                      disabled={!pagination.hasNextPage}
                      className="rounded px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        background: pagination.hasNextPage ? "var(--accent)" : "var(--border)",
                        color: pagination.hasNextPage ? "var(--bg)" : "var(--text-secondary)",
                      }}
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </main>
  );
}

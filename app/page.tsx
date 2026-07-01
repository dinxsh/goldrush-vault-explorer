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
  // 24 divides evenly into the responsive grid (1 / 2 / 3 columns), so a full
  // page never leaves an orphan empty cell in the last row. 20 did (20 % 3 = 2).
  const limit = parseInt(searchParams.get("limit") || "24", 10);
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
    router.push(`/?${params.toString()}`);
  }

  function goToPage(newPage: number) {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    router.push(`/?${params.toString()}`);
  }

  return (
    <main className="flex min-h-screen flex-col" style={{ background: "var(--bg)" }}>
      {/* ── Branded marketing hero ───────────────────────────────── */}
      <header className="relative overflow-hidden border-b" style={{ borderColor: "var(--border)" }}>
        {/* pink / cyan / purple gradient glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(900px 480px at 80% -14%, rgba(255,76,139,0.20), transparent 60%)," +
              "radial-gradient(680px 420px at 4% -8%, rgba(0,216,213,0.12), transparent 58%)," +
              "radial-gradient(820px 520px at 55% 128%, rgba(133,88,212,0.12), transparent 60%)",
          }}
        />
        {/* faint grid, masked toward the top */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(var(--text-secondary) 1px, transparent 1px), linear-gradient(90deg, var(--text-secondary) 1px, transparent 1px)",
            backgroundSize: "46px 46px",
            maskImage: "radial-gradient(1100px 460px at 50% 0%, #000 38%, transparent 86%)",
            WebkitMaskImage: "radial-gradient(1100px 460px at 50% 0%, #000 38%, transparent 86%)",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 sm:py-20">
          {/* live kicker (logo already lives in the navbar) */}
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" style={{ background: "var(--gr-green)" }} />
              <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: "var(--gr-green)" }} />
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.22em]" style={{ color: "var(--text-secondary)" }}>
              Live on-chain yield
            </span>
          </div>

          {/* headline */}
          <h1 className="mt-7 max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl" style={{ color: "var(--text-primary)" }}>
            Every DeFi vault,{" "}
            <span
              style={{
                background: "linear-gradient(100deg, var(--accent), var(--brand-purple) 52%, var(--brand-cyan))",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              decomposed on-chain.
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed sm:text-lg" style={{ color: "var(--text-secondary)" }}>
            Compare live APY, TVL and withdrawable liquidity across hundreds of vaults on 6 networks. Then open any one
            and see exactly where its yield comes from, right down to the on-chain positions.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#vaults"
              className="rounded-lg px-5 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
              style={{
                background: "linear-gradient(100deg, var(--accent), var(--accent-deep))",
                color: "#0f0f0f",
                boxShadow: "0 10px 34px var(--accent-glow)",
              }}
            >
              Browse vaults ↓
            </a>
            <button
              onClick={() => router.push("/explore")}
              className="rounded-lg border px-5 py-3 text-sm font-semibold transition-colors hover:border-[var(--accent)]"
              style={{ borderColor: "var(--border)", color: "var(--text-primary)", background: "var(--surface)" }}
            >
              Explore any address
            </button>
            <a
              href="https://goldrush.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium transition-colors hover:text-[var(--accent)]"
              style={{ color: "var(--text-secondary)" }}
            >
              Powered by GoldRush →
            </a>
          </div>

          {/* live stat highlights */}
          {!loading && opportunities.length > 0 && (() => {
            const oppsWithApy = opportunities.filter((o) => o.apy != null);
            const oppsWithTvl = opportunities.filter((o) => o.tvl != null);
            if (oppsWithApy.length === 0 || oppsWithTvl.length === 0) return null;

            const stats: { label: string; value: string; accent?: string }[] = [
              { label: "Vaults tracked", value: (pagination?.total ?? opportunities.length).toLocaleString() },
              { label: "Best APY", value: `${(Math.max(...oppsWithApy.map((o) => o.apy as number)) * 100).toFixed(2)}%`, accent: "var(--gr-green)" },
              { label: "Total TVL", value: `$${(oppsWithTvl.reduce((sum: number, o) => sum + (o.tvl as number), 0) / 1_000_000_000).toFixed(1)}B` },
              { label: "Networks", value: "6" },
            ];

            return (
              <div className="mt-12 grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-2xl border sm:grid-cols-4" style={{ borderColor: "var(--border)", background: "var(--border)" }}>
                {stats.map((s) => (
                  <div key={s.label} className="px-5 py-4" style={{ background: "rgba(18,18,18,0.72)", backdropFilter: "blur(6px)" }}>
                    <div className="font-mono text-[10px] uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>{s.label}</div>
                    <div className="mt-1 font-mono text-2xl font-bold tabular-nums" style={{ color: s.accent ?? "var(--text-primary)" }}>{s.value}</div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </header>

      {/* Filters & Content */}
      <div id="vaults" className="flex-1 scroll-mt-24 px-4 py-6 sm:px-6 lg:px-8">
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

          {/* Loading State — mirrors the real layout (card grid or table rows)
              so the page doesn't jump when data arrives. */}
          {loading && (
            view === "grid" ? (
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="rounded border p-4" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
                    {/* title + description + badges */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="h-4 w-2/3 animate-pulse rounded" style={{ background: "var(--surface-hover)" }} />
                        <div className="h-3 w-full animate-pulse rounded" style={{ background: "var(--surface)" }} />
                        <div className="h-3 w-4/5 animate-pulse rounded" style={{ background: "var(--surface)" }} />
                      </div>
                      <div className="flex shrink-0 gap-1.5">
                        <div className="h-4 w-12 animate-pulse rounded" style={{ background: "var(--surface)" }} />
                        <div className="h-4 w-9 animate-pulse rounded" style={{ background: "var(--surface)" }} />
                      </div>
                    </div>
                    {/* APY + TVL metrics */}
                    <div className="mt-6 flex items-end gap-5">
                      <div className="space-y-1.5">
                        <div className="h-6 w-20 animate-pulse rounded" style={{ background: "var(--surface-hover)" }} />
                        <div className="h-2.5 w-8 animate-pulse rounded" style={{ background: "var(--surface)" }} />
                      </div>
                      <div className="space-y-1.5">
                        <div className="h-5 w-16 animate-pulse rounded" style={{ background: "var(--surface)" }} />
                        <div className="h-2.5 w-8 animate-pulse rounded" style={{ background: "var(--surface)" }} />
                      </div>
                    </div>
                    {/* footer */}
                    <div className="mt-4 flex justify-between">
                      <div className="h-2.5 w-12 animate-pulse rounded" style={{ background: "var(--surface)" }} />
                      <div className="h-2.5 w-10 animate-pulse rounded" style={{ background: "var(--surface)" }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-6 overflow-hidden rounded-xl border" style={{ borderColor: "var(--border)" }}>
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 border-t px-4 py-4 first:border-t-0" style={{ borderColor: "var(--border)" }}>
                    <div className="h-6 w-6 shrink-0 animate-pulse rounded-full" style={{ background: "var(--surface)" }} />
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="h-3.5 w-40 max-w-[60%] animate-pulse rounded" style={{ background: "var(--surface-hover)" }} />
                      <div className="h-2.5 w-24 max-w-[40%] animate-pulse rounded" style={{ background: "var(--surface)" }} />
                    </div>
                    <div className="hidden h-3.5 w-14 animate-pulse rounded sm:block" style={{ background: "var(--surface)" }} />
                    <div className="hidden h-3.5 w-16 animate-pulse rounded sm:block" style={{ background: "var(--surface)" }} />
                    <div className="hidden h-3.5 w-12 animate-pulse rounded sm:block" style={{ background: "var(--surface)" }} />
                  </div>
                ))}
              </div>
            )
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

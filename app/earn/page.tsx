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

export default function EarnPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toasts, addToast, removeToast } = useToast();

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"grid" | "table">("grid");
  const [page, setPage] = useState(1);

  // Filter state from URL
  const chain = (searchParams.get("chain") as SupportedChain) || undefined;
  const protocol = searchParams.get("protocol") || undefined;
  const riskLevel = searchParams.get("risk") || undefined;
  const search = searchParams.get("q") || "";
  const sort = searchParams.get("sort") || "apy-desc";

  // Fetch opportunities
  useEffect(() => {
    async function fetchOpportunities() {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (chain) params.append("chain", chain);
        if (protocol) params.append("protocol", protocol);
        if (riskLevel) params.append("riskLevel", riskLevel);
        if (search) params.append("q", search);
        params.append("sort", sort);

        const response = await fetch(`/api/opportunities?${params}`);
        if (!response.ok) throw new Error("Failed to fetch opportunities");

        const data = await response.json();
        setOpportunities(data.opportunities || []);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load opportunities";
        addToast(message, "error");
        setOpportunities([]);
      } finally {
        setLoading(false);
      }
    }

    fetchOpportunities();
  }, [chain, protocol, riskLevel, search, sort, addToast]);

  function updateFilters(newParams: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    router.push(`/earn?${params.toString()}`);
  }

  return (
    <main className="flex min-h-screen flex-col" style={{ background: "var(--bg)" }}>
      {/* Header */}
      <div className="border-b px-4 py-6 sm:px-6 lg:px-8" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Earn Opportunities
          </h1>
          <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
            Discover vetted yield opportunities across DeFi protocols
          </p>
        </div>
      </div>

      {/* Filters & Content */}
      <div className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Filters & View Toggle */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex-1">
              <OpportunityFilters
                chain={chain}
                protocol={protocol}
                riskLevel={riskLevel}
                search={search}
                sort={sort}
                onFilterChange={updateFilters}
              />
            </div>
            <div className="shrink-0">
              <ViewToggle view={view} onViewChange={setView} />
            </div>
          </div>

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
          {!loading && opportunities.length > 0 && view === "grid" && (
            <div className="mt-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {opportunities.map((opp) => (
                  <div key={opp.slug} onClick={() => router.push(`/earn/${opp.slug}`)} className="cursor-pointer">
                    <OpportunityCard opportunity={opp} />
                  </div>
                ))}
              </div>
              <div className="mt-4 text-sm text-center" style={{ color: "var(--text-secondary)" }}>
                Showing {opportunities.length} opportunity{opportunities.length !== 1 ? "ies" : ""}
              </div>
            </div>
          )}

          {/* Table View */}
          {!loading && opportunities.length > 0 && view === "table" && (
            <div className="mt-6">
              <OpportunityTable
                opportunities={opportunities}
                onRowClick={(slug) => router.push(`/earn/${slug}`)}
                page={page}
                onPageChange={setPage}
                pageSize={20}
              />
            </div>
          )}
        </div>
      </div>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </main>
  );
}

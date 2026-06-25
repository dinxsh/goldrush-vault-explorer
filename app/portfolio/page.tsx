"use client";

import { useEffect, useState } from "react";
import { type Portfolio, type PortfolioPosition } from "@/lib/portfolio-database";

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [portfolioId, setPortfolioId] = useState<string | null>(null);

  useEffect(() => {
    // Load portfolio from localStorage
    const savedId = localStorage.getItem("portfolioId");
    if (savedId) {
      setPortfolioId(savedId);
      fetchPortfolio(savedId);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchPortfolio = async (id: string) => {
    try {
      const response = await fetch(`/api/portfolio?id=${id}`);
      if (response.ok) {
        const data = await response.json();
        setPortfolio(data);
      }
    } catch (error) {
      console.error("Failed to fetch portfolio:", error);
    } finally {
      setLoading(false);
    }
  };

  const createNewPortfolio = async () => {
    try {
      const userId = `user_${Date.now()}`;
      const response = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        const newPortfolio = await response.json();
        setPortfolio(newPortfolio);
        setPortfolioId(newPortfolio.id);
        localStorage.setItem("portfolioId", newPortfolio.id);
      }
    } catch (error) {
      console.error("Failed to create portfolio:", error);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center" style={{ background: "var(--bg)" }}>
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4" style={{ borderColor: "var(--border)", borderTopColor: "var(--accent)" }} />
          <p className="mt-4" style={{ color: "var(--text-secondary)" }}>Loading portfolio...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col" style={{ background: "var(--bg)" }}>
      {/* Header */}
      <div className="border-b px-4 py-8 sm:px-6 lg:px-8" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
            My Portfolio
          </h1>
          <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
            Track and manage your vault investments
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {!portfolio ? (
            <div className="text-center py-12">
              <p style={{ color: "var(--text-secondary)" }} className="mb-4">
                No portfolio found. Create one to start tracking investments.
              </p>
              <button
                onClick={createNewPortfolio}
                className="rounded px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-80"
                style={{ background: "var(--accent)", color: "#0f0f0f" }}
              >
                Create Portfolio
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div
                  className="rounded-lg border p-4"
                  style={{ borderColor: "var(--border)", background: "var(--card)" }}
                >
                  <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    Total Value
                  </div>
                  <div className="mt-1 text-2xl font-bold" style={{ color: "var(--accent)" }}>
                    ${portfolio.totalValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                  </div>
                </div>

                <div
                  className="rounded-lg border p-4"
                  style={{ borderColor: "var(--border)", background: "var(--card)" }}
                >
                  <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    Portfolio APY
                  </div>
                  <div className="mt-1 text-2xl font-bold" style={{ color: "var(--accent)" }}>
                    {(portfolio.totalApy * 100).toFixed(2)}%
                  </div>
                </div>

                <div
                  className="rounded-lg border p-4"
                  style={{ borderColor: "var(--border)", background: "var(--card)" }}
                >
                  <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    Positions
                  </div>
                  <div className="mt-1 text-2xl font-bold" style={{ color: "var(--accent)" }}>
                    {portfolio.positions.length}
                  </div>
                </div>
              </div>

              {/* Positions */}
              {portfolio.positions.length > 0 ? (
                <div
                  className="rounded-lg border overflow-hidden"
                  style={{ borderColor: "var(--border)" }}
                >
                  <table className="w-full text-sm">
                    <thead style={{ background: "var(--card)", borderBottomColor: "var(--border)", borderBottomWidth: 1 }}>
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-secondary)" }}>
                          Vault
                        </th>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-secondary)" }}>
                          Amount
                        </th>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-secondary)" }}>
                          Entry APY
                        </th>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-secondary)" }}>
                          % of Portfolio
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {portfolio.positions.map((position, index) => (
                        <tr
                          key={position.id}
                          style={{
                            background: index % 2 === 0 ? "var(--bg)" : "var(--card)",
                            borderBottomColor: "var(--border)",
                            borderBottomWidth: index < portfolio.positions.length - 1 ? 1 : 0,
                          }}
                        >
                          <td className="px-4 py-3" style={{ color: "var(--text-primary)" }}>
                            {position.slug}
                          </td>
                          <td className="px-4 py-3" style={{ color: "var(--text-primary)" }}>
                            ${position.amountUSD.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                          </td>
                          <td className="px-4 py-3" style={{ color: "var(--text-primary)" }}>
                            {(position.entryApyPercent * 100).toFixed(2)}%
                          </td>
                          <td className="px-4 py-3" style={{ color: "var(--accent)" }}>
                            {((position.amountUSD / portfolio.totalValue) * 100).toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p style={{ color: "var(--text-secondary)" }}>
                    No positions in portfolio. Add one from the Earn page.
                  </p>
                </div>
              )}

              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                Last updated: {new Date(portfolio.updatedAt).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

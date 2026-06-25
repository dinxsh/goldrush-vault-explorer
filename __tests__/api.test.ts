// API Integration Tests
// Tests for /api/opportunities endpoints

import { filterOpportunities, sortOpportunities, getStatistics } from "@/lib/complete-vault-database";

describe("API: /api/opportunities", () => {
  describe("Filtering", () => {
    it("should filter by chain", () => {
      const filtered = filterOpportunities({ chain: "eth-mainnet" });
      expect(filtered.every((o) => o.chain === "eth-mainnet")).toBe(true);
    });

    it("should filter by protocol", () => {
      const filtered = filterOpportunities({ protocol: "Aave" });
      expect(filtered.every((o) => o.protocol === "Aave")).toBe(true);
    });

    it("should filter by risk level", () => {
      const filtered = filterOpportunities({ riskLevel: "low" });
      expect(filtered.every((o) => o.riskLevel === "low")).toBe(true);
    });

    it("should filter by APY range", () => {
      const filtered = filterOpportunities({ minApy: 0.05, maxApy: 0.10 });
      expect(filtered.every((o) => !o.apy || (o.apy >= 0.05 && o.apy <= 0.10))).toBe(true);
    });

    it("should search by name", () => {
      const filtered = filterOpportunities({ search: "USDC" });
      expect(filtered.length > 0).toBe(true);
      expect(filtered.some((o) => o.name.includes("USDC") || o.asset === "USDC")).toBe(true);
    });

    it("should combine multiple filters", () => {
      const filtered = filterOpportunities({
        chain: "eth-mainnet",
        protocol: "Morpho",
        riskLevel: "low",
      });
      expect(filtered.every((o) => o.chain === "eth-mainnet" && o.protocol === "Morpho" && o.riskLevel === "low")).toBe(true);
    });
  });

  describe("Sorting", () => {
    it("should sort by APY descending", () => {
      const vaults = filterOpportunities({});
      const sorted = sortOpportunities(vaults, "apy-desc");
      for (let i = 0; i < sorted.length - 1; i++) {
        const curr = sorted[i].apy ?? 0;
        const next = sorted[i + 1].apy ?? 0;
        expect(curr >= next).toBe(true);
      }
    });

    it("should sort by TVL descending", () => {
      const vaults = filterOpportunities({});
      const sorted = sortOpportunities(vaults, "tvl-desc");
      for (let i = 0; i < sorted.length - 1; i++) {
        const curr = sorted[i].tvl ?? 0;
        const next = sorted[i + 1].tvl ?? 0;
        expect(curr >= next).toBe(true);
      }
    });

    it("should sort alphabetically by name", () => {
      const vaults = filterOpportunities({});
      const sorted = sortOpportunities(vaults, "name");
      for (let i = 0; i < sorted.length - 1; i++) {
        expect(sorted[i].name.localeCompare(sorted[i + 1].name) <= 0).toBe(true);
      }
    });
  });

  describe("Statistics", () => {
    it("should calculate correct statistics", () => {
      const stats = getStatistics();
      expect(stats.totalVaults > 0).toBe(true);
      expect(stats.totalTvl > 0).toBe(true);
      expect(stats.avgApy > 0).toBe(true);
      expect(stats.maxApy > 0).toBe(true);
      expect(stats.chains > 0).toBe(true);
      expect(stats.protocols > 0).toBe(true);
    });

    it("should have maxApy >= avgApy", () => {
      const stats = getStatistics();
      expect(stats.maxApy >= stats.avgApy).toBe(true);
    });
  });

  describe("Pagination", () => {
    it("should calculate correct pagination", () => {
      const all = filterOpportunities({});
      const limit = 20;
      const pages = Math.ceil(all.length / limit);
      expect(pages > 0).toBe(true);

      for (let page = 1; page <= pages; page++) {
        const start = (page - 1) * limit;
        const end = start + limit;
        const pageItems = all.slice(start, end);
        expect(pageItems.length > 0).toBe(true);
        expect(pageItems.length <= limit).toBe(true);
      }
    });

    it("should have correct total count", () => {
      const all = filterOpportunities({});
      expect(all.length > 100).toBe(true);
    });
  });

  describe("Error Handling", () => {
    it("should handle invalid APY range", () => {
      // APY > 1 should not match (0.05 = 5%, 1.0 = 100%)
      const filtered = filterOpportunities({ minApy: 0, maxApy: 0.05 });
      expect(filtered.every((o) => !o.apy || o.apy <= 0.05)).toBe(true);
    });

    it("should return empty for non-existent chain", () => {
      const filtered = filterOpportunities({ chain: "fake-chain" as any });
      expect(filtered.length === 0).toBe(true);
    });

    it("should return empty for non-existent protocol", () => {
      const filtered = filterOpportunities({ protocol: "FakeProtocol" });
      expect(filtered.length === 0).toBe(true);
    });
  });
});

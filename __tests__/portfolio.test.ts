// Portfolio Tests
// Tests for portfolio creation, positions, and APY calculations

import {
  createPortfolio,
  getPortfolio,
  addPosition,
  removePosition,
  updatePosition,
  getApyHistory,
  recordApyHistory,
} from "@/lib/portfolio-database";

describe("Portfolio Management", () => {
  describe("Portfolio CRUD", () => {
    it("should create a new portfolio", () => {
      const portfolio = createPortfolio("user_123");
      expect(portfolio).toBeDefined();
      expect(portfolio.userId).toBe("user_123");
      expect(portfolio.positions.length).toBe(0);
      expect(portfolio.totalValue).toBe(0);
      expect(portfolio.totalApy).toBe(0);
    });

    it("should retrieve a portfolio", () => {
      const created = createPortfolio("user_456");
      const retrieved = getPortfolio(created.id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.userId).toBe("user_456");
    });

    it("should return null for non-existent portfolio", () => {
      const retrieved = getPortfolio("fake_id");
      expect(retrieved).toBeNull();
    });
  });

  describe("Position Management", () => {
    it("should add a position to portfolio", () => {
      const portfolio = createPortfolio("user_789");
      const updated = addPosition(portfolio.id, {
        slug: "morpho-steakhouse-usdc-eth",
        amountUSD: 10000,
        entryApyPercent: 0.08,
      });

      expect(updated).toBeDefined();
      expect(updated!.positions.length).toBe(1);
      expect(updated!.totalValue).toBe(10000);
    });

    it("should update a position", () => {
      const portfolio = createPortfolio("user_update");
      const added = addPosition(portfolio.id, {
        slug: "aave-usdc",
        amountUSD: 5000,
        entryApyPercent: 0.05,
      });

      const updated = updatePosition(
        portfolio.id,
        added!.positions[0].id,
        { amountUSD: 7500 }
      );

      expect(updated).toBeDefined();
      expect(updated!.totalValue).toBe(7500);
    });

    it("should remove a position", () => {
      const portfolio = createPortfolio("user_remove");
      const added = addPosition(portfolio.id, {
        slug: "curve-usdc",
        amountUSD: 3000,
        entryApyPercent: 0.03,
      });

      const removed = removePosition(portfolio.id, added!.positions[0].id);

      expect(removed).toBeDefined();
      expect(removed!.positions.length).toBe(0);
      expect(removed!.totalValue).toBe(0);
    });
  });

  describe("APY Calculation", () => {
    it("should calculate weighted portfolio APY", () => {
      const portfolio = createPortfolio("user_apy");

      // Add position 1: $10k at 8% APY
      addPosition(portfolio.id, {
        slug: "vault1",
        amountUSD: 10000,
        entryApyPercent: 0.08,
      });

      // Add position 2: $10k at 6% APY
      const updated = addPosition(getPortfolio(portfolio.id)!.id, {
        slug: "vault2",
        amountUSD: 10000,
        entryApyPercent: 0.06,
      });

      // Expected: (8% * 0.5) + (6% * 0.5) = 7%
      expect(updated!.totalApy).toBeCloseTo(0.07, 2);
    });

    it("should handle single position APY", () => {
      const portfolio = createPortfolio("user_single_apy");
      const updated = addPosition(portfolio.id, {
        slug: "single-vault",
        amountUSD: 5000,
        entryApyPercent: 0.12,
      });

      expect(updated!.totalApy).toBeCloseTo(0.12, 2);
    });

    it("should return 0 APY for empty portfolio", () => {
      const portfolio = createPortfolio("user_empty_apy");
      expect(portfolio.totalApy).toBe(0);
    });
  });

  describe("APY History", () => {
    it("should record APY history", () => {
      const slug = "test-vault-history";
      recordApyHistory(slug, 0.08, 1000000);

      const history = getApyHistory(slug, 30);
      expect(history.length).toBeGreaterThan(0);
      expect(history[0].slug).toBe(slug);
      expect(history[0].apy).toBe(0.08);
    });

    it("should filter by days", () => {
      const slug = "test-vault-days";
      recordApyHistory(slug, 0.05, 500000);

      const history7 = getApyHistory(slug, 7);
      const history30 = getApyHistory(slug, 30);

      expect(history7.length <= history30.length).toBe(true);
    });

    it("should update history for same day", () => {
      const slug = "test-vault-update";
      recordApyHistory(slug, 0.08, 1000000);
      recordApyHistory(slug, 0.09, 1100000); // Update same day

      const history = getApyHistory(slug, 30);
      expect(history.length).toBe(1);
      expect(history[0].apy).toBe(0.09);
    });
  });

  describe("Error Handling", () => {
    it("should handle adding to non-existent portfolio", () => {
      const result = addPosition("fake_id", {
        slug: "vault",
        amountUSD: 1000,
        entryApyPercent: 0.05,
      });

      expect(result).toBeNull();
    });

    it("should handle removing from non-existent portfolio", () => {
      const result = removePosition("fake_id", "fake_pos");
      expect(result).toBeNull();
    });

    it("should handle updating non-existent position", () => {
      const portfolio = createPortfolio("user_error");
      const result = updatePosition(portfolio.id, "fake_pos", {
        amountUSD: 1000,
      });

      expect(result).toBeNull();
    });
  });
});

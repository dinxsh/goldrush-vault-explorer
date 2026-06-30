// APY-window analytics tests
// Verifies the trailing-window annualized-yield math used by the vault charts
// and "Current APY by Window" cards.

import {
  annualize,
  apySeriesForWindow,
  currentApyByWindow,
  apySeriesByWindow,
  APY_WINDOWS,
  type PricePoint,
} from "@/lib/apy-windows";

// Build a daily price series of `n` days that grows by `dailyRate` each day,
// ending today. Returns oldest → newest.
function growingSeries(n: number, startPrice: number, dailyRate: number): PricePoint[] {
  const out: PricePoint[] = [];
  let price = startPrice;
  const today = Date.UTC(2026, 5, 30); // fixed reference so tests are deterministic
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today - i * 24 * 60 * 60 * 1000);
    out.push({ date: d.toISOString().slice(0, 10), price });
    price = price * (1 + dailyRate);
  }
  return out;
}

describe("annualize", () => {
  it("annualizes a one-day return with the 365 exponent", () => {
    // 0.05% in a day → (1.0005)^365 - 1 ≈ 0.2002 (20%)
    const apy = annualize(1, 1.0005, 1);
    expect(apy).not.toBeNull();
    expect(apy!).toBeCloseTo(Math.pow(1.0005, 365) - 1, 6);
  });

  it("returns the raw return when the window is exactly a year", () => {
    expect(annualize(100, 110, 365)).toBeCloseTo(0.1, 9);
  });

  it("rejects non-positive prices and elapsed times", () => {
    expect(annualize(0, 100, 30)).toBeNull();
    expect(annualize(100, 0, 30)).toBeNull();
    expect(annualize(100, 110, 0)).toBeNull();
    expect(annualize(100, 110, -5)).toBeNull();
  });

  it("drops degenerate outliers instead of returning Infinity-scale APY", () => {
    // Doubling in a single day annualizes to an astronomically large number.
    expect(annualize(1, 2, 1)).toBeNull();
  });
});

describe("apySeriesForWindow", () => {
  it("returns empty for fewer than two points", () => {
    expect(apySeriesForWindow([], 7)).toEqual([]);
    expect(apySeriesForWindow([{ date: "2026-06-30", price: 1 }], 7)).toEqual([]);
  });

  it("recovers a known constant APY from a steadily growing series", () => {
    const dailyRate = 0.0008; // ~33.6% annualized
    const expectedApy = Math.pow(1 + dailyRate, 365) - 1;
    const prices = growingSeries(60, 1, dailyRate);

    const series = apySeriesForWindow(prices, 30);
    expect(series.length).toBeGreaterThan(0);
    for (const p of series) {
      expect(p.apy).toBeCloseTo(expectedApy, 4);
    }
  });

  it("starts later for longer windows (needs more history)", () => {
    const prices = growingSeries(40, 1, 0.0005);
    const short = apySeriesForWindow(prices, 3);
    const long = apySeriesForWindow(prices, 30);
    // The 30d window can't produce a reading until enough days have elapsed,
    // so it yields strictly fewer points than the 3d window.
    expect(long.length).toBeLessThan(short.length);
    expect(short.length).toBeGreaterThan(0);
  });

  it("requires the look-back to span at least half the window", () => {
    // Two points only 1 day apart can't satisfy a 30d window.
    const prices: PricePoint[] = [
      { date: "2026-06-29", price: 1 },
      { date: "2026-06-30", price: 1.001 },
    ];
    expect(apySeriesForWindow(prices, 30)).toEqual([]);
  });
});

describe("currentApyByWindow", () => {
  it("produces a value for every defined window when history is long enough", () => {
    const prices = growingSeries(120, 1, 0.0006);
    const current = currentApyByWindow(prices);
    for (const w of APY_WINDOWS) {
      expect(current[w.key]).not.toBeNull();
      expect(current[w.key]!).toBeCloseTo(Math.pow(1.0006, 365) - 1, 3);
    }
  });

  it("returns null for windows with insufficient history", () => {
    const prices = growingSeries(5, 1, 0.0006); // only 5 days
    const current = currentApyByWindow(prices);
    expect(current["3d"]).not.toBeNull();
    expect(current["90d"]).toBeNull();
  });
});

describe("apySeriesByWindow", () => {
  it("returns a keyed series for each window", () => {
    const prices = growingSeries(100, 1, 0.0005);
    const byWindow = apySeriesByWindow(prices);
    expect(Object.keys(byWindow).sort()).toEqual(APY_WINDOWS.map((w) => w.key).sort());
    expect(Array.isArray(byWindow["7d"])).toBe(true);
  });
});

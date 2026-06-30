// APY-window analytics
//
// Derives trailing-window annualized yield from a REAL share-price series (the
// vault share token's historical USD price from GoldRush). No synthetic data:
// every number here is a transform of observed on-chain-priced points, in line
// with the project's strict live-only data policy.
//
// A yield vault's share token appreciates as the strategy accrues yield, so the
// annualized growth of its price over a trailing window IS the realized APY for
// that window. Short windows react fast (and are noisier); long windows are
// smooth but lag — exactly the multi-window behavior we chart.

export interface PricePoint {
  /** ISO date (YYYY-MM-DD) of the observation. */
  date: string;
  /** USD value of one vault share at that date. */
  price: number;
}

export interface ApyWindow {
  key: string;
  label: string;
  /** Trailing look-back length in days. */
  days: number;
  /** Line/badge color for this window. */
  color: string;
}

// Day-scale windows. Intraday (5m–6h) sampling isn't available from GoldRush's
// daily pricing, so under the live-only policy we use the real daily cadence and
// scale the windows to match — same design, honest data.
export const APY_WINDOWS: ApyWindow[] = [
  { key: "1d", label: "1d", days: 1, color: "#3b82f6" },
  { key: "3d", label: "3d", days: 3, color: "#22c55e" },
  { key: "7d", label: "7d", days: 7, color: "#f59e0b" },
  { key: "14d", label: "14d", days: 14, color: "#ef4444" },
  { key: "30d", label: "30d", days: 30, color: "#a855f7" },
  { key: "60d", label: "60d", days: 60, color: "#06b6d4" },
  { key: "90d", label: "90d", days: 90, color: "#ec4899" },
];

const MS_PER_DAY = 24 * 60 * 60 * 1000;
// Guard against degenerate data (a single bad print annualizes to absurd values).
// Treat anything past 10,000% as an outlier and drop it rather than display it.
const MAX_ABS_APY = 100;

function dayMs(date: string): number {
  return new Date(`${date}T00:00:00Z`).getTime();
}

/**
 * Annualize a realized return observed over `elapsedDays`.
 * apy = (priceEnd / priceStart) ^ (365 / elapsedDays) − 1
 */
export function annualize(priceStart: number, priceEnd: number, elapsedDays: number): number | null {
  if (!(priceStart > 0) || !(priceEnd > 0) || !(elapsedDays > 0)) return null;
  const apy = Math.pow(priceEnd / priceStart, 365 / elapsedDays) - 1;
  if (!Number.isFinite(apy) || Math.abs(apy) > MAX_ABS_APY) return null;
  return apy;
}

export interface ApyPoint {
  date: string;
  /** Annualized APY as a fraction (0.32 = 32%). */
  apy: number;
}

/**
 * Trailing-window annualized APY at every point that has enough history behind
 * it. For point i it pairs with the most recent earlier point at least
 * `windowDays` back, so the line naturally starts later for longer windows.
 * Input is assumed sorted oldest → newest.
 */
export function apySeriesForWindow(prices: PricePoint[], windowDays: number): ApyPoint[] {
  const out: ApyPoint[] = [];
  if (prices.length < 2 || windowDays <= 0) return out;

  let start = 0; // sliding lower bound — series is monotonic in time
  for (let i = 1; i < prices.length; i++) {
    const tEnd = dayMs(prices[i].date);
    const cutoff = tEnd - windowDays * MS_PER_DAY;
    // Advance `start` to the last point whose date is <= cutoff.
    while (start + 1 < i && dayMs(prices[start + 1].date) <= cutoff) start++;

    const base = prices[start];
    const elapsedDays = (tEnd - dayMs(base.date)) / MS_PER_DAY;
    // Require the look-back to actually span (most of) the window before we
    // annualize — otherwise a 1-day gap masquerades as a 90d reading.
    if (elapsedDays < windowDays * 0.5) continue;

    const apy = annualize(base.price, prices[i].price, elapsedDays);
    if (apy !== null) out.push({ date: prices[i].date, apy });
  }
  return out;
}

/** Latest trailing-window APY for each window, or null when history is too short. */
export function currentApyByWindow(prices: PricePoint[]): Record<string, number | null> {
  const result: Record<string, number | null> = {};
  for (const w of APY_WINDOWS) {
    const series = apySeriesForWindow(prices, w.days);
    result[w.key] = series.length ? series[series.length - 1].apy : null;
  }
  return result;
}

/** APY-over-time series for every window, keyed by window. */
export function apySeriesByWindow(prices: PricePoint[]): Record<string, ApyPoint[]> {
  const result: Record<string, ApyPoint[]> = {};
  for (const w of APY_WINDOWS) {
    result[w.key] = apySeriesForWindow(prices, w.days);
  }
  return result;
}

import { GoldRushClient } from "@covalenthq/client-sdk";

let _client: GoldRushClient | null = null;

export function getGoldRushClient(): GoldRushClient {
    if (!_client) {
        const apiKey = process.env.GOLDRUSH_API_KEY;
        if (!apiKey) {
            throw new Error("GOLDRUSH_API_KEY environment variable is not set");
        }
        _client = new GoldRushClient(apiKey);
    }
    return _client;
}

// ─── Pricing + token metadata ───────────────────────────────────────────────

export interface TokenData {
    price: number | null; // latest USD spot price
    prev: number | null; // ~24h-ago USD price, for 24h change
    name: string | null;
    symbol: string | null;
    decimals: number | null;
    logoUrl: string | null;
}

const priceCache = new Map<string, { data: TokenData; ts: number }>();
const PRICE_TTL = 5 * 60 * 1000;

// Fetch USD price (+ a 24h-prior price) and token identity for a set of tokens in a
// single GoldRush call. The pricing endpoint accepts a comma-separated address list
// and returns name/ticker/decimals/logo alongside prices, so it doubles as our token
// metadata source - one round-trip covers an entire vault's worth of tokens.
export async function getTokenData(chain: string, addresses: string[]): Promise<Map<string, TokenData>> {
    const out = new Map<string, TokenData>();

    const unique = [...new Set(addresses.map((a) => a.toLowerCase()))].filter((a) => /^0x[0-9a-f]{40}$/.test(a));
    if (unique.length === 0) return out;

    // Serve cached tokens, collect the rest for a batched fetch.
    const now = Date.now();
    const toFetch: string[] = [];
    for (const a of unique) {
        const c = priceCache.get(`${chain}:${a}`);
        if (c && now - c.ts < PRICE_TTL) out.set(a, c.data);
        else toFetch.push(a);
    }
    if (toFetch.length === 0) return out;

    const apiKey = (process.env.GOLDRUSH_API_KEY ?? "").trim();
    if (!apiKey) return out;

    // Pull ~8 days so there's always a non-null entry ~24h back for the change column.
    const to = new Date();
    const from = new Date(to.getTime() - 8 * 24 * 60 * 60 * 1000);
    const fmt = (d: Date) => d.toISOString().slice(0, 10);
    const url = `https://api.covalenthq.com/v1/pricing/historical_by_addresses_v2/${chain}/USD/${toFetch.join(
        ","
    )}/?key=${apiKey}&from=${fmt(from)}&to=${fmt(to)}`;

    try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 10000);
        const resp = await fetch(url, { signal: controller.signal });
        clearTimeout(timer);

        const json = (await resp.json()) as {
            error?: boolean;
            data?: Array<{
                contract_address?: string;
                contract_name?: string;
                contract_ticker_symbol?: string;
                contract_decimals?: number;
                logo_urls?: { token_logo_url?: string };
                prices?: Array<{
                    price?: number | null;
                    contract_metadata?: {
                        contract_name?: string;
                        contract_ticker_symbol?: string;
                        contract_decimals?: number;
                        logo_url?: string;
                    };
                }>;
            }>;
        };

        if (!json.error && Array.isArray(json.data)) {
            for (const row of json.data) {
                const addr = (row.contract_address ?? "").toLowerCase();
                if (!addr) continue;

                const prices = Array.isArray(row.prices) ? row.prices : [];
                // Prices come back newest-first; take the two most-recent non-null entries.
                let price: number | null = null;
                let prev: number | null = null;
                for (const p of prices) {
                    if (p?.price == null) continue;
                    if (price === null) price = p.price;
                    else {
                        prev = p.price;
                        break;
                    }
                }

                const meta = prices[0]?.contract_metadata ?? {};
                const data: TokenData = {
                    price,
                    prev,
                    name: row.contract_name ?? meta.contract_name ?? null,
                    symbol: row.contract_ticker_symbol ?? meta.contract_ticker_symbol ?? null,
                    decimals: row.contract_decimals ?? meta.contract_decimals ?? null,
                    logoUrl: row.logo_urls?.token_logo_url ?? meta.logo_url ?? null,
                };
                out.set(addr, data);
                priceCache.set(`${chain}:${addr}`, { data, ts: now });
            }
        }
    } catch {
        // pricing unavailable - callers handle null prices gracefully
    }

    return out;
}

// ─── Historical price series ──────────────────────────────────────────────────

export interface PriceSeriesPoint {
    date: string; // YYYY-MM-DD
    price: number; // USD
}

const seriesCache = new Map<string, { points: PriceSeriesPoint[]; ts: number }>();
const SERIES_TTL = 30 * 60 * 1000; // daily data only changes once a day

// Fetch a token's daily USD price for the last `days` days from GoldRush's
// historical pricing endpoint. Used to chart a vault share token's value over
// time and to derive trailing-window APY — all from real, observed prices (no
// synthetic fallback, per the live-only policy). Returns oldest → newest, with
// any null prints dropped. Empty array means GoldRush has no price history for
// this token, which callers surface as an honest "no data" state.
export async function getPriceSeries(chain: string, address: string, days = 90): Promise<PriceSeriesPoint[]> {
    const addr = address.toLowerCase();
    if (!/^0x[0-9a-f]{40}$/.test(addr)) return [];

    const span = Math.min(Math.max(days, 1), 365);
    const cacheKey = `${chain}:${addr}:${span}`;
    const now = Date.now();
    const cached = seriesCache.get(cacheKey);
    if (cached && now - cached.ts < SERIES_TTL) return cached.points;

    const apiKey = (process.env.GOLDRUSH_API_KEY ?? "").trim();
    if (!apiKey) return [];

    const to = new Date(now);
    const from = new Date(now - span * 24 * 60 * 60 * 1000);
    const fmt = (d: Date) => d.toISOString().slice(0, 10);
    const url = `https://api.covalenthq.com/v1/pricing/historical_by_addresses_v2/${chain}/USD/${addr}/?key=${apiKey}&from=${fmt(
        from
    )}&to=${fmt(to)}`;

    try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 10000);
        const resp = await fetch(url, { signal: controller.signal });
        clearTimeout(timer);

        const json = (await resp.json()) as {
            error?: boolean;
            data?: Array<{ prices?: Array<{ date?: string; price?: number | null }> }>;
        };

        if (json.error || !Array.isArray(json.data) || !json.data[0]?.prices) return [];

        const points: PriceSeriesPoint[] = json.data[0]
            .prices!.filter((p): p is { date: string; price: number } => typeof p?.date === "string" && p?.price != null)
            .map((p) => ({ date: p.date, price: p.price }))
            // GoldRush returns newest-first; chart math expects oldest → newest.
            .sort((a, b) => a.date.localeCompare(b.date));

        seriesCache.set(cacheKey, { points, ts: now });
        return points;
    } catch {
        return [];
    }
}

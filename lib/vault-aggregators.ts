// Live vault aggregators
//
// Enumerates the full vault universe from each protocol's public API so the
// explorer competes with vaults.fyi on breadth. Every APY/TVL here is live from
// the source protocol (Morpho GraphQL, Yearn ydaemon) — no synthetic data, in
// line with the strict live-only policy. When a source is unreachable we simply
// return fewer vaults; we never fabricate.
//
// Auto-discovered vaults carry minimal metadata (name, asset, live APY/TVL,
// inferred risk). Their detail pages still get the full on-chain decomposition
// via /api/opportunities/[slug], same as curated vaults.

import { type Opportunity } from "@/types/opportunity";
import { type SupportedChain } from "@/types/vault";

// ─── Chain maps ───────────────────────────────────────────────────────────────

// Numeric chain id → our SupportedChain (only chains both we and the sources support).
const CHAIN_BY_ID: Record<number, SupportedChain> = {
  1: "eth-mainnet",
  10: "optimism-mainnet",
  137: "matic-mainnet",
  8453: "base-mainnet",
  42161: "arbitrum-mainnet",
};

// SupportedChain → short slug token (stable, hyphen-free) used in aggregated slugs.
const CHAIN_KEY: Record<SupportedChain, string> = {
  "eth-mainnet": "eth",
  "base-mainnet": "base",
  "matic-mainnet": "polygon",
  "arbitrum-mainnet": "arbitrum",
  "optimism-mainnet": "optimism",
  "bsc-mainnet": "bsc",
  "avalanche-mainnet": "avalanche",
};
const CHAIN_BY_KEY: Record<string, SupportedChain> = Object.fromEntries(
  Object.entries(CHAIN_KEY).map(([chain, key]) => [key, chain as SupportedChain])
) as Record<string, SupportedChain>;

const MORPHO_CHAIN_IDS = [1, 10, 137, 8453, 42161];
const YEARN_CHAIN_IDS = [1, 10, 137, 8453, 42161];

// SupportedChain → numeric id (inverse of CHAIN_BY_ID), for the Morpho API.
const CHAIN_ID_BY_CHAIN: Partial<Record<SupportedChain, number>> = Object.fromEntries(
  Object.entries(CHAIN_BY_ID).map(([id, chain]) => [chain, Number(id)])
) as Partial<Record<SupportedChain, number>>;

// Only surface vaults with at least this much TVL — filters out the long tail of
// dust / test / spam vaults the APIs also return.
const MIN_TVL_USD = 100_000;

// Sanity bounds on APY. The protocol APIs include spam/scam vaults that report
// manipulated yields (thousands of percent); no legitimate vault sustains >100%,
// so anything outside this band is dropped to keep the list credible.
const MAX_APY = 1.0; // 100%
const MIN_APY = -0.5; // -50% (guards against bad prints)

function apyInRange(apy: number): boolean {
  return Number.isFinite(apy) && apy <= MAX_APY && apy >= MIN_APY;
}

// ─── Slug encode / decode ───────────────────────────────────────────────────

// Aggregated slug: `<protocol>-<0xaddress>-<chainkey>` (e.g. morpho-0xabc…-eth).
// Self-describing so a detail page can resolve address + chain without the cache.
export function aggregatedSlug(protocol: string, address: string, chain: SupportedChain): string {
  return `${protocol.toLowerCase()}-${address.toLowerCase()}-${CHAIN_KEY[chain]}`;
}

const AGG_SLUG_RE = /^([a-z0-9]+)-(0x[0-9a-f]{40})-([a-z]+)$/;

export function parseAggregatedSlug(
  slug: string
): { protocol: string; address: string; chain: SupportedChain } | null {
  const m = slug.toLowerCase().match(AGG_SLUG_RE);
  if (!m) return null;
  const chain = CHAIN_BY_KEY[m[3]];
  if (!chain) return null;
  return { protocol: m[1], address: m[2], chain };
}

// ─── Live risk inference ──────────────────────────────────────────────────────

// Auto-discovered vaults have no hand-written risk review, so infer a band from
// protocol maturity and TVL depth (deeper TVL = more battle-tested / liquid).
function inferRisk(protocol: string, tvl: number): "low" | "medium" | "high" {
  const base: Record<string, number> = { Aave: 1, Compound: 1, Morpho: 2, Euler: 2, Yearn: 2 };
  const tvlRisk = tvl < 1_000_000 ? 2 : tvl < 10_000_000 ? 1 : 0;
  const total = (base[protocol] ?? 2) + tvlRisk;
  if (total <= 1) return "low";
  if (total <= 3) return "medium";
  return "high";
}

function toOpportunity(args: {
  protocol: "Morpho" | "Yearn";
  address: string;
  chain: SupportedChain;
  name: string;
  asset: string;
  apy: number;
  tvl: number;
}): Opportunity {
  const { protocol, address, chain, name, asset, apy, tvl } = args;
  return {
    slug: aggregatedSlug(protocol, address, chain),
    name,
    description: `Auto-discovered ${protocol} vault denominated in ${asset}. Live APY and TVL sourced from ${protocol}; full position breakdown available via on-chain decomposition.`,
    vaultAddress: address,
    chain,
    protocol,
    asset,
    riskLevel: inferRisk(protocol, tvl),
    riskFactors: [
      "Auto-listed vault — risk band is inferred from protocol and TVL, not a manual review.",
      "Always verify the strategy and audits on the protocol's own site before depositing.",
    ],
    highlights: [`${asset} vault on ${protocol}`, "Live on-chain metrics"],
    apy,
    tvl,
  };
}

// ─── Morpho (MetaMorpho vaults via GraphQL) ─────────────────────────────────

interface MorphoVaultItem {
  address: string;
  name: string;
  asset: { symbol: string | null } | null;
  chain: { id: number } | null;
  state: { netApy: number | null; totalAssetsUsd: number | null } | null;
}

async function getMorphoVaults(): Promise<Opportunity[]> {
  const query = `{
    vaults(first: 1000, orderBy: TotalAssetsUsd, orderDirection: Desc, where: { chainId_in: [${MORPHO_CHAIN_IDS.join(
      ","
    )}], totalAssetsUsd_gte: ${MIN_TVL_USD} }) {
      items { address name asset { symbol } chain { id } state { netApy totalAssetsUsd } }
    }
  }`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const resp = await fetch("https://blue-api.morpho.org/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
      signal: controller.signal,
    });
    const json = (await resp.json()) as { data?: { vaults?: { items?: MorphoVaultItem[] } } };
    const items = json.data?.vaults?.items ?? [];

    const out: Opportunity[] = [];
    for (const v of items) {
      const chain = v.chain ? CHAIN_BY_ID[v.chain.id] : undefined;
      const tvl = v.state?.totalAssetsUsd ?? null;
      const apy = v.state?.netApy ?? null;
      if (!chain || tvl == null || apy == null || tvl < MIN_TVL_USD) continue;
      if (!apyInRange(apy)) continue;
      if (!/^0x[0-9a-fA-F]{40}$/.test(v.address)) continue;
      out.push(
        toOpportunity({
          protocol: "Morpho",
          address: v.address,
          chain,
          name: v.name || "Morpho Vault",
          asset: v.asset?.symbol ?? "—",
          apy,
          tvl,
        })
      );
    }
    return out;
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

// ─── Yearn (all vaults via ydaemon) ──────────────────────────────────────────

interface YearnVaultItem {
  address: string;
  name: string;
  chainID: number;
  token?: { symbol?: string };
  tvl?: { tvl?: number };
  apr?: { netAPR?: number | null; forwardAPR?: { netAPR?: number | null } };
}

async function getYearnVaultsForChain(chainId: number): Promise<Opportunity[]> {
  const chain = CHAIN_BY_ID[chainId];
  if (!chain) return [];
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const resp = await fetch(`https://ydaemon.yearn.fi/${chainId}/vaults/all`, { signal: controller.signal });
    const items = (await resp.json()) as YearnVaultItem[];
    if (!Array.isArray(items)) return [];

    const out: Opportunity[] = [];
    for (const v of items) {
      const tvl = v.tvl?.tvl ?? null;
      const apy = v.apr?.netAPR ?? v.apr?.forwardAPR?.netAPR ?? null;
      if (tvl == null || tvl < MIN_TVL_USD || apy == null) continue;
      if (!apyInRange(apy)) continue;
      if (!/^0x[0-9a-fA-F]{40}$/.test(v.address)) continue;
      out.push(
        toOpportunity({
          protocol: "Yearn",
          address: v.address,
          chain,
          name: v.name || "Yearn Vault",
          asset: v.token?.symbol ?? "—",
          apy,
          tvl,
        })
      );
    }
    return out;
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

async function getYearnVaults(): Promise<Opportunity[]> {
  const results = await Promise.all(YEARN_CHAIN_IDS.map(getYearnVaultsForChain));
  return results.flat();
}

// ─── Aggregate + cache ────────────────────────────────────────────────────────

let cache: { vaults: Opportunity[]; ts: number } | null = null;
const TTL = 30 * 60 * 1000;

export async function getAggregatedVaults(): Promise<Opportunity[]> {
  if (cache && Date.now() - cache.ts < TTL) return cache.vaults;

  const [morpho, yearn] = await Promise.all([getMorphoVaults(), getYearnVaults()]);
  const merged = [...morpho, ...yearn];

  // De-dupe by chain+address (a vault can surface from more than one source).
  const seen = new Set<string>();
  const vaults: Opportunity[] = [];
  for (const v of merged) {
    const key = `${v.chain}:${v.vaultAddress.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    vaults.push(v);
  }

  // Only overwrite the cache when we actually got data — a transient API outage
  // shouldn't blow away a good cache and leave the list empty.
  if (vaults.length > 0 || !cache) cache = { vaults, ts: Date.now() };
  return cache!.vaults;
}

// Resolve an aggregated vault by slug — from cache, falling back to a minimal
// record reconstructed from the self-describing slug (so detail pages work even
// on a cold cache).
export async function findAggregatedBySlug(slug: string): Promise<Opportunity | null> {
  const parsed = parseAggregatedSlug(slug);
  if (!parsed) return null;

  const all = await getAggregatedVaults();
  const hit = all.find((v) => v.slug === slug);
  if (hit) return hit;

  // Cache miss (e.g. the vault dropped below the list's TVL floor, or the cache
  // refreshed). Fetch this single vault's live metrics directly so the detail
  // page shows real APY/TVL rather than zeros.
  const single =
    parsed.protocol === "yearn"
      ? await fetchSingleYearnVault(parsed.address, parsed.chain)
      : await fetchSingleMorphoVault(parsed.address, parsed.chain);
  if (single) return single;

  // Truly unresolvable — apy null signals "no live data" so the detail route
  // surfaces an honest error rather than a fake 0%.
  const protocolName = parsed.protocol.charAt(0).toUpperCase() + parsed.protocol.slice(1);
  return {
    ...toOpportunity({
      protocol: (protocolName === "Yearn" ? "Yearn" : "Morpho") as "Morpho" | "Yearn",
      address: parsed.address,
      chain: parsed.chain,
      name: `${protocolName} Vault`,
      asset: "—",
      apy: 0,
      tvl: 0,
    }),
    apy: null,
  };
}

// Single-vault live lookups, used when a detail page is hit for a vault not in
// the current aggregated cache.
async function fetchSingleMorphoVault(address: string, chain: SupportedChain): Promise<Opportunity | null> {
  const chainId = CHAIN_ID_BY_CHAIN[chain];
  if (!chainId) return null;
  const query = `{ vaultByAddress(address: "${address.toLowerCase()}", chainId: ${chainId}) { name asset { symbol } state { netApy totalAssetsUsd } } }`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const resp = await fetch("https://blue-api.morpho.org/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
      signal: controller.signal,
    });
    const json = (await resp.json()) as {
      data?: { vaultByAddress?: { name?: string; asset?: { symbol?: string }; state?: { netApy?: number | null; totalAssetsUsd?: number | null } } };
    };
    const v = json.data?.vaultByAddress;
    if (!v?.state || v.state.netApy == null || v.state.totalAssetsUsd == null) return null;
    return toOpportunity({
      protocol: "Morpho",
      address,
      chain,
      name: v.name || "Morpho Vault",
      asset: v.asset?.symbol ?? "—",
      apy: v.state.netApy,
      tvl: v.state.totalAssetsUsd,
    });
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchSingleYearnVault(address: string, chain: SupportedChain): Promise<Opportunity | null> {
  const chainId = CHAIN_ID_BY_CHAIN[chain];
  if (!chainId) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const resp = await fetch(`https://ydaemon.yearn.fi/${chainId}/vaults/${address.toLowerCase()}`, { signal: controller.signal });
    if (!resp.ok) return null;
    const v = (await resp.json()) as YearnVaultItem;
    const tvl = v?.tvl?.tvl ?? null;
    const apy = v?.apr?.netAPR ?? v?.apr?.forwardAPR?.netAPR ?? null;
    if (tvl == null || apy == null) return null;
    return toOpportunity({
      protocol: "Yearn",
      address,
      chain,
      name: v.name || "Yearn Vault",
      asset: v.token?.symbol ?? "—",
      apy,
      tvl,
    });
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// ─── Morpho historical share-price series (for charts) ────────────────────────

interface MorphoSeriesPoint {
  date: string; // YYYY-MM-DD
  price: number; // USD value of one share
}

// Daily USD share-price history for a Morpho vault, straight from the Morpho API.
// This is real observed data — it lets the charts and trailing-window APY work
// for Morpho vaults even when GoldRush has no pricing for the share token.
// Returns [] for non-Morpho addresses (the API returns null), so callers can
// fall back to GoldRush pricing.
export async function getMorphoSharePriceSeries(
  chain: SupportedChain,
  address: string,
  days = 90
): Promise<MorphoSeriesPoint[]> {
  const chainId = CHAIN_ID_BY_CHAIN[chain];
  if (!chainId || !/^0x[0-9a-fA-F]{40}$/.test(address)) return [];

  const startTimestamp = Math.floor(Date.now() / 1000) - days * 86400;
  const query = `{
    vaultByAddress(address: "${address.toLowerCase()}", chainId: ${chainId}) {
      historicalState {
        sharePriceUsd(options: { interval: DAY, startTimestamp: ${startTimestamp} }) { x y }
      }
    }
  }`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const resp = await fetch("https://blue-api.morpho.org/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
      signal: controller.signal,
    });
    const json = (await resp.json()) as {
      data?: { vaultByAddress?: { historicalState?: { sharePriceUsd?: { x: number; y: number }[] } } };
    };
    const points = json.data?.vaultByAddress?.historicalState?.sharePriceUsd ?? [];
    return points
      .filter((p) => p && p.y > 0 && Number.isFinite(p.x))
      .map((p) => ({ date: new Date(p.x * 1000).toISOString().slice(0, 10), price: p.y }))
      .sort((a, b) => a.date.localeCompare(b.date));
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

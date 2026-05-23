import { getGoldRushClient } from "./goldrush";
import { vaultAsset, vaultTotalAssets, tokenDecimals, tokenSymbol, tokenName, vaultConvertToAssets } from "./rpc";
import { type SupportedChain, type VaultNode } from "@/types/vault";
import { type Chain } from "@covalenthq/client-sdk";

// ─── Caches ───────────────────────────────────────────────────────────────────

const holdingsCache = new Map<string, { nodes: VaultNode[]; ts: number }>();
const HOLDINGS_TTL = 2 * 60 * 1000;

const priceCache = new Map<string, { price: number | null; ts: number }>();
const PRICE_TTL = 5 * 60 * 1000;

// ─── Chain helpers ────────────────────────────────────────────────────────────

const CHAIN_IDS: Record<SupportedChain, number> = {
    "eth-mainnet": 1,
    "base-mainnet": 8453,
    "matic-mainnet": 137,
    "arbitrum-mainnet": 42161,
    "optimism-mainnet": 10,
    "bsc-mainnet": 56,
};

// Tokens with stable $1 peg — skip the pricing API round-trip
const STABLECOINS = new Set([
    "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // USDC eth
    "0xdac17f958d2ee523a2206206994597c13d831ec7", // USDT eth
    "0x6b175474e89094c44da98b954eedeac495271d0f", // DAI eth
    "0x853d955acef822db058eb8505911ed77f175b99e", // FRAX eth
    "0x83f20f44975d03b1b09e64809b757c47f942beea", // sDAI eth
    "0x0000000000085d4780b73119b644ae5ecd22b376", // TUSD eth
    "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913", // USDC base
    "0x50c5725949a6f0c72e6c4a641f24049a917db0cb", // DAI base
    "0xd9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca", // USDbC base
    "0xaf88d065e77c8cc2239327c5edb3a432268e5831", // USDC arbitrum
    "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9", // USDT arbitrum
    "0x0b2c639c533813f4aa9d7837caf62653d097ff85", // USDC optimism
    "0x94b008aa00579c1307b0ef2c499ad98a8ce58e58", // USDT optimism
    "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d", // USDC bsc
]);

// ─── Utilities ────────────────────────────────────────────────────────────────

function tokenLogoUrl(chain: SupportedChain, address: string): string {
    return `https://logos.covalenthq.com/tokens/${CHAIN_IDS[chain]}/${address.toLowerCase()}.png`;
}

function formatBigBalance(raw: bigint, decimals: number): string {
    const divisor = BigInt("1" + "0".repeat(decimals));
    const whole = raw / divisor;
    const frac = raw % divisor;
    const wholeNum = Number(whole);
    if (wholeNum >= 1_000_000_000) return `${(wholeNum / 1_000_000_000).toFixed(2)}B`;
    if (wholeNum >= 1_000_000) return `${(wholeNum / 1_000_000).toFixed(2)}M`;
    const fracStr = frac.toString().padStart(decimals, "0").replace(/0+$/, "");
    const maxDec = wholeNum < 1 ? 6 : wholeNum < 1000 ? 4 : 2;
    return `${wholeNum.toLocaleString("en-US")}${fracStr.slice(0, maxDec) ? `.${fracStr.slice(0, maxDec)}` : ""}`;
}

function bigIntToFloat(raw: bigint, decimals: number): number {
    const divisor = BigInt("1" + "0".repeat(decimals));
    return Number(raw / divisor) + Number(raw % divisor) / Math.pow(10, decimals);
}

function detectProtocol(name: string | null, ticker?: string | null): string | null {
    const haystack = `${name ?? ""} ${ticker ?? ""}`.toLowerCase();
    if (!haystack.trim()) return null;
    if (haystack.includes("morpho")) return "Morpho";
    if (haystack.includes("compound") || haystack.includes("comet")) return "Compound";
    if (haystack.includes("euler")) return "Euler";
    if (haystack.includes("aave")) return "Aave";
    if (haystack.includes("yearn") || haystack.includes(" yv") || (ticker ?? "").startsWith("yv")) return "Yearn";
    if (haystack.includes("convex")) return "Convex";
    if (haystack.includes("curve")) return "Curve";
    if (haystack.includes("pendle")) return "Pendle";
    if (haystack.includes("moonwell")) return "Moonwell";
    if (haystack.includes("steakhouse") || (ticker ?? "").toLowerCase().startsWith("steak")) return "Morpho";
    if (haystack.includes("gauntlet") || /\bgt[a-z]/.test((ticker ?? "").toLowerCase())) return "Morpho";
    if (haystack.includes("re7")) return "Morpho";
    if (haystack.includes("spark") || haystack.includes("sky")) return "Spark";
    if (haystack.includes("fluid")) return "Fluid";
    return null;
}

// ─── Price lookup ─────────────────────────────────────────────────────────────

async function getTokenPrice(chain: SupportedChain, tokenAddress: string): Promise<number | null> {
    const lower = tokenAddress.toLowerCase();
    if (STABLECOINS.has(lower)) return 1.0;

    const key = `${chain}:${lower}`;
    const cached = priceCache.get(key);
    if (cached && Date.now() - cached.ts < PRICE_TTL) return cached.price;

    let price: number | null = null;
    try {
        const apiKey = (process.env.GOLDRUSH_API_KEY ?? "").trim();
        if (!apiKey) throw new Error("no api key");

        // Use REST API directly — SDK maps the response field as "prices" not "items"
        // Use yesterday as 'to' since today's price entry is often null
        const toDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const fromDate = new Date(toDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        const fmt = (d: Date) => d.toISOString().slice(0, 10);
        // pricesAtAsc is not a valid param — prices come back in ascending order;
        // scan from the end to get the most recent non-null price
        const url = `https://api.covalenthq.com/v1/pricing/historical_by_addresses_v2/${chain}/USD/${tokenAddress}/?key=${apiKey}&from=${fmt(fromDate)}&to=${fmt(toDate)}`;

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 5000);
        const resp = await fetch(url, { signal: controller.signal });
        clearTimeout(timer);

        const json = (await resp.json()) as {
            data?: Array<{ prices?: Array<{ price?: number | null }> }>;
            error?: boolean;
        };

        if (!json.error && json.data?.[0]?.prices) {
            const prices = json.data[0].prices;
            for (let i = prices.length - 1; i >= 0; i--) {
                if (prices[i]?.price != null) {
                    price = prices[i].price!;
                    break;
                }
            }
        }
    } catch {
        // pricing unavailable — leave null
    }

    priceCache.set(key, { price, ts: Date.now() });
    return price;
}

// ─── On-chain ERC-4626 decomposition ─────────────────────────────────────────

// Build a VaultNode for an ERC-4626 vault using on-chain data.
// vaultAddress  = the vault contract
// assetAddr     = result of vault.asset() — already resolved by caller
// depth         = depth of the vault node in the tree (0 = top level)
async function buildERC4626Node(
    vaultAddress: string,
    chain: SupportedChain,
    assetAddr: string,
    depth: number
): Promise<VaultNode | null> {
    const [totalAssetsRaw, vaultDec, vaultSym, vaultNameStr, assetDec, assetSym, assetNameStr] = await Promise.all([
        vaultTotalAssets(chain, vaultAddress),
        tokenDecimals(chain, vaultAddress),
        tokenSymbol(chain, vaultAddress),
        tokenName(chain, vaultAddress),
        tokenDecimals(chain, assetAddr),
        tokenSymbol(chain, assetAddr),
        tokenName(chain, assetAddr),
    ]);

    if (totalAssetsRaw === null) return null;

    const underlyingDec = assetDec ?? 18;
    const underlyingPrice = await getTokenPrice(chain, assetAddr);

    const rawBalance = formatBigBalance(totalAssetsRaw, underlyingDec);
    const totalTokens = bigIntToFloat(totalAssetsRaw, underlyingDec);
    const balanceUSD = underlyingPrice !== null ? totalTokens * underlyingPrice : 0;

    // Share price: how many underlying per 1 vault share × underlying price
    let priceUSD: number | null = null;
    const shareDec = vaultDec ?? underlyingDec;
    try {
        const assetsPerShare = await vaultConvertToAssets(chain, vaultAddress, shareDec);
        if (assetsPerShare !== null && underlyingPrice !== null) {
            priceUSD = bigIntToFloat(assetsPerShare, underlyingDec) * underlyingPrice;
        }
    } catch {
        // leave priceUSD null
    }

    // Recursively check if the underlying asset is also an ERC-4626 vault (nested vault)
    let children: VaultNode[] = [];
    if (depth < 2) {
        const nestedAsset = await vaultAsset(chain, assetAddr);
        if (nestedAsset) {
            const nestedNode = await buildERC4626Node(assetAddr, chain, nestedAsset, depth + 1);
            if (nestedNode) children = [nestedNode];
        }
    }

    // If no nested vault, show the underlying asset as a simple leaf child
    if (children.length === 0) {
        children = [
            {
                address: assetAddr,
                name: assetNameStr ?? assetSym ?? "Underlying",
                ticker: assetSym ?? "",
                chain,
                balanceUSD,
                balance24hChange: 0,
                logoUrl: tokenLogoUrl(chain, assetAddr),
                depth: depth + 1,
                children: [],
                priceUSD: underlyingPrice,
                rawBalance,
                decimals: underlyingDec,
                protocolName: null,
            },
        ];
    }

    const displayName = vaultNameStr ?? `${assetSym ?? "Unknown"} Vault`;

    return {
        address: vaultAddress,
        name: displayName,
        ticker: vaultSym ?? `v${assetSym ?? ""}`,
        chain,
        balanceUSD,
        balance24hChange: 0,
        logoUrl: tokenLogoUrl(chain, assetAddr), // use underlying asset logo
        depth,
        children,
        priceUSD,
        rawBalance,
        decimals: underlyingDec,
        protocolName: detectProtocol(displayName, vaultSym),
    };
}

// ─── GoldRush balance API path ────────────────────────────────────────────────

// Fetches token balances via GoldRush BalanceService, enriches prices for items
// that have no quote_rate, and handles ERC-4626 tagged tokens recursively.
// Used for: wallet addresses, non-ERC-4626 DeFi protocols (Compound v3, etc.)
async function getGoldRushHoldings(address: string, chain: SupportedChain, depth: number): Promise<VaultNode[]> {
    let resp;
    try {
        resp = await getGoldRushClient().BalanceService.getTokenBalancesForWalletAddress(chain as Chain, address);
    } catch {
        return [];
    }

    if (resp.error || !resp.data?.items) return [];

    const nodes: VaultNode[] = [];

    for (const item of resp.data.items) {
        if (!item) continue;

        const decimals = item.contract_decimals ?? null;

        let rawBalance: string | null = null;
        let hasRawBalance = false;

        if (item.balance !== null && item.balance !== undefined && decimals !== null) {
            try {
                const balBig = BigInt(item.balance.toString());
                hasRawBalance = balBig > BigInt(0);
                if (hasRawBalance) rawBalance = formatBigBalance(balBig, decimals);
            } catch {
                const raw = Number(item.balance) / Math.pow(10, decimals);
                hasRawBalance = raw > 0;
                rawBalance =
                    raw >= 1e9
                        ? `${(raw / 1e9).toFixed(2)}B`
                        : raw >= 1e6
                          ? `${(raw / 1e6).toFixed(2)}M`
                          : raw.toLocaleString("en-US", {
                                maximumFractionDigits: raw < 1 ? 6 : raw < 1000 ? 4 : 2,
                            });
            }
        }

        let priceUSD = item.quote_rate ?? null;
        let balanceUSD = item.quote ?? 0;
        const balance24hChange = (item.quote ?? 0) - (item.quote_24h ?? 0);

        // Price enrichment: GoldRush sometimes has no price for well-known tokens
        if (priceUSD === null && hasRawBalance && item.contract_address) {
            priceUSD = await getTokenPrice(chain, item.contract_address);
            if (priceUSD !== null && item.balance !== null && decimals !== null) {
                try {
                    balanceUSD = bigIntToFloat(BigInt(item.balance.toString()), decimals) * priceUSD;
                } catch {
                    balanceUSD = (Number(item.balance) / Math.pow(10, decimals)) * priceUSD;
                }
            }
        }

        const node: VaultNode = {
            address: item.contract_address ?? "",
            name: item.contract_name ?? item.contract_ticker_symbol ?? "Unknown",
            ticker: item.contract_ticker_symbol ?? "",
            chain,
            balanceUSD,
            balance24hChange,
            logoUrl: item.logo_url ?? "",
            depth,
            children: [],
            priceUSD,
            rawBalance,
            decimals,
            protocolName:
                item.protocol_metadata?.protocol_name ??
                detectProtocol(item.contract_name ?? null, item.contract_ticker_symbol ?? null),
        };

        // ERC-4626 children: use GoldRush tag first, fall back to on-chain detection
        if (item.contract_address && depth < 2) {
            if (item.supports_erc?.includes("erc4626")) {
                node.children = await recursiveDecompose(item.contract_address, chain, depth + 1);
            } else if (hasRawBalance && priceUSD === null) {
                // Token with no price might be an untagged vault share — try on-chain
                const assetAddr = await vaultAsset(chain, item.contract_address);
                if (assetAddr) {
                    const nestedNode = await buildERC4626Node(item.contract_address, chain, assetAddr, depth + 1);
                    if (nestedNode) {
                        // Adopt the vault node's children (skip re-showing the same vault)
                        node.children = nestedNode.children;
                        if (priceUSD === null) priceUSD = nestedNode.priceUSD;
                        if (balanceUSD === 0) balanceUSD = nestedNode.balanceUSD;
                        node.priceUSD = priceUSD;
                        node.balanceUSD = balanceUSD;
                        if (!node.protocolName) node.protocolName = nestedNode.protocolName;
                    }
                }
            }
        }

        if (!hasRawBalance && balanceUSD === 0 && node.children.length === 0) continue;

        nodes.push(node);
    }

    return nodes.sort((a, b) => b.balanceUSD - a.balanceUSD);
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function recursiveDecompose(address: string, chain: SupportedChain, depth = 0): Promise<VaultNode[]> {
    if (depth >= 3) return [];

    const cacheKey = `${chain}:${address.toLowerCase()}`;
    if (depth === 0) {
        const cached = holdingsCache.get(cacheKey);
        if (cached && Date.now() - cached.ts < HOLDINGS_TTL) return cached.nodes;
    }

    let nodes: VaultNode[];

    // Try on-chain ERC-4626 detection first.
    // This handles vault contract addresses (MetaMorpho, Euler, etc.) where the
    // GoldRush balance API returns no useful price data.
    const assetAddr = await vaultAsset(chain, address);

    if (assetAddr) {
        // Address is an ERC-4626 vault — decompose via on-chain calls
        const vaultNode = await buildERC4626Node(address, chain, assetAddr, depth);
        nodes = vaultNode ? [vaultNode] : [];
    } else {
        // Not ERC-4626 (wallet, Compound v3 Comet, etc.) — use GoldRush balance API
        // with price enrichment for tokens that lack quote_rate
        nodes = await getGoldRushHoldings(address, chain, depth);
    }

    // Only cache if we got meaningful data — skip caching empty/dust results to prevent
    // a transient RPC failure from poisoning the cache for 2 minutes.
    const hasValue = nodes.some((n) => n.balanceUSD > 1 || n.children.length > 0);
    if (depth === 0 && hasValue) {
        holdingsCache.set(cacheKey, { nodes, ts: Date.now() });
    }

    return nodes;
}

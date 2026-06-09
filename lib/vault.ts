import { getGoldRushClient, getTokenData } from "./goldrush";
import { getVaultInfo, getMorphoMarkets, getErc20Meta, type VaultInfo } from "./rpc";
import { type SupportedChain, type VaultNode } from "@/types/vault";
import { type Chain } from "@covalenthq/client-sdk";

// ─── Caches ───────────────────────────────────────────────────────────────────

const holdingsCache = new Map<string, { nodes: VaultNode[]; ts: number }>();
const HOLDINGS_TTL = 2 * 60 * 1000;

// ─── Chain helpers ──────────────────────────────────────────────────────────

const CHAIN_IDS: Record<SupportedChain, number> = {
    "eth-mainnet": 1,
    "base-mainnet": 8453,
    "matic-mainnet": 137,
    "arbitrum-mainnet": 42161,
    "optimism-mainnet": 10,
    "bsc-mainnet": 56,
};

const MAX_DEPTH = 3;

// ─── Utilities ────────────────────────────────────────────────────────────────

// GoldRush's logo CDN, used when the pricing API has no logo for a token.
function logoFallback(chain: SupportedChain, address: string): string {
    return `https://logos.covalenthq.com/tokens/${CHAIN_IDS[chain]}/${address.toLowerCase()}.png`;
}

function formatAmount(raw: bigint, decimals: number): string {
    const divisor = 10n ** BigInt(decimals);
    const whole = Number(raw / divisor);
    if (whole >= 1_000_000_000) return `${(whole / 1_000_000_000).toFixed(2)}B`;
    if (whole >= 1_000_000) return `${(whole / 1_000_000).toFixed(2)}M`;
    const frac = (raw % divisor).toString().padStart(decimals, "0").replace(/0+$/, "");
    const maxDec = whole < 1 ? 6 : whole < 1000 ? 4 : 2;
    return `${whole.toLocaleString("en-US")}${frac.slice(0, maxDec) ? `.${frac.slice(0, maxDec)}` : ""}`;
}

function toFloat(raw: bigint, decimals: number): number {
    const divisor = 10n ** BigInt(decimals);
    return Number(raw / divisor) + Number(raw % divisor) / 10 ** decimals;
}

function detectProtocol(name: string | null, ticker?: string | null): string | null {
    const haystack = `${name ?? ""} ${ticker ?? ""}`.toLowerCase();
    if (!haystack.trim()) return null;
    if (haystack.includes("morpho")) return "Morpho";
    if (haystack.includes("compound") || haystack.includes("comet")) return "Compound";
    if (haystack.includes("euler")) return "Euler";
    if (haystack.includes("aave")) return "Aave";
    if (haystack.includes("yearn") || haystack.includes(" yv") || (ticker ?? "").startsWith("yv")) return "Yearn";
    if (haystack.includes("steakhouse") || (ticker ?? "").toLowerCase().startsWith("steak")) return "Morpho";
    if (haystack.includes("gauntlet") || /\bgt[a-z]/.test((ticker ?? "").toLowerCase())) return "Morpho";
    if (haystack.includes("moonwell") || (ticker ?? "").toLowerCase().startsWith("mw")) return "Morpho";
    if (haystack.includes("re7")) return "Morpho";
    if (haystack.includes("spark") || haystack.includes("sky")) return "Spark";
    if (haystack.includes("fluid")) return "Fluid";
    return null;
}

// ─── Morpho Blue decomposition ────────────────────────────────────────────────

// A MetaMorpho vault denominates in a single asset (USDC, WETH, …) but deploys it
// across many Morpho Blue markets, each lending that asset against one collateral.
// We read every market position on-chain, group by collateral, and price the value
// (which is denominated in the loan asset) through GoldRush. This is the real
// "beyond one hop" decomposition: vault → per-collateral lending positions.
async function buildMorphoTree(chain: SupportedChain, address: string, info: VaultInfo): Promise<VaultNode[]> {
    const markets = await getMorphoMarkets(chain, address, info.morpho!);
    const assetAddr = info.asset.toLowerCase();
    const assetDec = info.assetDecimals ?? 18;

    // One GoldRush call covers the loan asset + every collateral token.
    const collateralAddrs = markets.map((m) => m.collateralToken).filter((a): a is string => !!a);
    const priceMap = await getTokenData(chain, [assetAddr, ...collateralAddrs]);

    const assetData = priceMap.get(assetAddr);
    const assetPrice = assetData?.price ?? null;
    const assetPrev = assetData?.prev ?? null;
    const assetSymbol = assetData?.symbol ?? info.symbol ?? null;
    const assetLogo = assetData?.logoUrl ?? logoFallback(chain, assetAddr);

    // On-chain symbol fallback for any collateral token GoldRush couldn't label.
    const missing = collateralAddrs.filter((a) => !priceMap.get(a.toLowerCase())?.symbol);
    const onchainMeta = missing.length ? await getErc20Meta(chain, missing) : new Map();

    // Aggregate markets by collateral token (idle/unallocated grouped under "idle").
    type Agg = { collateral: string | null; supplied: bigint; count: number };
    const byCollateral = new Map<string, Agg>();
    for (const mk of markets) {
        const key = mk.collateralToken?.toLowerCase() ?? "idle";
        const agg = byCollateral.get(key) ?? { collateral: mk.collateralToken, supplied: 0n, count: 0 };
        agg.supplied += mk.suppliedAssets;
        agg.count += 1;
        byCollateral.set(key, agg);
    }

    // Reconcile against totalAssets: funds can sit as raw asset in the vault contract
    // (not yet supplied to any market). Fold that remainder into the idle bucket so the
    // position rows always sum to the vault's TVL — true for any MetaMorpho vault.
    if (info.totalAssets !== null) {
        let supplied = 0n;
        for (const agg of byCollateral.values()) supplied += agg.supplied;
        const residual = info.totalAssets - supplied;
        // ignore sub-0.1%-of-TVL rounding noise from share→asset conversion
        if (residual > 0n && residual * 1000n > info.totalAssets) {
            const idle = byCollateral.get("idle") ?? { collateral: null, supplied: 0n, count: 0 };
            idle.supplied += residual;
            byCollateral.set("idle", idle);
        }
    }

    const children: VaultNode[] = [];
    for (const [key, agg] of byCollateral) {
        // Skip markets the vault is queued for but holds nothing in.
        if (agg.supplied === 0n) continue;

        const suppliedFloat = toFloat(agg.supplied, assetDec);
        const balanceUSD = assetPrice !== null ? suppliedFloat * assetPrice : 0;
        const change24h =
            assetPrice !== null && assetPrev !== null ? suppliedFloat * (assetPrice - assetPrev) : 0;

        if (key === "idle") {
            children.push({
                address: assetAddr,
                name: `Idle ${assetSymbol ?? "Assets"}`,
                ticker: assetSymbol ?? "",
                chain,
                balanceUSD,
                balance24hChange: change24h,
                logoUrl: assetLogo,
                depth: 1,
                children: [],
                priceUSD: assetPrice,
                rawBalance: formatAmount(agg.supplied, assetDec),
                decimals: assetDec,
                protocolName: "Morpho",
                nodeType: "market",
                subLabel: "Unallocated liquidity",
            });
            continue;
        }

        const collAddr = (agg.collateral as string).toLowerCase();
        const cd = priceMap.get(collAddr);
        const collSymbol = cd?.symbol ?? onchainMeta.get(collAddr)?.symbol ?? `${collAddr.slice(0, 6)}…`;
        const collName = cd?.name ?? collSymbol;
        const collLogo = cd?.logoUrl ?? logoFallback(chain, collAddr);

        children.push({
            address: collAddr,
            name: `${collSymbol} Market`,
            ticker: assetSymbol ?? "",
            chain,
            balanceUSD,
            balance24hChange: change24h,
            logoUrl: collLogo,
            depth: 1,
            children: [],
            priceUSD: assetPrice,
            rawBalance: formatAmount(agg.supplied, assetDec),
            decimals: assetDec,
            protocolName: "Morpho",
            nodeType: "market",
            subLabel: `${collName} collateral · ${agg.count} market${agg.count > 1 ? "s" : ""}`,
        });
    }
    children.sort((a, b) => b.balanceUSD - a.balanceUSD);

    // Root vault node - balance and price are kept in the underlying asset so that
    // balance × price = USD value holds consistently with the position rows below.
    const totalAssetsFloat = info.totalAssets !== null ? toFloat(info.totalAssets, assetDec) : 0;
    const vaultUSD =
        assetPrice !== null ? totalAssetsFloat * assetPrice : children.reduce((s, c) => s + c.balanceUSD, 0);
    const vaultChange =
        assetPrice !== null && assetPrev !== null ? totalAssetsFloat * (assetPrice - assetPrev) : 0;

    const vaultNode: VaultNode = {
        address: address.toLowerCase(),
        name: info.name ?? `${assetSymbol ?? "Unknown"} Vault`,
        ticker: info.symbol ?? "",
        chain,
        balanceUSD: vaultUSD,
        balance24hChange: vaultChange,
        logoUrl: assetLogo,
        depth: 0,
        children,
        priceUSD: assetPrice,
        rawBalance: info.totalAssets !== null ? formatAmount(info.totalAssets, assetDec) : null,
        decimals: assetDec,
        protocolName: detectProtocol(info.name, info.symbol) ?? "Morpho",
        nodeType: "vault",
        subLabel:
            info.sharePrice !== null && assetPrice !== null
                ? `${children.length} positions · share $${(info.sharePrice * assetPrice).toFixed(4)}`
                : `${children.length} positions`,
    };

    return [vaultNode];
}

// ─── Generic ERC-4626 decomposition ───────────────────────────────────────────

// Non-Morpho vaults (Euler, Yearn, sDAI, …) denominate in a single asset. Show the
// underlying as a child, and recurse if that underlying is itself a vault (the rare
// but real vault-of-vaults case), up to MAX_DEPTH.
async function buildErc4626Tree(
    chain: SupportedChain,
    address: string,
    info: VaultInfo,
    depth: number
): Promise<VaultNode[]> {
    const assetAddr = info.asset.toLowerCase();
    const assetDec = info.assetDecimals ?? 18;

    const priceMap = await getTokenData(chain, [assetAddr]);
    const assetData = priceMap.get(assetAddr);
    const assetPrice = assetData?.price ?? null;
    const assetPrev = assetData?.prev ?? null;
    const assetSymbol = assetData?.symbol ?? null;
    const assetName = assetData?.name ?? assetSymbol ?? "Underlying";
    const assetLogo = assetData?.logoUrl ?? logoFallback(chain, assetAddr);

    const totalAssetsFloat = info.totalAssets !== null ? toFloat(info.totalAssets, assetDec) : 0;
    const balanceUSD = assetPrice !== null ? totalAssetsFloat * assetPrice : 0;
    const change24h =
        assetPrice !== null && assetPrev !== null ? totalAssetsFloat * (assetPrice - assetPrev) : 0;

    // Recurse if the underlying asset is itself an ERC-4626 vault.
    let children: VaultNode[] = [];
    if (depth + 1 < MAX_DEPTH) {
        const nested = await getVaultInfo(chain, assetAddr);
        if (nested?.isErc4626) {
            children = nested.isMorpho
                ? await buildMorphoTree(chain, assetAddr, nested)
                : await buildErc4626Tree(chain, assetAddr, nested, depth + 1);
            children = children.map((c) => bumpDepth(c, depth + 1));
        }
    }
    if (children.length === 0) {
        children = [
            {
                address: assetAddr,
                name: assetName,
                ticker: assetSymbol ?? "",
                chain,
                balanceUSD,
                balance24hChange: change24h,
                logoUrl: assetLogo,
                depth: depth + 1,
                children: [],
                priceUSD: assetPrice,
                rawBalance: formatAmount(info.totalAssets ?? 0n, assetDec),
                decimals: assetDec,
                protocolName: null,
                nodeType: "token",
                subLabel: null,
            },
        ];
    }

    return [
        {
            address: address.toLowerCase(),
            name: info.name ?? `${assetSymbol ?? "Unknown"} Vault`,
            ticker: info.symbol ?? "",
            chain,
            balanceUSD,
            balance24hChange: change24h,
            logoUrl: assetLogo,
            depth,
            children,
            priceUSD: assetPrice,
            rawBalance: info.totalAssets !== null ? formatAmount(info.totalAssets, assetDec) : null,
            decimals: assetDec,
            protocolName: detectProtocol(info.name, info.symbol),
            nodeType: "vault",
            subLabel: assetSymbol ? `${assetSymbol} denominated` : null,
        },
    ];
}

// Re-stamp depth on a subtree grafted in at a deeper level (so indentation is right).
function bumpDepth(node: VaultNode, depth: number): VaultNode {
    return { ...node, depth, children: node.children.map((c) => bumpDepth(c, depth + 1)) };
}

// ─── Wallet / non-vault path (GoldRush balances) ──────────────────────────────

// For plain wallets and non-ERC-4626 contracts, list ERC-20 holdings via GoldRush.
async function getWalletHoldings(chain: SupportedChain, address: string, depth: number): Promise<VaultNode[]> {
    let resp;
    try {
        resp = await getGoldRushClient().BalanceService.getTokenBalancesForWalletAddress(chain as Chain, address);
    } catch {
        return [];
    }
    if (resp.error || !resp.data?.items) return [];

    const nodes: VaultNode[] = [];
    for (const item of resp.data.items) {
        if (!item || !item.contract_address) continue;

        const decimals = item.contract_decimals ?? null;
        let rawBalance: string | null = null;
        let hasBalance = false;
        if (item.balance != null && decimals !== null) {
            try {
                const bal = BigInt(item.balance.toString());
                hasBalance = bal > 0n;
                if (hasBalance) rawBalance = formatAmount(bal, decimals);
            } catch {
                /* ignore unparsable balances */
            }
        }

        const balanceUSD = item.quote ?? 0;
        if (!hasBalance || balanceUSD < 0.01) continue; // hide dust and spam airdrops

        nodes.push({
            address: item.contract_address,
            name: item.contract_name ?? item.contract_ticker_symbol ?? "Unknown",
            ticker: item.contract_ticker_symbol ?? "",
            chain,
            balanceUSD,
            balance24hChange: (item.quote ?? 0) - (item.quote_24h ?? 0),
            logoUrl: item.logo_url ?? logoFallback(chain, item.contract_address),
            depth,
            children: [],
            priceUSD: item.quote_rate ?? null,
            rawBalance,
            decimals,
            protocolName:
                item.protocol_metadata?.protocol_name ??
                detectProtocol(item.contract_name ?? null, item.contract_ticker_symbol ?? null),
            nodeType: "token",
            subLabel: null,
        });
    }

    return nodes.sort((a, b) => b.balanceUSD - a.balanceUSD);
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function recursiveDecompose(address: string, chain: SupportedChain, depth = 0): Promise<VaultNode[]> {
    const cacheKey = `${chain}:${address.toLowerCase()}`;
    if (depth === 0) {
        const cached = holdingsCache.get(cacheKey);
        if (cached && Date.now() - cached.ts < HOLDINGS_TTL) return cached.nodes;
    }

    let nodes: VaultNode[];
    const info = await getVaultInfo(chain, address);

    if (info?.isMorpho) {
        nodes = await buildMorphoTree(chain, address, info);
    } else if (info?.isErc4626) {
        nodes = await buildErc4626Tree(chain, address, info, depth);
    } else {
        nodes = await getWalletHoldings(chain, address, depth);
    }

    // Only cache meaningful results - a transient RPC failure shouldn't poison the
    // cache with an empty tree for the whole TTL.
    const hasValue = nodes.some((n) => n.balanceUSD > 1 || n.children.length > 0);
    if (depth === 0 && hasValue) {
        holdingsCache.set(cacheKey, { nodes, ts: Date.now() });
    }

    return nodes;
}

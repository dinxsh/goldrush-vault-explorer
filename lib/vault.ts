import { getGoldRushClient, getTokenData } from "./goldrush";
import {
    getVaultInfo,
    getMorphoMarkets,
    getErc20Meta,
    getEulerState,
    getCometInfo,
    getErc20Balance,
    type VaultInfo,
    type MarketPosition,
    type CometInfo,
} from "./rpc";
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
    "avalanche-mainnet": 43114,
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

// Morpho LLTV is a WAD (1e18 = 100%). 0.86e18 -> "86%".
function formatLltv(lltv: bigint): string {
    return `${(Number(lltv) / 1e16).toFixed(0)}%`;
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

    // Group markets by collateral token, keeping each group's individual markets so we
    // can drill into them. The idle market (no collateral) holds unallocated funds.
    type Agg = { collateral: string | null; supplied: bigint; markets: MarketPosition[] };
    const byCollateral = new Map<string, Agg>();
    for (const mk of markets) {
        const key = mk.collateralToken?.toLowerCase() ?? "idle";
        const agg = byCollateral.get(key) ?? { collateral: mk.collateralToken, supplied: 0n, markets: [] };
        agg.supplied += mk.suppliedAssets;
        agg.markets.push(mk);
        byCollateral.set(key, agg);
    }

    // Reconcile against totalAssets: funds can sit as raw asset in the vault contract
    // (not yet supplied to any market). Fold that remainder into the idle bucket so the
    // position rows always sum to the vault's TVL - true for any MetaMorpho vault.
    if (info.totalAssets !== null) {
        let supplied = 0n;
        for (const agg of byCollateral.values()) supplied += agg.supplied;
        const residual = info.totalAssets - supplied;
        // ignore sub-0.1%-of-TVL rounding noise from share->asset conversion
        if (residual > 0n && residual * 1000n > info.totalAssets) {
            const idle = byCollateral.get("idle") ?? { collateral: null, supplied: 0n, markets: [] };
            idle.supplied += residual;
            byCollateral.set("idle", idle);
        }
    }

    // Vault USD value kept in the underlying asset so balance x price = value.
    const totalAssetsFloat = info.totalAssets !== null ? toFloat(info.totalAssets, assetDec) : 0;
    const valueOf = (raw: bigint) => (assetPrice !== null ? toFloat(raw, assetDec) * assetPrice : 0);
    const changeOf = (raw: bigint) =>
        assetPrice !== null && assetPrev !== null ? toFloat(raw, assetDec) * (assetPrice - assetPrev) : 0;
    const vaultUSD = assetPrice !== null ? totalAssetsFloat * assetPrice : 0;
    const vaultChange = info.totalAssets !== null ? changeOf(info.totalAssets) : 0;

    const children: VaultNode[] = [];
    let apyNum = 0; // Σ supplyApy × supplied, for the vault's supplied-weighted net APY
    let apyDen = 0;

    for (const [key, agg] of byCollateral) {
        // Skip markets the vault is queued for but holds nothing in.
        if (agg.supplied === 0n) continue;
        const groupUSD = valueOf(agg.supplied);

        if (key === "idle") {
            children.push({
                address: assetAddr,
                name: `Idle ${assetSymbol ?? "Assets"}`,
                ticker: assetSymbol ?? "",
                chain,
                balanceUSD: groupUSD,
                balance24hChange: changeOf(agg.supplied),
                logoUrl: assetLogo,
                depth: 1,
                children: [],
                priceUSD: assetPrice,
                rawBalance: formatAmount(agg.supplied, assetDec),
                decimals: assetDec,
                protocolName: "Morpho",
                nodeType: "market",
                subLabel: "Unallocated",
                apy: null,
            });
            continue;
        }

        const collAddr = (agg.collateral as string).toLowerCase();
        const cd = priceMap.get(collAddr);
        const collSymbol = cd?.symbol ?? onchainMeta.get(collAddr)?.symbol ?? `${collAddr.slice(0, 6)}…`;
        const collName = cd?.name ?? collSymbol;
        const collLogo = cd?.logoUrl ?? logoFallback(chain, collAddr);

        // Supplied-weighted APY across the markets in this collateral group.
        let gNum = 0;
        let gDen = 0;
        for (const mk of agg.markets) {
            if (mk.supplyApy === null) continue;
            const w = Number(mk.suppliedAssets);
            gNum += mk.supplyApy * w;
            gDen += w;
        }
        apyNum += gNum;
        apyDen += gDen;
        const groupApy = gDen > 0 ? gNum / gDen : null;

        // Drill-down: when a collateral has multiple funded markets (different LLTV /
        // oracle / rate), expose each as its own child row.
        const funded = agg.markets.filter((m) => m.suppliedAssets > 0n);
        const marketChildren: VaultNode[] =
            funded.length > 1
                ? funded
                      .slice()
                      .sort((a, b) => Number(b.suppliedAssets - a.suppliedAssets))
                      .map((mk) => ({
                          address: mk.id, // bytes32 market id keeps React keys unique
                          name: `${collSymbol} / ${assetSymbol ?? ""} market`,
                          ticker: assetSymbol ?? "",
                          chain,
                          balanceUSD: valueOf(mk.suppliedAssets),
                          balance24hChange: changeOf(mk.suppliedAssets),
                          logoUrl: collLogo,
                          depth: 2,
                          children: [],
                          priceUSD: assetPrice,
                          rawBalance: formatAmount(mk.suppliedAssets, assetDec),
                          decimals: assetDec,
                          protocolName: "Morpho",
                          nodeType: "market" as const,
                          subLabel: `LLTV ${formatLltv(mk.lltv)} · ${(mk.utilization * 100).toFixed(0)}% utilized`,
                          apy: mk.supplyApy,
                      }))
                : [];

        children.push({
            address: collAddr,
            name: `${collSymbol} Market`,
            ticker: assetSymbol ?? "",
            chain,
            balanceUSD: groupUSD,
            balance24hChange: changeOf(agg.supplied),
            logoUrl: collLogo,
            depth: 1,
            children: marketChildren,
            priceUSD: assetPrice,
            rawBalance: formatAmount(agg.supplied, assetDec),
            decimals: assetDec,
            protocolName: "Morpho",
            nodeType: "market",
            subLabel: funded.length > 1 ? `${collName} · ${funded.length} markets` : collName,
            apy: groupApy,
        });
    }
    children.sort((a, b) => b.balanceUSD - a.balanceUSD);

    const vaultApy = apyDen > 0 ? apyNum / apyDen : null;

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
        subLabel: `${children.length} positions${
            info.sharePrice !== null && assetPrice !== null ? ` · $${(info.sharePrice * assetPrice).toFixed(4)}/share` : ""
        }`,
        apy: vaultApy,
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

// ─── Euler v2 decomposition ───────────────────────────────────────────────────

// An Euler v2 eVault lends a single asset; its assets split into available cash and
// the portion lent out to borrowers. That split (and the resulting utilization) is the
// meaningful "beyond one hop" view for a lending vault.
async function buildEulerTree(chain: SupportedChain, address: string, info: VaultInfo): Promise<VaultNode[]> {
    const assetAddr = info.asset.toLowerCase();
    const assetDec = info.assetDecimals ?? 18;
    const state = await getEulerState(chain, address);

    const priceMap = await getTokenData(chain, [assetAddr]);
    const ad = priceMap.get(assetAddr);
    const assetPrice = ad?.price ?? null;
    const assetPrev = ad?.prev ?? null;
    const assetSymbol = ad?.symbol ?? info.symbol ?? null;
    const assetLogo = ad?.logoUrl ?? logoFallback(chain, assetAddr);

    const totalAssets = info.totalAssets ?? (state ? state.cash + state.borrows : 0n);
    const valueOf = (raw: bigint) => (assetPrice !== null ? toFloat(raw, assetDec) * assetPrice : 0);
    const changeOf = (raw: bigint) =>
        assetPrice !== null && assetPrev !== null ? toFloat(raw, assetDec) * (assetPrice - assetPrev) : 0;
    const vaultUSD = valueOf(totalAssets);
    const pctOf = (usd: number) => (vaultUSD > 0 ? (usd / vaultUSD) * 100 : 0);

    const children: VaultNode[] = [];
    let utilization = 0;
    if (state) {
        const total = state.cash + state.borrows;
        utilization = total > 0n ? Number(state.borrows) / Number(total) : 0;
        const mk = (raw: bigint, name: string, sub: string): VaultNode => ({
            address: assetAddr,
            name,
            ticker: assetSymbol ?? "",
            chain,
            balanceUSD: valueOf(raw),
            balance24hChange: changeOf(raw),
            logoUrl: assetLogo,
            depth: 1,
            children: [],
            priceUSD: assetPrice,
            rawBalance: formatAmount(raw, assetDec),
            decimals: assetDec,
            protocolName: "Euler",
            nodeType: "market",
            subLabel: sub,
        });
        children.push(mk(state.borrows, "Lent to Borrowers", `Borrowed out · ${pctOf(valueOf(state.borrows)).toFixed(1)}% of vault`));
        children.push(mk(state.cash, `Available ${assetSymbol ?? "Liquidity"}`, `Idle cash · ${pctOf(valueOf(state.cash)).toFixed(1)}% of vault`));
        children.sort((a, b) => b.balanceUSD - a.balanceUSD);
    }

    return [
        {
            address: address.toLowerCase(),
            name: info.name ?? `${assetSymbol ?? "Unknown"} Vault`,
            ticker: info.symbol ?? "",
            chain,
            balanceUSD: vaultUSD,
            balance24hChange: changeOf(totalAssets),
            logoUrl: assetLogo,
            depth: 0,
            children,
            priceUSD: assetPrice,
            rawBalance: formatAmount(totalAssets, assetDec),
            decimals: assetDec,
            protocolName: "Euler",
            nodeType: "vault",
            subLabel: `${(utilization * 100).toFixed(0)}% utilized${
                info.sharePrice !== null && assetPrice !== null
                    ? ` · $${(info.sharePrice * assetPrice).toFixed(4)}/share`
                    : ""
            }`,
        },
    ];
}

// ─── Compound v3 (Comet) decomposition ────────────────────────────────────────

// A Comet is a single-asset lending market that custodies a basket of collateral
// tokens (posted by borrowers) plus its own base-token cash. We decompose it into
// those concrete on-chain holdings, priced via GoldRush.
async function buildCometTree(chain: SupportedChain, address: string, comet: CometInfo): Promise<VaultNode[]> {
    const base = comet.baseToken.toLowerCase();
    const collAddrs = comet.collaterals.map((c) => c.token.toLowerCase());
    const baseHeld = await getErc20Balance(chain, base, address);

    const priceMap = await getTokenData(chain, [base, ...collAddrs]);
    const missingDec = [base, ...collAddrs].filter((t) => priceMap.get(t)?.decimals == null);
    const onchainMeta = missingDec.length ? await getErc20Meta(chain, missingDec) : new Map();
    const decOf = (t: string) => priceMap.get(t)?.decimals ?? onchainMeta.get(t)?.decimals ?? 18;

    const node = (token: string, held: bigint, isBase: boolean): VaultNode => {
        const d = priceMap.get(token);
        const dec = decOf(token);
        const price = d?.price ?? null;
        const symbol = d?.symbol ?? onchainMeta.get(token)?.symbol ?? `${token.slice(0, 6)}…`;
        const balanceUSD = price !== null ? toFloat(held, dec) * price : 0;
        const change = price !== null && d?.prev != null ? toFloat(held, dec) * (price - d.prev) : 0;
        return {
            address: token,
            name: d?.name ?? symbol,
            ticker: symbol,
            chain,
            balanceUSD,
            balance24hChange: change,
            logoUrl: d?.logoUrl ?? logoFallback(chain, token),
            depth: 1,
            children: [],
            priceUSD: price,
            rawBalance: formatAmount(held, dec),
            decimals: dec,
            protocolName: "Compound",
            nodeType: "market",
            subLabel: isBase ? "Base asset reserves" : "Collateral held",
        };
    };

    const children: VaultNode[] = [];
    if (baseHeld && baseHeld > 0n) children.push(node(base, baseHeld, true));
    for (const c of comet.collaterals) children.push(node(c.token.toLowerCase(), c.held, false));
    children.sort((a, b) => b.balanceUSD - a.balanceUSD);

    const totalUSD = children.reduce((s, c) => s + c.balanceUSD, 0);
    const totalChange = children.reduce((s, c) => s + c.balance24hChange, 0);
    const baseSymbol = priceMap.get(base)?.symbol ?? "";

    return [
        {
            address: address.toLowerCase(),
            name: `Compound III ${baseSymbol}`.trim(),
            ticker: baseSymbol ? `c${baseSymbol}v3` : "",
            chain,
            balanceUSD: totalUSD,
            balance24hChange: totalChange,
            logoUrl: priceMap.get(base)?.logoUrl ?? logoFallback(chain, base),
            depth: 0,
            children,
            priceUSD: null,
            rawBalance: null,
            decimals: null,
            protocolName: "Compound",
            nodeType: "vault",
            subLabel: `${children.length} assets held · ${baseSymbol} market`,
        },
    ];
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
    } else if (info?.isEuler) {
        nodes = await buildEulerTree(chain, address, info);
    } else if (info?.isErc4626) {
        nodes = await buildErc4626Tree(chain, address, info, depth);
    } else {
        // Not ERC-4626 - try Compound v3 (Comet) before falling back to a wallet listing.
        const comet = depth === 0 ? await getCometInfo(chain, address) : null;
        nodes = comet ? await buildCometTree(chain, address, comet) : await getWalletHoldings(chain, address, depth);
    }

    // Only cache meaningful results - a transient RPC failure shouldn't poison the
    // cache with an empty tree for the whole TTL.
    const hasValue = nodes.some((n) => n.balanceUSD > 1 || n.children.length > 0);
    if (depth === 0 && hasValue) {
        holdingsCache.set(cacheKey, { nodes, ts: Date.now() });
    }

    return nodes;
}

import { createPublicClient, fallback, http, parseAbi, type PublicClient } from "viem";
import { type SupportedChain } from "@/types/vault";

// On-chain reads go through GoldRush JSON-RPC first (same GOLDRUSH_API_KEY, archive
// depth, 99.9% SLA), then fall back to public nodes if a request errors - including
// GoldRush's "User balance exceeded" credit error, which viem's fallback transport
// retries against the next provider. Vault internals (totalAssets, Morpho Blue market
// positions) are not exposed by any REST endpoint, so they must be read on-chain.

const PUBLIC_RPCS: Record<SupportedChain, string[]> = {
    "eth-mainnet": ["https://ethereum-rpc.publicnode.com", "https://eth.meowrpc.com", "https://eth.merkle.io"],
    "base-mainnet": ["https://base-rpc.publicnode.com", "https://base.meowrpc.com", "https://mainnet.base.org"],
    "matic-mainnet": ["https://polygon-bor-rpc.publicnode.com", "https://polygon.meowrpc.com"],
    "arbitrum-mainnet": ["https://arbitrum-one-rpc.publicnode.com", "https://arbitrum.meowrpc.com"],
    "optimism-mainnet": ["https://optimism-rpc.publicnode.com", "https://optimism.meowrpc.com"],
    "bsc-mainnet": ["https://bsc-rpc.publicnode.com", "https://bsc.meowrpc.com"],
};

const clients = new Map<SupportedChain, PublicClient>();

export function getClient(chain: SupportedChain): PublicClient {
    let client = clients.get(chain);
    if (!client) {
        const apiKey = (process.env.GOLDRUSH_API_KEY ?? "").trim();
        const transports = [];
        if (apiKey) {
            transports.push(
                http(`https://rpc.goldrushdata.com/v1/${chain}`, {
                    fetchOptions: { headers: { Authorization: `Bearer ${apiKey}` } },
                    timeout: 8000,
                })
            );
        }
        for (const url of PUBLIC_RPCS[chain]) transports.push(http(url, { timeout: 8000 }));
        client = createPublicClient({
            batch: { multicall: true },
            transport: fallback(transports),
        }) as PublicClient;
        clients.set(chain, client);
    }
    return client;
}

// ─── ABIs ───────────────────────────────────────────────────────────────────

const VAULT_ABI = parseAbi([
    "function asset() view returns (address)",
    "function symbol() view returns (string)",
    "function name() view returns (string)",
    "function decimals() view returns (uint8)",
    "function totalAssets() view returns (uint256)",
    "function convertToAssets(uint256) view returns (uint256)",
    "function MORPHO() view returns (address)",
    "function withdrawQueueLength() view returns (uint256)",
    "function withdrawQueue(uint256) view returns (bytes32)",
]);

// Morpho Blue singleton - the shared lending engine MetaMorpho vaults supply into.
const MORPHO_BLUE_ABI = parseAbi([
    "function idToMarketParams(bytes32) view returns (address loanToken, address collateralToken, address oracle, address irm, uint256 lltv)",
    "function market(bytes32) view returns (uint128 totalSupplyAssets, uint128 totalSupplyShares, uint128 totalBorrowAssets, uint128 totalBorrowShares, uint128 lastUpdate, uint128 fee)",
    "function position(bytes32, address) view returns (uint256 supplyShares, uint128 borrowShares, uint128 collateral)",
]);

const ERC20_ABI = parseAbi([
    "function symbol() view returns (string)",
    "function name() view returns (string)",
    "function decimals() view returns (uint8)",
]);

const ZERO = "0x0000000000000000000000000000000000000000";

function lc(addr: string): `0x${string}` {
    return addr.toLowerCase() as `0x${string}`;
}

// ─── Types ──────────────────────────────────────────────────────────────────

export interface VaultInfo {
    isErc4626: boolean;
    isMorpho: boolean;
    morpho: string | null; // Morpho Blue singleton, if this is a MetaMorpho vault
    asset: string; // underlying asset address
    symbol: string | null;
    name: string | null;
    decimals: number | null; // vault share decimals
    assetDecimals: number | null;
    totalAssets: bigint | null;
    sharePrice: number | null; // underlying asset per 1 vault share (float)
}

export interface MarketPosition {
    id: string;
    collateralToken: string | null; // null = idle market (unallocated funds)
    loanToken: string;
    lltv: bigint;
    suppliedAssets: bigint; // vault's supplied assets in loanToken decimals
}

// ─── Reads ──────────────────────────────────────────────────────────────────

// Detect whether `address` is an ERC-4626 vault and, if so, whether it's a
// MetaMorpho vault (exposes MORPHO()). Returns null for non-vault addresses.
export async function getVaultInfo(chain: SupportedChain, address: string): Promise<VaultInfo | null> {
    const client = getClient(chain);
    const addr = lc(address);

    let asset: string;
    try {
        asset = await client.readContract({ address: addr, abi: VAULT_ABI, functionName: "asset" });
    } catch {
        return null; // asset() reverts → not an ERC-4626 vault
    }
    if (!asset || asset === ZERO) return null;

    const [symbol, name, decimals, totalAssets, morpho, assetDecimals] = await Promise.all([
        client.readContract({ address: addr, abi: VAULT_ABI, functionName: "symbol" }).catch(() => null),
        client.readContract({ address: addr, abi: VAULT_ABI, functionName: "name" }).catch(() => null),
        client.readContract({ address: addr, abi: VAULT_ABI, functionName: "decimals" }).catch(() => null),
        client.readContract({ address: addr, abi: VAULT_ABI, functionName: "totalAssets" }).catch(() => null),
        client.readContract({ address: addr, abi: VAULT_ABI, functionName: "MORPHO" }).catch(() => null),
        client.readContract({ address: lc(asset), abi: ERC20_ABI, functionName: "decimals" }).catch(() => null),
    ]);

    const shareDec = decimals != null ? Number(decimals) : 18;
    const aDec = assetDecimals != null ? Number(assetDecimals) : 18;

    let sharePrice: number | null = null;
    try {
        const perShare = await client.readContract({
            address: addr,
            abi: VAULT_ABI,
            functionName: "convertToAssets",
            args: [10n ** BigInt(shareDec)],
        });
        sharePrice = Number(perShare) / 10 ** aDec;
    } catch {
        /* leave null */
    }

    const isMorpho = !!morpho && morpho !== ZERO;

    return {
        isErc4626: true,
        isMorpho,
        morpho: isMorpho ? (morpho as string) : null,
        asset,
        symbol: (symbol as string) ?? null,
        name: (name as string) ?? null,
        decimals: decimals != null ? Number(decimals) : null,
        assetDecimals: assetDecimals != null ? Number(assetDecimals) : null,
        totalAssets: (totalAssets as bigint) ?? null,
        sharePrice,
    };
}

// Enumerate a MetaMorpho vault's Morpho Blue markets and how much the vault has
// supplied into each. The withdraw queue contains every market the vault touches.
export async function getMorphoMarkets(
    chain: SupportedChain,
    vault: string,
    morpho: string
): Promise<MarketPosition[]> {
    const client = getClient(chain);
    const v = lc(vault);
    const m = lc(morpho);

    const len = await client
        .readContract({ address: v, abi: VAULT_ABI, functionName: "withdrawQueueLength" })
        .catch(() => 0n);
    const count = Number(len);
    if (!count) return [];

    const ids = await Promise.all(
        Array.from({ length: count }, (_, i) =>
            client
                .readContract({ address: v, abi: VAULT_ABI, functionName: "withdrawQueue", args: [BigInt(i)] })
                .catch(() => null)
        )
    );

    const positions = await Promise.all(
        ids.map(async (id) => {
            if (!id) return null;
            const [params, market, position] = await Promise.all([
                client.readContract({ address: m, abi: MORPHO_BLUE_ABI, functionName: "idToMarketParams", args: [id] }).catch(() => null),
                client.readContract({ address: m, abi: MORPHO_BLUE_ABI, functionName: "market", args: [id] }).catch(() => null),
                client.readContract({ address: m, abi: MORPHO_BLUE_ABI, functionName: "position", args: [id, v] }).catch(() => null),
            ]);
            if (!params || !market || !position) return null;

            const totalSupplyAssets = market[0];
            const totalSupplyShares = market[1];
            const supplyShares = position[0];
            // Convert the vault's supply shares into underlying assets.
            const supplied = totalSupplyShares === 0n ? 0n : (supplyShares * totalSupplyAssets) / totalSupplyShares;
            const collateralToken = params[1];

            return {
                id: id as string,
                collateralToken: collateralToken && collateralToken !== ZERO ? collateralToken : null,
                loanToken: params[0],
                lltv: params[4],
                suppliedAssets: supplied,
            } as MarketPosition;
        })
    );

    return positions.filter((p): p is MarketPosition => p !== null);
}

// On-chain ERC-20 symbol/decimals fallback for tokens GoldRush pricing doesn't cover.
export async function getErc20Meta(
    chain: SupportedChain,
    addresses: string[]
): Promise<Map<string, { symbol: string | null; decimals: number | null }>> {
    const client = getClient(chain);
    const out = new Map<string, { symbol: string | null; decimals: number | null }>();
    await Promise.all(
        [...new Set(addresses.map((a) => a.toLowerCase()))].map(async (a) => {
            const [symbol, decimals] = await Promise.all([
                client.readContract({ address: lc(a), abi: ERC20_ABI, functionName: "symbol" }).catch(() => null),
                client.readContract({ address: lc(a), abi: ERC20_ABI, functionName: "decimals" }).catch(() => null),
            ]);
            out.set(a, { symbol: (symbol as string) ?? null, decimals: decimals != null ? Number(decimals) : null });
        })
    );
    return out;
}

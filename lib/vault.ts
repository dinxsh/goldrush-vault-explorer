import { getGoldRushClient } from "./goldrush";
import { type SupportedChain, type VaultNode } from "@/types/vault";
import { type Chain } from "@covalenthq/client-sdk";

const cache = new Map<string, { nodes: VaultNode[]; ts: number }>();
const CACHE_TTL = 2 * 60 * 1000;

export async function recursiveDecompose(address: string, chain: SupportedChain, depth = 0): Promise<VaultNode[]> {
    if (depth >= 3) return [];

    if (depth === 0) {
        const key = `${chain}:${address.toLowerCase()}`;
        const cached = cache.get(key);
        if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.nodes;
    }

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

        const balanceUSD = item.quote ?? 0;
        const balance24hChange = (item.quote ?? 0) - (item.quote_24h ?? 0);
        const decimals = item.contract_decimals ?? null;

        let rawBalance: string | null = null;
        let hasRawBalance = false;
        if (item.balance !== null && item.balance !== undefined && decimals !== null) {
            const raw = Number(item.balance) / Math.pow(10, decimals);
            hasRawBalance = raw > 0;
            rawBalance = raw.toLocaleString("en-US", {
                maximumFractionDigits: raw < 1 ? 6 : raw < 1000 ? 4 : 2,
                minimumFractionDigits: 0,
            });
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
            priceUSD: item.quote_rate ?? null,
            rawBalance,
            decimals,
            protocolName: item.protocol_metadata?.protocol_name ?? null,
        };

        if (item.supports_erc?.includes("erc4626") && item.contract_address) {
            node.children = await recursiveDecompose(item.contract_address, chain, depth + 1);
        }

        // Skip completely empty items — no balance AND no USD value AND no children
        if (!hasRawBalance && balanceUSD === 0 && node.children.length === 0) continue;

        nodes.push(node);
    }

    const sorted = nodes.sort((a, b) => b.balanceUSD - a.balanceUSD);

    if (depth === 0) {
        cache.set(`${chain}:${address.toLowerCase()}`, { nodes: sorted, ts: Date.now() });
    }

    return sorted;
}

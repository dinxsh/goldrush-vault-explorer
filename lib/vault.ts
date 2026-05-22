import { getGoldRushClient } from "./goldrush";
import { type SupportedChain, type VaultNode } from "@/types/vault";
import { type Chain } from "@covalenthq/client-sdk";

export async function recursiveDecompose(address: string, chain: SupportedChain, depth = 0): Promise<VaultNode[]> {
    if (depth >= 3) {
        return [];
    }

    let resp;
    try {
        resp = await getGoldRushClient().BalanceService.getTokenBalancesForWalletAddress(chain as Chain, address, {
            noSpam: true,
        });
    } catch {
        return [];
    }

    if (resp.error || !resp.data?.items) {
        return [];
    }

    const nodes: VaultNode[] = [];

    for (const item of resp.data.items) {
        if (!item) continue;

        const balanceUSD = item.quote ?? 0;
        const balance24hChange = (item.quote ?? 0) - (item.quote_24h ?? 0);

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
        };

        if (item.supports_erc?.includes("erc4626") && item.contract_address) {
            node.children = await recursiveDecompose(item.contract_address, chain, depth + 1);
        }

        // Skip dust: zero balance and no children
        if (balanceUSD === 0 && node.children.length === 0) {
            continue;
        }

        nodes.push(node);
    }

    return nodes.sort((a, b) => b.balanceUSD - a.balanceUSD);
}

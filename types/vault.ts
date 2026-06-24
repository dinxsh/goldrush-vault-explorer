export type SupportedChain =
    | "eth-mainnet"
    | "base-mainnet"
    | "matic-mainnet"
    | "arbitrum-mainnet"
    | "optimism-mainnet"
    | "bsc-mainnet"
    | "avalanche-mainnet";

export interface VaultNode {
    address: string;
    name: string;
    ticker: string;
    chain: SupportedChain;
    balanceUSD: number;
    balance24hChange: number;
    logoUrl: string;
    depth: number;
    children: VaultNode[];
    // Extended fields from GoldRush
    priceUSD: number | null;
    rawBalance: string | null;
    decimals: number | null;
    protocolName: string | null;
    // What kind of node this is, used to pick the "Type" badge in the UI.
    //   vault  → an ERC-4626 vault (expandable into positions)
    //   market → a Morpho Blue market position the vault supplies into
    //   token  → a plain token leaf
    nodeType?: "vault" | "market" | "token";
    // Optional secondary line, e.g. "WBTC collateral · 2 markets".
    subLabel?: string | null;
    // Annualized supply APY for this position (0.05 = 5%); null when not applicable.
    apy?: number | null;
}

export interface TxSummary {
    hash: string;
    timestamp: string;
    successful: boolean;
    eventName: string | null;
    eventCategory: "deposit" | "withdraw" | "swap" | "transfer" | "approval" | "other";
    explorerUrl: string;
    fromAddress: string;
}

export interface VaultStats {
    totalCount: number;
    firstSeenAt: string | null;
    lastActiveAt: string | null;
}

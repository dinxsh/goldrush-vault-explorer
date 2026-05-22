export type SupportedChain =
    | "eth-mainnet"
    | "base-mainnet"
    | "matic-mainnet"
    | "arbitrum-mainnet"
    | "optimism-mainnet"
    | "bsc-mainnet";

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

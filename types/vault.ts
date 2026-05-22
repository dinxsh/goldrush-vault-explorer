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
}

export interface TxSummary {
    hash: string;
    timestamp: string;
    valueUSD: number | null;
    successful: boolean;
    logCount: number;
    eventName: string | null;
}

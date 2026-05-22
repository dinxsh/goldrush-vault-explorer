import { type SupportedChain } from "@/types/vault";

const EXPLORER_BASE: Record<SupportedChain, string> = {
    "eth-mainnet": "https://etherscan.io",
    "base-mainnet": "https://basescan.org",
    "matic-mainnet": "https://polygonscan.com",
    "arbitrum-mainnet": "https://arbiscan.io",
    "optimism-mainnet": "https://optimistic.etherscan.io",
    "bsc-mainnet": "https://bscscan.com",
};

const EXPLORER_NAME: Record<SupportedChain, string> = {
    "eth-mainnet": "Etherscan",
    "base-mainnet": "Basescan",
    "matic-mainnet": "Polygonscan",
    "arbitrum-mainnet": "Arbiscan",
    "optimism-mainnet": "Optimistic Etherscan",
    "bsc-mainnet": "BscScan",
};

export function explorerTxUrl(chain: SupportedChain, hash: string): string {
    return `${EXPLORER_BASE[chain]}/tx/${hash}`;
}

export function explorerAddressUrl(chain: SupportedChain, address: string): string {
    return `${EXPLORER_BASE[chain]}/address/${address}`;
}

export function explorerName(chain: SupportedChain): string {
    return EXPLORER_NAME[chain];
}

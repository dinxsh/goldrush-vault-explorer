import { type Opportunity } from "@/types/opportunity";

// Vault catalog, MetaMorpho (Morpho Blue) vaults only. Every address is verified to
// have deployed contract code on its chain (eth_getCode != "0x") AND its decomposition
// (lib/vault.ts buildMorphoTree) emits a live root APY, so each entry serves fully live
// data, TVL and APY both, under the strict live-only policy.
//
// On 2026-06-26 we removed 30 entries that could not serve live data: 25 with
// fabricated/placeholder addresses (no on-chain code) and 5 real non-Morpho contracts
// (Aave/Curve/Compound/Uniswap) for which the engine cannot yet compute a live root APY.
// Re-add those once the engine learns to compute live APY per protocol.

export const COMPLETE_VAULT_DATABASE: Record<string, Opportunity> = {
  // ===== MORPHO BLUE, ETHEREUM (live TVL + live APY) =====
  // Steakhouse Vaults
  "morpho-steakhouse-usdc-eth": {
    slug: "morpho-steakhouse-usdc-eth",
    name: "Steakhouse USDC",
    description: "MetaMorpho USDC vault by Steakhouse Finance, allocates to Morpho Blue markets",
    vaultAddress: "0xbeef01735c132ada46aa9aa4c54623caa92a64cb",
    chain: "eth-mainnet",
    protocol: "Morpho",
    asset: "USDC",
    riskLevel: "low",
    riskFactors: ["smart contract", "oracle", "market risk"],
    highlights: ["High APY", "Battle-tested", "Active management"],
    apy: 0.0825,
    tvl: 285_000_000,
  },
  "morpho-steakhouse-usdt-eth": {
    slug: "morpho-steakhouse-usdt-eth",
    name: "Steakhouse USDT",
    description: "MetaMorpho USDT vault by Steakhouse Finance",
    vaultAddress: "0xbEef047a543E45807105E51A8BBEFCc5950fcfBa",
    chain: "eth-mainnet",
    protocol: "Morpho",
    asset: "USDT",
    riskLevel: "low",
    riskFactors: ["smart contract", "oracle"],
    highlights: ["Established vault", "High liquidity", "Transparent management"],
    apy: 0.0812,
    tvl: 156_000_000,
  },
  // Gauntlet Vaults
  "morpho-gauntlet-usdc-eth": {
    slug: "morpho-gauntlet-usdc-eth",
    name: "Gauntlet USDC Core",
    description: "MetaMorpho USDC vault by Gauntlet, risk-optimised allocation",
    vaultAddress: "0x8eB67A509616cd6A7c1B3c8C21D48FF57df3d458",
    chain: "eth-mainnet",
    protocol: "Morpho",
    asset: "USDC",
    riskLevel: "low",
    riskFactors: ["smart contract", "oracle"],
    highlights: ["Risk-optimised", "Institutional-grade", "Diversified"],
    apy: 0.0795,
    tvl: 412_000_000,
  },
  "morpho-gauntlet-weth-eth": {
    slug: "morpho-gauntlet-weth-eth",
    name: "Gauntlet WETH Core",
    description: "MetaMorpho WETH vault by Gauntlet, LRT-collateralised markets",
    vaultAddress: "0x4881Ef0BF6d2365D3dd6499ccd7532bcdBCE0658",
    chain: "eth-mainnet",
    protocol: "Morpho",
    asset: "WETH",
    riskLevel: "medium",
    riskFactors: ["smart contract", "oracle", "lrt collateral"],
    highlights: ["LRT exposure", "Quantified risk", "Professional management"],
    apy: 0.0634,
    tvl: 89_400_000,
  },
  // Re7 Vaults
  "morpho-re7-weth-eth": {
    slug: "morpho-re7-weth-eth",
    name: "Re7 WETH",
    description: "MetaMorpho WETH vault by Re7 Capital",
    vaultAddress: "0x78Fc2c2eD1A4cDb5402365934aE5648aDAd094d0",
    chain: "eth-mainnet",
    protocol: "Morpho",
    asset: "WETH",
    riskLevel: "medium",
    riskFactors: ["smart contract", "oracle", "strategy risk"],
    highlights: ["ETH-focused", "Specialized strategy", "Active rebalancing"],
    apy: 0.0549,
    tvl: 125_000_000,
  },

  // ===== MORPHO BLUE, BASE (live TVL + live APY) =====
  "moonwell-usdc-base": {
    slug: "moonwell-usdc-base",
    name: "Moonwell USDC (Base)",
    description: "Moonwell MetaMorpho USDC vault on Base",
    vaultAddress: "0xc1256Ae5FF1cf2719D4937adb3bbCCab2E00A2Ca",
    chain: "base-mainnet",
    protocol: "Morpho",
    asset: "USDC",
    riskLevel: "low",
    riskFactors: ["smart contract", "oracle"],
    highlights: ["Base-native", "Low fees", "Community governance"],
    apy: 0.0756,
    tvl: 78_500_000,
  },
};

// Helper functions
export function getAllOpportunities(): Opportunity[] {
  return Object.values(COMPLETE_VAULT_DATABASE);
}

export function getOpportunityBySlug(slug: string): Opportunity | null {
  return COMPLETE_VAULT_DATABASE[slug] || null;
}

export function getVaultsByChain(chain: string): Opportunity[] {
  return Object.values(COMPLETE_VAULT_DATABASE).filter((v) => v.chain === chain);
}

export function getVaultsByProtocol(protocol: string): Opportunity[] {
  return Object.values(COMPLETE_VAULT_DATABASE).filter((v) => v.protocol === protocol);
}

export function getVaultsByRiskLevel(riskLevel: string): Opportunity[] {
  return Object.values(COMPLETE_VAULT_DATABASE).filter((v) => v.riskLevel === riskLevel);
}

export function filterOpportunities(
  filters: {
    chain?: string;
    protocol?: string;
    riskLevel?: string;
    search?: string;
    minApy?: number;
    maxApy?: number;
  },
  base: Opportunity[] = Object.values(COMPLETE_VAULT_DATABASE)
): Opportunity[] {
  return base.filter((opp) => {
    if (filters.chain && opp.chain !== filters.chain) return false;
    if (filters.protocol && opp.protocol !== filters.protocol) return false;
    if (filters.riskLevel && opp.riskLevel !== filters.riskLevel) return false;
    if (filters.minApy && (!opp.apy || opp.apy < filters.minApy)) return false;
    if (filters.maxApy && (!opp.apy || opp.apy > filters.maxApy)) return false;

    if (filters.search) {
      const q = filters.search.toLowerCase();
      const matches =
        opp.name.toLowerCase().includes(q) ||
        opp.description.toLowerCase().includes(q) ||
        opp.protocol.toLowerCase().includes(q) ||
        opp.asset?.toLowerCase().includes(q);
      if (!matches) return false;
    }

    return true;
  });
}

export function sortOpportunities(
  opportunities: Opportunity[],
  sortBy: "name" | "apy-desc" | "apy-asc" | "tvl-desc" | "tvl-asc" = "apy-desc"
): Opportunity[] {
  const sorted = [...opportunities];

  switch (sortBy) {
    case "name":
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "apy-desc":
      sorted.sort((a, b) => (b.apy || 0) - (a.apy || 0));
      break;
    case "apy-asc":
      sorted.sort((a, b) => (a.apy || 0) - (b.apy || 0));
      break;
    case "tvl-desc":
      sorted.sort((a, b) => (b.tvl || 0) - (a.tvl || 0));
      break;
    case "tvl-asc":
      sorted.sort((a, b) => (a.tvl || 0) - (b.tvl || 0));
      break;
  }

  return sorted;
}

// Get statistics
export function getStatistics() {
  const vaults = getAllOpportunities();
  const totalTvl = vaults.reduce((sum, v) => sum + (v.tvl || 0), 0);
  const avgApy = vaults.length > 0 ? vaults.reduce((sum, v) => sum + (v.apy || 0), 0) / vaults.length : 0;
  const maxApy = Math.max(...vaults.map((v) => v.apy || 0));
  const chains = new Set(vaults.map((v) => v.chain)).size;
  const protocols = new Set(vaults.map((v) => v.protocol)).size;

  return {
    totalVaults: vaults.length,
    totalTvl,
    avgApy,
    maxApy,
    chains,
    protocols,
  };
}

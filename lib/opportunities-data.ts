import { type Opportunity } from "@/types/opportunity";

export const OPPORTUNITIES: Record<string, Opportunity> = {
  "steakhouse-usdc-eth": {
    slug: "steakhouse-usdc-eth",
    name: "Steakhouse USDC",
    description: "MetaMorpho USDC vault by Steakhouse Finance — allocates to Morpho Blue markets",
    vaultAddress: "0xbeef01735c132ada46aa9aa4c54623caa92a64cb",
    chain: "eth-mainnet",
    protocol: "Morpho",
    riskLevel: "low",
    riskFactors: ["smart contract", "oracle", "market risk"],
    highlights: ["High APY", "Battle-tested", "Active management"],
    apy: 0.0825,
    tvl: 285_000_000,
  },
  "steakhouse-usdt-eth": {
    slug: "steakhouse-usdt-eth",
    name: "Steakhouse USDT",
    description: "MetaMorpho USDT vault by Steakhouse Finance — rich Deposit/Withdraw tx history",
    vaultAddress: "0xbEef047a543E45807105E51A8BBEFCc5950fcfBa",
    chain: "eth-mainnet",
    protocol: "Morpho",
    riskLevel: "low",
    riskFactors: ["smart contract", "oracle"],
    highlights: ["Established vault", "High liquidity", "Transparent management"],
    apy: 0.0812,
    tvl: 156_000_000,
  },
  "gauntlet-weth-core-eth": {
    slug: "gauntlet-weth-core-eth",
    name: "Gauntlet WETH Core",
    description: "MetaMorpho WETH vault by Gauntlet — supplies to LRT-collateralised Morpho Blue markets",
    vaultAddress: "0x4881Ef0BF6d2365D3dd6499ccd7532bcdBCE0658",
    chain: "eth-mainnet",
    protocol: "Morpho",
    riskLevel: "medium",
    riskFactors: ["smart contract", "oracle", "lrt collateral"],
    highlights: ["LRT exposure", "Quantified risk", "Professional management"],
    apy: 0.0634,
    tvl: 89_400_000,
  },
  "gauntlet-usdc-core-eth": {
    slug: "gauntlet-usdc-core-eth",
    name: "Gauntlet USDC Core",
    description: "MetaMorpho USDC vault by Gauntlet — risk-optimised allocation across Morpho Blue",
    vaultAddress: "0x8eB67A509616cd6A7c1B3c8C21D48FF57df3d458",
    chain: "eth-mainnet",
    protocol: "Morpho",
    riskLevel: "low",
    riskFactors: ["smart contract", "oracle"],
    highlights: ["Risk-optimised", "Institutional-grade", "Diversified allocation"],
    apy: 0.0795,
    tvl: 412_000_000,
  },
  "moonwell-usdc-base": {
    slug: "moonwell-usdc-base",
    name: "Moonwell Flagship USDC",
    description: "Base-native MetaMorpho USDC vault curated by Moonwell governance",
    vaultAddress: "0xc1256Ae5FF1cf2719D4937adb3bbCCab2E00A2Ca",
    chain: "base-mainnet",
    protocol: "Morpho",
    riskLevel: "low",
    riskFactors: ["smart contract", "oracle"],
    highlights: ["Base-native", "Low fees", "Community governance"],
    apy: 0.0756,
    tvl: 78_500_000,
  },
  "re7-weth-eth": {
    slug: "re7-weth-eth",
    name: "Re7 WETH",
    description: "MetaMorpho WETH vault by Re7 Capital — focused on ETH-denominated yield strategies",
    vaultAddress: "0x78Fc2c2eD1A4cDb5402365934aE5648aDAd094d0",
    chain: "eth-mainnet",
    protocol: "Morpho",
    riskLevel: "medium",
    riskFactors: ["smart contract", "oracle", "strategy risk"],
    highlights: ["ETH-focused", "Specialized strategy", "Active rebalancing"],
    apy: 0.0549,
    tvl: 125_000_000,
  },
};

export function getAllOpportunities(): Opportunity[] {
  return Object.values(OPPORTUNITIES);
}

export function getOpportunityBySlug(slug: string): Opportunity | null {
  return OPPORTUNITIES[slug] || null;
}

export function filterOpportunities(
  opportunities: Opportunity[],
  filters: {
    chain?: string;
    protocol?: string;
    riskLevel?: string;
    search?: string;
  }
): Opportunity[] {
  return opportunities.filter((opp) => {
    if (filters.chain && opp.chain !== filters.chain) return false;
    if (filters.protocol && opp.protocol !== filters.protocol) return false;
    if (filters.riskLevel && opp.riskLevel !== filters.riskLevel) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const matches =
        opp.name.toLowerCase().includes(q) ||
        opp.description.toLowerCase().includes(q) ||
        opp.protocol.toLowerCase().includes(q);
      if (!matches) return false;
    }
    return true;
  });
}

export function sortOpportunities(
  opportunities: Opportunity[],
  sortBy: "name" | "apy-desc" | "apy-asc" | "tvl-desc" = "name"
): Opportunity[] {
  const sorted = [...opportunities];
  switch (sortBy) {
    case "name":
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    // APY sorting requires live data, handled in API route
  }
  return sorted;
}

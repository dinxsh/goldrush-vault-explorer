import { type Opportunity } from "@/types/opportunity";

export const OPPORTUNITIES: Record<string, Opportunity> = {
  // Morpho - Ethereum
  "steakhouse-usdc-eth": {
    slug: "steakhouse-usdc-eth",
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
  "steakhouse-usdt-eth": {
    slug: "steakhouse-usdt-eth",
    name: "Steakhouse USDT",
    description: "MetaMorpho USDT vault by Steakhouse Finance, rich Deposit/Withdraw tx history",
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
  "gauntlet-weth-core-eth": {
    slug: "gauntlet-weth-core-eth",
    name: "Gauntlet WETH Core",
    description: "MetaMorpho WETH vault by Gauntlet, supplies to LRT-collateralised Morpho Blue markets",
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
  "gauntlet-usdc-core-eth": {
    slug: "gauntlet-usdc-core-eth",
    name: "Gauntlet USDC Core",
    description: "MetaMorpho USDC vault by Gauntlet, risk-optimised allocation across Morpho Blue",
    vaultAddress: "0x8eB67A509616cd6A7c1B3c8C21D48FF57df3d458",
    chain: "eth-mainnet",
    protocol: "Morpho",
    asset: "USDC",
    riskLevel: "low",
    riskFactors: ["smart contract", "oracle"],
    highlights: ["Risk-optimised", "Institutional-grade", "Diversified allocation"],
    apy: 0.0795,
    tvl: 412_000_000,
  },
  "re7-weth-eth": {
    slug: "re7-weth-eth",
    name: "Re7 WETH",
    description: "MetaMorpho WETH vault by Re7 Capital, focused on ETH-denominated yield strategies",
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
  // Aave - Ethereum
  "aave-usdc-eth": {
    slug: "aave-usdc-eth",
    name: "Aave USDC",
    description: "Aave lending protocol USDC, earn interest from lending to traders",
    vaultAddress: "0xA2F987D4d84019e3fB4e24a58B0D9eF51B8d39ed",
    chain: "eth-mainnet",
    protocol: "Aave",
    asset: "USDC",
    riskLevel: "low",
    riskFactors: ["smart contract", "oracle"],
    highlights: ["Established protocol", "Native yield", "Liquidity"],
    apy: 0.045,
    tvl: 850_000_000,
  },
  // Curve - Ethereum
  "curve-3crv-eth": {
    slug: "curve-3crv-eth",
    name: "Curve 3CRV",
    description: "Curve 3pool LP, earn fees from stablecoin swaps",
    vaultAddress: "0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7",
    chain: "eth-mainnet",
    protocol: "Curve",
    asset: "3CRV",
    riskLevel: "low",
    riskFactors: ["smart contract", "liquidity"],
    highlights: ["Fee bearing", "High volume", "Composable"],
    apy: 0.0385,
    tvl: 950_000_000,
  },
  // Moonwell - Base
  "moonwell-usdc-base": {
    slug: "moonwell-usdc-base",
    name: "Moonwell Flagship USDC",
    description: "Base-native MetaMorpho USDC vault curated by Moonwell governance",
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
  // Aave - Polygon
  "aave-usdc-polygon": {
    slug: "aave-usdc-polygon",
    name: "Aave USDC (Polygon)",
    description: "Aave on Polygon, lower gas fees, faster transactions",
    vaultAddress: "0x625E7708f30cA6A280b064cb7e54f1C32FB13df0",
    chain: "matic-mainnet",
    protocol: "Aave",
    asset: "USDC",
    riskLevel: "low",
    riskFactors: ["smart contract", "layer2 risk"],
    highlights: ["Low gas", "Scaling solution", "ERC-4626"],
    apy: 0.0525,
    tvl: 320_000_000,
  },
  // Compound - Ethereum
  "compound-usdc-eth": {
    slug: "compound-usdc-eth",
    name: "Compound USDC",
    description: "Compound lending protocol, earn COMP rewards + interest",
    vaultAddress: "0x39AA39c021dfbaE8fac545936693ac917d5E7563",
    chain: "eth-mainnet",
    protocol: "Compound",
    asset: "USDC",
    riskLevel: "low",
    riskFactors: ["smart contract", "governance"],
    highlights: ["COMP rewards", "Governance token", "Established"],
    apy: 0.0405,
    tvl: 620_000_000,
  },
  // Yearn - Ethereum
  "yearn-usdc-eth": {
    slug: "yearn-usdc-eth",
    name: "Yearn USDC",
    description: "Yearn strategy vault, automated yield optimization",
    vaultAddress: "0xa354F35829Ae477e64B92D4e7addBE43b953FFC2",
    chain: "eth-mainnet",
    protocol: "Yearn",
    asset: "USDC",
    riskLevel: "medium",
    riskFactors: ["smart contract", "strategy risk"],
    highlights: ["Auto-compounding", "Strategy rotation", "Professional management"],
    apy: 0.061,
    tvl: 185_000_000,
  },
  // Lido - Ethereum
  "lido-eth": {
    slug: "lido-eth",
    name: "Lido stETH",
    description: "Liquid staking for Ethereum, stake without locking 32 ETH",
    vaultAddress: "0xae7ab96520DE3A18E5e111B5EaAc2D6F0b82F2fC",
    chain: "eth-mainnet",
    protocol: "Lido",
    asset: "ETH",
    riskLevel: "medium",
    riskFactors: ["smart contract", "validator risk"],
    highlights: ["Liquid staking", "Ethereum native", "Composable"],
    apy: 0.032,
    tvl: 32_400_000_000,
  },
  // Rocket Pool - Ethereum
  "rocketpool-eth": {
    slug: "rocketpool-eth",
    name: "Rocket Pool rETH",
    description: "Decentralized liquid staking, run your own node",
    vaultAddress: "0xae78eb9030eb3a280d256a300ee4461551d50328",
    chain: "eth-mainnet",
    protocol: "Rocket Pool",
    asset: "ETH",
    riskLevel: "medium",
    riskFactors: ["smart contract", "operator risk"],
    highlights: ["Decentralized", "Variable yield", "Governance"],
    apy: 0.035,
    tvl: 1_850_000_000,
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

import { type SupportedChain } from "./vault";

export interface Opportunity {
  slug: string;
  name: string;
  description: string;
  vaultAddress: string;
  chain: SupportedChain;
  protocol: "Morpho" | "Aave" | "Euler" | "Compound" | "Yearn";
  riskLevel: "low" | "medium" | "high";
  riskFactors: string[];
  highlights: string[];
}

export interface OpportunityWithMetrics extends Opportunity {
  apy: number | null;
  tvl: number;
  apyChange24h: number;
  updatedAt: number;
}

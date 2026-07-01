import { type SupportedChain } from "@/types/vault";

// Protocol deployment URLs - maps protocols to their main application URLs
export const PROTOCOL_URLS: Record<string, string> = {
  "Morpho": "https://app.morpho.org",
  "Aave": "https://app.aave.com",
  "Curve": "https://curve.fi",
  "Yearn": "https://yearn.fi",
  "Compound": "https://compound.finance",
  "Lido": "https://lido.fi",
  "Rocket Pool": "https://rocketpool.net",
  "Pendle": "https://app.pendle.finance",
  "Convex": "https://www.convexfinance.com",
  "Balancer": "https://app.balancer.fi",
  "Uniswap": "https://app.uniswap.org",
  "Gearbox": "https://gearbox.fi",
  "EigenLayer": "https://app.eigenlayer.xyz",
  "Sommelier": "https://app.sommelier.finance",
  "GMX": "https://app.gmx.io",
  "Camelot": "https://app.camelotswap.xyz",
  "Radiant": "https://radiant.capital",
  "Beethoven": "https://app.beets.fi",
  "Aerodrome": "https://aerodrome.finance",
  "QuickSwap": "https://quickswap.exchange",
  "Moonwell": "https://moonwell.fi",
};

// Get deployment URL for a protocol
export function getProtocolUrl(protocol: string): string {
  return PROTOCOL_URLS[protocol] || "https://defi.llama.fi";
}

// Morpho routes vaults at /{chainSlug}/vault/{address}. These are the chains
// Morpho actually supports (verified against their network switcher) — note
// Optimism is not one of them, so we fall back to the vault list there.
const MORPHO_CHAIN_SLUG: Partial<Record<SupportedChain, string>> = {
  "eth-mainnet": "ethereum",
  "base-mainnet": "base",
  "matic-mainnet": "polygon",
  "arbitrum-mainnet": "arbitrum",
};

// Yearn routes vaults at /vaults/{numericChainId}/{address}.
const YEARN_CHAIN_ID: Partial<Record<SupportedChain, number>> = {
  "eth-mainnet": 1,
  "optimism-mainnet": 10,
  "matic-mainnet": 137,
  "base-mainnet": 8453,
  "arbitrum-mainnet": 42161,
};

// Build the deep link that drops the user straight onto the vault they selected,
// rather than the protocol's generic landing page. Falls back to a sensible list
// page when we can't construct a direct link (unknown chain / missing address).
export function getProtocolDeployUrl(
  protocol: string,
  opts: { vaultAddress?: string; chain?: SupportedChain; asset?: string } = {}
): string {
  const { vaultAddress, chain, asset } = opts;
  const baseUrl = getProtocolUrl(protocol);

  switch (protocol) {
    case "Morpho": {
      const slug = chain ? MORPHO_CHAIN_SLUG[chain] : undefined;
      if (slug && vaultAddress) return `https://app.morpho.org/${slug}/vault/${vaultAddress}`;
      return "https://app.morpho.org/vaults";
    }
    case "Yearn": {
      const id = chain ? YEARN_CHAIN_ID[chain] : undefined;
      if (id && vaultAddress) return `https://yearn.fi/vaults/${id}/${vaultAddress}`;
      return "https://yearn.fi/vaults";
    }
    case "Aave":
      return baseUrl;
    case "Curve":
      return `${baseUrl}/pools`;
    case "Compound":
      return baseUrl;
    case "Uniswap":
      return `${baseUrl}/position/create?defaultTokens=${asset || ""}`;
    default:
      return baseUrl;
  }
}

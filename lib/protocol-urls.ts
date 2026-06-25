// Protocol deployment URLs - maps protocols to their main application URLs
export const PROTOCOL_URLS: Record<string, string> = {
  "Morpho": "https://app.morpho.org",
  "Aave": "https://app.aave.com",
  "Curve": "https://curve.fi",
  "Yearn": "https://yearn.finance",
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

// Get protocol name for URL building
export function getProtocolDeployUrl(protocol: string, asset?: string, chain?: string): string {
  const baseUrl = getProtocolUrl(protocol);

  // Add protocol-specific parameters if needed
  switch (protocol) {
    case "Morpho":
      return `${baseUrl}/ethereum/markets`;
    case "Aave":
      return `${baseUrl}`;
    case "Curve":
      return `${baseUrl}/pools`;
    case "Yearn":
      return `${baseUrl}/vaults`;
    case "Compound":
      return `${baseUrl}`;
    case "Uniswap":
      return `${baseUrl}/position/create?defaultTokens=${asset || ""}`;
    default:
      return baseUrl;
  }
}

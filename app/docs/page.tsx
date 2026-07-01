export default function DocsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
          GoldRush Vault Explorer
        </h1>
        <p className="mt-4 text-lg" style={{ color: "var(--text-secondary)" }}>
          Discover, analyze, and manage yield opportunities across DeFi protocols.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            What is GoldRush?
          </h2>
          <p className="mt-3" style={{ color: "var(--text-secondary)" }}>
            GoldRush Vault Explorer is your gateway to optimized DeFi yields. We aggregate vetted vaults across multiple protocols and chains, helping you find the best risk-adjusted returns without the complexity.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Key Features
          </h2>
          <ul className="mt-3 space-y-2" style={{ color: "var(--text-secondary)" }}>
            <li>✓ <strong>Multi-Chain</strong> - Access vaults on Ethereum, Base, Polygon, Arbitrum, Optimism, and more</li>
            <li>✓ <strong>Verified Protocols</strong> - Only audited, battle-tested strategies</li>
            <li>✓ <strong>Real-time Yields</strong> - Live APY data updated every block</li>
            <li>✓ <strong>Risk Analysis</strong> - Transparent risk factors for each vault</li>
            <li>✓ <strong>Cross-chain Comparison</strong> - Compare yields across all chains in one place</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Getting Started
          </h2>
          <p className="mt-3" style={{ color: "var(--text-secondary)" }}>
            Explore yield opportunities by navigating to the{" "}
            <a href="/" className="font-semibold" style={{ color: "var(--accent)" }}>
              Earn
            </a>
            {" "}section. Filter by chain, protocol, and risk level to find strategies matching your goals.
          </p>
        </div>
      </div>
    </div>
  );
}

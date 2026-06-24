export default function StrategiesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
          Strategy Guide
        </h1>
        <p className="mt-2" style={{ color: "var(--text-secondary)" }}>
          Choose the right approach for your yield goals
        </p>
      </div>

      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Conservative: Maximum Safety
          </h2>
          <p className="mt-3" style={{ color: "var(--text-secondary)" }}>
            Choose blue-chip protocols with extensive audit histories. Focus on:
          </p>
          <ul className="mt-2 space-y-1 ml-4" style={{ color: "var(--text-secondary)" }}>
            <li>• <strong>Aave</strong> — Industry standard lending protocol</li>
            <li>• <strong>Curve</strong> — Stable and battle-tested AMM</li>
            <li>• <strong>Morpho</strong> — Optimized lending with strong risk controls</li>
          </ul>
          <p className="mt-3" style={{ color: "var(--text-secondary)" }}>
            <strong>Expected APY:</strong> 3–5%
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Balanced: Yield with Risk Management
          </h2>
          <p className="mt-3" style={{ color: "var(--text-secondary)" }}>
            Diversify across mid-tier protocols and strategies. Consider:
          </p>
          <ul className="mt-2 space-y-1 ml-4" style={{ color: "var(--text-secondary)" }}>
            <li>• <strong>Morpho MetaMorpho</strong> — Active vault managers optimizing allocation</li>
            <li>• <strong>Yearn Strategies</strong> — Professional yield optimization</li>
            <li>• <strong>Compound</strong> — Governance-token rewards</li>
          </ul>
          <p className="mt-3" style={{ color: "var(--text-secondary)" }}>
            <strong>Expected APY:</strong> 5–10%
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Growth: Maximum Yield
          </h2>
          <p className="mt-3" style={{ color: "var(--text-secondary)" }}>
            Target emerging protocols and new opportunities with higher risk. Options:
          </p>
          <ul className="mt-2 space-y-1 ml-4" style={{ color: "var(--text-secondary)" }}>
            <li>• <strong>Emerging Morpho Vaults</strong> — New strategies with high APY</li>
            <li>• <strong>Multi-chain Arbitrage</strong> — Exploit cross-chain yield gaps</li>
            <li>• <strong>New Protocol Incentives</strong> — Bootstrap rewards programs</li>
          </ul>
          <p className="mt-3" style={{ color: "var(--text-secondary)" }}>
            <strong>Expected APY:</strong> 10%+
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Multi-Chain Arbitrage
          </h2>
          <p className="mt-3" style={{ color: "var(--text-secondary)" }}>
            Yield varies significantly across chains due to liquidity and demand. Monitor rates on:
          </p>
          <ul className="mt-2 space-y-1 ml-4" style={{ color: "var(--text-secondary)" }}>
            <li>• <strong>Ethereum</strong> — Largest TVL, most stable rates</li>
            <li>• <strong>Base</strong> — Emerging, often higher APY</li>
            <li>• <strong>Polygon</strong> — Lower gas, growing ecosystem</li>
          </ul>
          <p className="mt-3" style={{ color: "var(--text-secondary)" }}>
            Deploy capital where yields are highest, adjusting as opportunities shift.
          </p>
        </section>
      </div>
    </div>
  );
}

export default function HowItWorksPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
          How It Works
        </h1>
        <p className="mt-2" style={{ color: "var(--text-secondary)" }}>
          Understanding DeFi vaults and yield strategies
        </p>
      </div>

      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Vaults Explained
          </h2>
          <p className="mt-3" style={{ color: "var(--text-secondary)" }}>
            A vault is a smart contract that automates yield farming. You deposit your assets, and the vault's strategy automatically deploys capital to the best-yielding opportunities.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Yield Sources
          </h2>
          <div className="mt-3 space-y-2" style={{ color: "var(--text-secondary)" }}>
            <p><strong>Lending Interest:</strong> When you deposit into a lending protocol like Aave or Morpho, borrowers pay interest on your assets.</p>
            <p><strong>Trading Fees:</strong> AMM protocols like Curve generate fees from swap volume.</p>
            <p><strong>Rewards:</strong> Protocols incentivize liquidity with governance or native token rewards.</p>
            <p><strong>Staking Rewards:</strong> Proof-of-Stake networks pay validators and stakers for securing the network.</p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Why Use Vaults?
          </h2>
          <ul className="mt-3 space-y-2 ml-4" style={{ color: "var(--text-secondary)" }}>
            <li>• <strong>Automation</strong> — Earn on the best opportunities without constant monitoring</li>
            <li>• <strong>Diversification</strong> — Spread risk across multiple protocols</li>
            <li>• <strong>Gas Efficiency</strong> — Batch deposits to save on transaction costs</li>
            <li>• <strong>Rebalancing</strong> — Automatically move capital to maintain target allocation</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Risk Considerations
          </h2>
          <p className="mt-3" style={{ color: "var(--text-secondary)" }}>
            All yield comes with risk. Smart contract bugs, oracle failures, and market volatility can impact returns. We categorize vaults by risk level and provide detailed risk factors for each opportunity.
          </p>
        </section>
      </div>
    </div>
  );
}

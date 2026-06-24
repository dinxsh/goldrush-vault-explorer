export default function GettingStartedPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
          Getting Started
        </h1>
        <p className="mt-2" style={{ color: "var(--text-secondary)" }}>
          Start earning yield in minutes
        </p>
      </div>

      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            1. Connect Your Wallet
          </h2>
          <p className="mt-3" style={{ color: "var(--text-secondary)" }}>
            Click the "Connect Wallet" button to link your Web3 wallet. We support MetaMask, WalletConnect, and hardware wallets.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            2. Browse Opportunities
          </h2>
          <p className="mt-3" style={{ color: "var(--text-secondary)" }}>
            Navigate to the Opportunities section and explore available vaults. Filter by:
          </p>
          <ul className="mt-2 space-y-1 ml-4" style={{ color: "var(--text-secondary)" }}>
            <li>• <strong>Chain</strong> — Select your preferred blockchain</li>
            <li>• <strong>Protocol</strong> — Choose lending platforms or strategies</li>
            <li>• <strong>Risk Level</strong> — Match your risk tolerance</li>
            <li>• <strong>APY</strong> — Sort by yield to find high performers</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            3. Analyze Details
          </h2>
          <p className="mt-3" style={{ color: "var(--text-secondary)" }}>
            Click on any vault to see:
          </p>
          <ul className="mt-2 space-y-1 ml-4" style={{ color: "var(--text-secondary)" }}>
            <li>• Current APY and 24-hour changes</li>
            <li>• Total Value Locked (TVL)</li>
            <li>• Risk factors and audit status</li>
            <li>• Protocol details and strategy explanation</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            4. Deposit & Earn
          </h2>
          <p className="mt-3" style={{ color: "var(--text-secondary)" }}>
            Once you've selected a vault:
          </p>
          <ul className="mt-2 space-y-1 ml-4" style={{ color: "var(--text-secondary)" }}>
            <li>• Approve the token for the vault contract</li>
            <li>• Enter your deposit amount</li>
            <li>• Confirm the transaction in your wallet</li>
            <li>• Start earning yield immediately</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            5. Manage Your Position
          </h2>
          <p className="mt-3" style={{ color: "var(--text-secondary)" }}>
            Track your deposits, earned yield, and performance. Withdraw anytime — no lock-up periods.
          </p>
        </section>
      </div>
    </div>
  );
}

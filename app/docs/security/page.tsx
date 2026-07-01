export default function SecurityPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
          Security & Audits
        </h1>
        <p className="mt-2" style={{ color: "var(--text-secondary)" }}>
          How we verify protocol safety
        </p>
      </div>

      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Audit Standards
          </h2>
          <p className="mt-3" style={{ color: "var(--text-secondary)" }}>
            All protocols in GoldRush have been audited by reputable firms:
          </p>
          <ul className="mt-2 space-y-1 ml-4" style={{ color: "var(--text-secondary)" }}>
            <li>• <strong>OpenZeppelin</strong> - Industry-leading security audits</li>
            <li>• <strong>Trail of Bits</strong> - Advanced smart contract analysis</li>
            <li>• <strong>Quantstamp</strong> - Independent security assessments</li>
            <li>• <strong>CertiK</strong> - Formal verification specialists</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Protocol Safety Checks
          </h2>
          <p className="mt-3" style={{ color: "var(--text-secondary)" }}>
            We evaluate each protocol on:
          </p>
          <ul className="mt-2 space-y-1 ml-4" style={{ color: "var(--text-secondary)" }}>
            <li>• <strong>Code Quality</strong> - Clean, well-documented smart contracts</li>
            <li>• <strong>Battle-testing</strong> - Minimum 1 year on mainnet</li>
            <li>• <strong>TVL & Adoption</strong> - Significant locked value proves stability</li>
            <li>• <strong>Team Reputation</strong> - Experienced, transparent developers</li>
            <li>• <strong>Governance</strong> - Community-aligned decision-making</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Risk Disclosure
          </h2>
          <p className="mt-3" style={{ color: "var(--text-secondary)" }}>
            Even audited protocols carry risks. We're transparent about:
          </p>
          <ul className="mt-2 space-y-1 ml-4" style={{ color: "var(--text-secondary)" }}>
            <li>• <strong>Smart Contract Risk</strong> - Potential bugs or exploits</li>
            <li>• <strong>Oracle Risk</strong> - Price feed failures could trigger liquidations</li>
            <li>• <strong>Market Risk</strong> - Volatility impacts collateral values</li>
            <li>• <strong>Operational Risk</strong> - Team decisions or governance attacks</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Your Funds
          </h2>
          <p className="mt-3" style={{ color: "var(--text-secondary)" }}>
            <strong>Self-Custody:</strong> You always control your private keys. GoldRush never holds your funds - we're just a discovery and analytics tool.
          </p>
          <p className="mt-3" style={{ color: "var(--text-secondary)" }}>
            <strong>Approval Security:</strong> Before depositing, you approve only the amount and vault you choose. Revoke approval anytime in your wallet.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            What We Don't Do
          </h2>
          <p className="mt-3" style={{ color: "var(--text-secondary)" }}>
            ✗ We don't guarantee returns - yields vary based on market conditions
          </p>
          <p className="mt-3" style={{ color: "var(--text-secondary)" }}>
            ✗ We don't conduct our own audits - we curate audited protocols
          </p>
          <p className="mt-3" style={{ color: "var(--text-secondary)" }}>
            ✗ We don't hold or manage your assets - you do
          </p>
        </section>
      </div>
    </div>
  );
}

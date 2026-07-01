export default function FAQPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
          Frequently Asked Questions
        </h1>
      </div>

      <div className="space-y-6">
        <section>
          <h3 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            How do I start earning?
          </h3>
          <p className="mt-2" style={{ color: "var(--text-secondary)" }}>
            Connect your wallet, browse opportunities, and deposit. Yield starts accruing immediately. No lock-ups - withdraw anytime.
          </p>
        </section>

        <section>
          <h3 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            Is my capital safe?
          </h3>
          <p className="mt-2" style={{ color: "var(--text-secondary)" }}>
            All vaults are audited, but no protocol is risk-free. Start small, diversify, and only invest what you can afford to lose. Check each vault's risk factors before depositing.
          </p>
        </section>

        <section>
          <h3 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            What's the difference between APY and APR?
          </h3>
          <p className="mt-2" style={{ color: "var(--text-secondary)" }}>
            <strong>APR</strong> is simple interest (no compounding). <strong>APY</strong> accounts for compounding, so your actual return is higher. We display APY - your real yield.
          </p>
        </section>

        <section>
          <h3 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            Can I withdraw anytime?
          </h3>
          <p className="mt-2" style={{ color: "var(--text-secondary)" }}>
            Yes. Most vaults have no lock-up period. Withdraw by submitting a transaction to the vault contract. Note: gas fees and market slippage may apply.
          </p>
        </section>

        <section>
          <h3 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            What are the fees?
          </h3>
          <p className="mt-2" style={{ color: "var(--text-secondary)" }}>
            Vault fees vary. MetaMorpho vaults charge management fees (typically 1–2%). Lending protocols may charge interest spread fees. Deposit/withdraw costs are gas fees paid to the network. Check individual vault details.
          </p>
        </section>

        <section>
          <h3 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            Why is APY different across chains?
          </h3>
          <p className="mt-2" style={{ color: "var(--text-secondary)" }}>
            Rates depend on supply and demand. Ethereum has massive TVL and stable rates. Newer chains like Base may offer higher rates to bootstrap liquidity. This creates arbitrage opportunities.
          </p>
        </section>

        <section>
          <h3 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            How is TVL calculated?
          </h3>
          <p className="mt-2" style={{ color: "var(--text-secondary)" }}>
            TVL (Total Value Locked) is the USD value of all assets in a vault. Higher TVL often means more stability and lower slippage. It's a gauge of protocol adoption, not a guarantee of returns.
          </p>
        </section>

        <section>
          <h3 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            Can yields go negative?
          </h3>
          <p className="mt-2" style={{ color: "var(--text-secondary)" }}>
            In lending protocols, no - you earn interest. In staking, validator penalties could reduce your balance. In AMM pools, impermanent loss could reduce your share value. Always review risk factors.
          </p>
        </section>

        <section>
          <h3 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            How often are yields updated?
          </h3>
          <p className="mt-2" style={{ color: "var(--text-secondary)" }}>
            We fetch live APY data from on-chain protocols. Rates update continuously as transactions occur. The UI refreshes periodically to show current yields.
          </p>
        </section>

        <section>
          <h3 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            Do I need KYC to use GoldRush?
          </h3>
          <p className="mt-2" style={{ color: "var(--text-secondary)" }}>
            No. GoldRush is a discovery tool - you interact directly with protocols via your wallet. No registration, KYC, or central platform. Complete sovereignty.
          </p>
        </section>

        <section>
          <h3 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            Is GoldRush an investment advisor?
          </h3>
          <p className="mt-2" style={{ color: "var(--text-secondary)" }}>
            No. GoldRush is a research and analytics platform. We provide information, not financial advice. Always do your own research before investing.
          </p>
        </section>
      </div>
    </div>
  );
}

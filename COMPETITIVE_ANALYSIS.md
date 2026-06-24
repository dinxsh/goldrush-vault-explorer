# GoldRush Vault Explorer - Competitive Analysis & Product Strategy
## Senior TPM Analysis (10+ YOE Building Onchain Products)

**Document Date:** 2026-06-25  
**Status:** Strategic Planning  
**Prepared By:** Senior Technical Product Manager

---

## Executive Summary

GoldRush has a **unique positioning opportunity** as the Covalent-backed vault discovery layer. We're competing against:
- **vaults.fyi** — broad vault aggregator, UI lacks polish
- **Quicknode Earn** — concentrated on Quicknode infrastructure, feature-rich but closed ecosystem
- **Yearn Finance** — yield aggregation with active portfolio management
- **DefiLlama Vaults** — data-focused, minimal UX

**Our Strategic Advantage:** We have Covalent's data infrastructure (indexed blockchain data), direct access to real-time vault metrics, and can be the **canonical discovery layer** for the entire DeFi vault ecosystem—not just proprietary vaults.

**Time to Market:** 8-12 weeks to competitive parity, 4-6 months to market leadership.

---

## 1. COMPETITIVE LANDSCAPE MAPPING

### 1.1 Direct Competitors

#### **vaults.fyi**
- **What they do:** Aggregates yield opportunities across Ethereum, Arbitrum, Optimism, Base, Polygon, Avalanche
- **Strengths:**
  - Broadest vault coverage (200+ unique vaults)
  - Multi-chain support baked in
  - Simple, functional UI (Vercel deployed, Next.js)
  - Open data philosophy
  - Strong DEX yields + lending protocol coverage
  - API endpoint for programmatic access
  
- **Weaknesses:**
  - UI/UX is dated (2023 aesthetic)
  - No real-time data updates (cached, hourly refresh)
  - Minimal onboarding for users unfamiliar with vaults
  - No portfolio tracking
  - Limited risk stratification
  - No strategy customization
  - Mobile experience is poor

#### **Quicknode Earn**
- **What they do:** Proprietary vault platform for Quicknode users
- **Strengths:**
  - Excellent UI/UX (modern design system)
  - Real-time yield tracking with APY charts
  - Strategy customization (chain selection, vault parameters, rebalancing rules)
  - Time-windowed APY analytics (5m, 10m, 30m, 1h, 2h, 4h, 6h)
  - Cross-chain rebalancing recommendations
  - Top vaults by APY with visual hierarchy
  - Comprehensive onboarding ("Why Quicknode Earn" section)
  - Professional trading-grade features (portfolio optimization, backtesting)
  
- **Weaknesses:**
  - Closed ecosystem (only Quicknode vaults + selected partners)
  - Requires Quicknode RPC subscription for full features
  - Limited to ~20 featured vaults
  - High UX sophistication may confuse retail users
  - Vertical market focus (Quicknode customers only)

#### **Yearn Finance**
- **What they do:** Active portfolio management with algorithmic rebalancing
- **Strengths:**
  - Sophisticated yield optimization
  - Real historical performance tracking
  - Community governance
  - Single-chain deep dive (Ethereum)
  - Robust smart contracts
  
- **Weaknesses:**
  - User onboarding is complex
  - Limited multi-chain presence
  - UI is for power users only
  - No educational content for beginners
  - Requires direct vault interactions (no aggregated view)

#### **DefiLlama Vaults**
- **What they do:** Data aggregation for vault metrics
- **Strengths:**
  - Authoritative data source
  - Very broad coverage
  - API-first design
  
- **Weaknesses:**
  - Zero UX (CSV export style)
  - No user-facing platform
  - No portfolio features
  - No strategy guidance

---

## 2. VAULT ECOSYSTEM MAP (All Known Platforms)

### 2.1 Vault Data Sources & Protocols

#### **By Ecosystem:**

**Ethereum (Core Hub)**
- Morpho Blue (MetaMorpho vaults)
  - Steakhouse vaults (USDC, USDT)
  - Gauntlet vaults (USDC, WETH)
  - Re7 Capital vaults (WETH)
  - Moonwell Flagship (USDC on Base)
  - **Estimated coverage:** 80+ active Morpho vaults

- Aave (Lending)
  - V3 implementation
  - ~15 assets, multiple chains
  - **Estimated vaults:** 40+

- Curve (AMM + LPs)
  - Stable pools (3CRV, FRAX, LUSD)
  - **Estimated LPs:** 60+

- Yearn (Active strategies)
  - V3 vaults
  - **Estimated strategies:** 25+

- Compound (Lending)
  - Established lending
  - **Estimated vaults:** 10+

- Lido (Liquid staking)
  - stETH, wstETH, liquid staking derivatives
  - **Estimated products:** 3+

- Rocket Pool (Decentralized staking)
  - rETH
  - **Estimated products:** 1+

**Layer 2s**
- **Arbitrum:** Chronos, Radiant, Jupiter (launches), Dopex
- **Optimism:** Aave, Uniswap, Velodrome, Beethoven
- **Base:** Aave, Uniswap V4, Aerodrome, Lido
- **Polygon:** Aave, Curve, Balancer, Quickswap
- **Avalanche:** Aave, Curve, Trader Joe

**Emerging Protocols**
- Pendle (Yield trading, yields NFTs)
- Gearbox (Leveraged yield farming)
- Sommelier (Active portfolio management)
- EigenLayer (Restaking yields)

### 2.2 Total Market Addressable

**Conservative Estimate:** 300-500 distinct yield opportunities across all chains
- ETH: 150-200
- Arbitrum: 60-80
- Polygon: 50-70
- Base: 40-60
- Optimism: 40-60
- Others: 20-30

**Current GoldRush Coverage:** 16 (3-4% of market)
**vaults.fyi Coverage:** ~200 (40-50% of market)
**DefiLlama Coverage:** ~400+ (80%+ of market)

---

## 3. FEATURE COMPETITIVE MATRIX

| Feature | GoldRush | vaults.fyi | Quicknode Earn | Yearn | DefiLlama |
|---------|----------|-----------|-----------------|-------|-----------|
| **Vault Discovery** | 3.5/10 | 8/10 | 6/10 | 4/10 | 9/10 |
| Vault count | 16 | 200+ | 20 | 25 | 400+ |
| Multi-chain support | 3 (E, B, P) | 6 (E, Arb, Op, B, P, Av) | 5 | 1 | 6 |
| Real-time APY | ✓ | ✗ (hourly) | ✓ | ✓ | ✗ (daily) |
| **UI/UX** | 6/10 | 5/10 | 9/10 | 4/10 | 2/10 |
| Dark theme | ✓ | ✗ | ✓ | ✗ | ✗ |
| Mobile responsive | 7/10 | 6/10 | 9/10 | 5/10 | 3/10 |
| Onboarding docs | 7/10 | 3/10 | 9/10 | 2/10 | 0/10 |
| Visual polish | 7/10 | 4/10 | 9/10 | 3/10 | 2/10 |
| **Analytics** | 3/10 | 4/10 | 9/10 | 8/10 | 7/10 |
| APY charts (time windows) | ✗ | ✗ | ✓ | ✓ | ✗ |
| Risk scoring | ✓ | ✗ | ✓ | ✓ | ✗ |
| Historical performance | ✗ | ✗ | ✓ | ✓ | ✗ |
| Comparative analysis | ✗ | Limited | ✓ | ✗ | ✓ |
| **Portfolio Management** | 0/10 | 0/10 | 6/10 | 8/10 | 0/10 |
| Deposit tracking | ✗ | ✗ | ✓ | ✓ | ✗ |
| Earned yield tracking | ✗ | ✗ | ✓ | ✓ | ✗ |
| Portfolio optimization | ✗ | ✗ | Partial | ✓ | ✗ |
| **Strategies** | 1/10 | 0/10 | 9/10 | 8/10 | 0/10 |
| Strategy guides | ✓ | ✗ | ✓ | ✗ | ✗ |
| Custom strategy builder | ✗ | ✗ | ✓ | ✗ | ✗ |
| Rebalancing automation | ✗ | ✗ | ✓ | ✓ | ✗ |
| Cross-chain optimization | ✗ | ✗ | ✓ | ✗ | ✗ |
| **Data Quality** | 7/10 | 6/10 | 8/10 | 9/10 | 9/10 |
| Audit information | ✓ | Partial | ✓ | ✓ | ✗ |
| Risk factors | ✓ | Minimal | ✓ | ✓ | ✗ |
| TVL accuracy | Good | Good | Excellent | Excellent | Excellent |
| **Developer Experience** | 5/10 | 7/10 | 0/10 | 6/10 | 9/10 |
| Public API | ✗ | ✓ | ✗ | ✓ | ✓ |
| Open data | ✗ | ✓ | ✗ | Partial | ✓ |
| Webhooks | ✗ | ✗ | ✗ | ✗ | ✗ |

**GoldRush Score:** 4.8/10 (Early Stage)  
**Gap Analysis:** Needs 200+ more vaults, portfolio tracking, and advanced analytics to be competitive.

---

## 4. FEATURE ROADMAP (12-Month Horizon)

### **Phase 1: Foundation (Weeks 1-8) — Competitive Parity**

#### 4.1.1 Vault Data Expansion (2-3 weeks)
**Goal:** From 16 → 150+ vaults across 6 chains

- **Data Sources to Integrate:**
  1. Morpho Blue (smart contract scanning + subgraph)
  2. Aave V3 (subgraph + REST API)
  3. Curve (subgraph + on-chain)
  4. Yearn V3 (subgraph)
  5. Compound (subgraph)
  6. Lido / Rocket Pool (APIs)
  7. Pendle (subgraph)
  8. Gearbox (subgraph)
  9. Sommelier (REST API)
  10. EigenLayer (REST API)

- **Implementation Approach:**
  - Create automated vault discovery service
  - Use Covalent's indexed data + subgraphs
  - Build data pipeline: Raw Data → Normalization → Validation → Serving
  - Update every 10 minutes (vs vaults.fyi's hourly)

- **Deliverable:**
  - API endpoint returning all 150+ vaults with standardized schema
  - UI shows all available vaults
  - Multi-chain filtering works

#### 4.1.2 Real-Time Metrics (2-3 weeks)
**Goal:** Live APY, TVL, and 24h change tracking

- **Features:**
  - Sub-minute APY updates (vs hourly)
  - Live TVL from blockchain state
  - 24h APY change calculation
  - Risk scoring from audit status + TVL

- **Implementation:**
  - Contract event listeners for deposits/withdrawals
  - Covalent transaction/balance API calls
  - Redis caching for performance
  - Webhook to update frontend in real-time

- **Deliverable:**
  - Detail pages show "Updated 2 seconds ago" (not hours)
  - APY changes visible immediately
  - TVL reflects current chain state

#### 4.1.3 UX Improvements (2-3 weeks)
**Goal:** Quicknode Earn level polish

- **Quick Wins:**
  - Responsive table view (sortable, filterable, paginated)
  - Search across vault names, protocols, chains
  - Favorite/bookmark vaults (localStorage)
  - Copy vault address button
  - One-click "View on Etherscan" for verification
  - Better visual hierarchy (APY as first signal)
  - Color-coded risk badges (green/orange/red)

- **Deliverable:**
  - Vaults page shows all 150+ in grid + table
  - Search/filter responsive (subsecond)
  - Mobile view optimized

---

### **Phase 2: Differentiation (Weeks 9-20) — Market Leadership**

#### 4.2.1 Portfolio Tracking
**Goal:** Users can deposit & track earnings

- **Features:**
  - Connect wallet → auto-detect vault positions
  - Dashboard showing:
    - Total invested across vaults
    - Current USD value
    - Earned yield (USD + APY equivalent)
    - Breakdown by chain/protocol
  - Historical performance chart
  - Deposit/withdraw UI
  - P&L tracking

- **Technical:**
  - ERC-4626 standard reading
  - Share price tracking over time
  - Balance queries via Covalent API
  - On-chain position aggregation

#### 4.2.2 Analytics & Insights
**Goal:** Compete with Quicknode Earn's charting

- **Features:**
  - APY history charts (6h, 1d, 7d, 30d, 90d)
  - APY ranges by time window
  - Top performers section (sortable)
  - Risk vs Return scatter plot
  - "Market Intelligence" showing:
    - Flow trends (money flowing in/out)
    - Emerging opportunities
    - Risk changes (audits, governance changes)

- **Deliverable:**
  - Beautiful interactive charts (Recharts or Plotly)
  - Vault comparison view (side-by-side)

#### 4.2.3 Strategy Builder
**Goal:** Custom portfolio construction

- **Features:**
  - Guided questionnaire (risk tolerance, chains, assets)
  - Auto-recommend vault mix (5-10 vaults)
  - Manual builder:
    - Select chain
    - Filter by risk level
    - Compare APY/TVL
    - Adjust allocation percentages
    - See blended APY calculation
  - Save strategy (shareable link)
  - Simulation: "If you invested $X, you'd earn $Y over 1 year"

- **Deliverable:**
  - Strategy recommendation flow
  - Strategy save/share URLs
  - Basic backtest

---

### **Phase 3: Ecosystem Integration (Weeks 21-26)**

#### 4.3.1 Cross-Chain Rebalancing
**Goal:** Recommend rebalancing to maximize yield

- **Features:**
  - Automatic rebalancing suggestions
  - "Move $X from Curve (4.2% APY) to Morpho (8.2% APY)"
  - Gas fee estimation
  - One-click rebalance (contract interaction)
  - Rebalancing history

#### 4.3.2 Advanced Features
- Yield farming signals (upcoming opportunities)
- Integration with Covalent's price oracle
- Tax reporting export (CSV of all transactions)
- Governance token tracking (COMP, AAVE, CRV, YFI earned)

---

## 5. VAULT DATA COLLECTION STRATEGY

### 5.1 Smart Contract Scanning

```
For each protocol:
  1. Identify factory/registry contracts
  2. Read deployed vault contracts
  3. Extract metadata (name, symbol, asset, TVL)
  4. Subscribe to NewVault events
  5. Normalize to canonical schema
```

**Protocol-Specific Patterns:**

- **Morpho Blue:** Factory at 0x5401552577... → list all created markets
- **Aave:** LendingPoolAddressesProvider → list all markets
- **Curve:** CurveRegistryExchange → list all pools
- **Yearn:** Registry.vaults() → enumerate V3 vaults
- **Pendle:** PendleMarketFactory → all markets
- **Gearbox:** CreditManagerRegistry → all credit accounts

### 5.2 Data Schema (Canonical)

```typescript
interface Vault {
  // Identifiers
  id: string                    // "aave-v3-usdc-eth"
  protocol: string             // "Aave"
  chain: string               // "eth-mainnet"
  address: string             // smart contract address
  
  // Metadata
  name: string                // "Aave USDC"
  description: string
  symbol: string              // "aUSDC"
  asset: {
    symbol: string           // "USDC"
    address: string
    decimals: number
  }
  
  // Metrics
  apy: number                 // 0.045 (4.5%)
  apyHistorical: {            // APY over time
    timestamp: number
    apy: number
  }[]
  tvl: number                 // USD value
  tvlHistorical: {
    timestamp: number
    tvl: number
  }[]
  
  // Risk Assessment
  riskLevel: "low" | "medium" | "high"
  riskFactors: string[]
  audits: {
    firm: string
    date: string
    reportUrl: string
    status: "passed" | "passed_with_findings"
  }[]
  securityScore: number       // 0-100
  
  // Governance
  governance?: {
    token: string
    distribution: number      // % rewards paid as governance token
  }
  
  // Smart Contract Details
  deployment: {
    timestamp: number
    blockNumber: number
    txHash: string
  }
  source?: string             // GitHub URL
  
  // Metadata
  website?: string
  twitter?: string
  documentation?: string
  createdAt: number
  updatedAt: number
}
```

### 5.3 Data Collection Workflow

```
HOURLY:
  - Query TVL from each vault (balance × price)
  - Calculate APY from recent tx fees / interest
  - Update "updated at" timestamp

DAILY:
  - Fetch historical APY from subgraphs
  - Check for new audits (audit databases)
  - Scan governance proposals (Snapshot, on-chain)
  - Update risk scores based on events

WEEKLY:
  - Scan for new vaults (factory events)
  - Update audit status
  - Refresh security scores
  - Check for protocol changes

ON-DEMAND:
  - When user visits vault, fetch latest metrics
  - Historical chart generation
```

---

## 6. UI/UX DESIGN SYSTEM (Competitive Parity with Quicknode)

### 6.1 Core Pages

#### **Home / Discovery**
```
Layout:
  [Header: GoldRush Vault Explorer]
  
  [Hero Stats Grid]
    Total TVL in GoldRush vaults: $2.3B
    Avg APY: 6.2%
    #Vaults: 150+
    #Chains: 6
  
  [Multi-level Filtering]
    Row 1: Chain selector (pills: Ethereum, Base, Polygon, Arbitrum, Optimism, Avalanche)
    Row 2: Risk filter (pills: Low, Medium, High, Mixed)
    Row 3: Protocol filter (dropdown)
    Row 4: Sort (APY ↓, TVL ↓, Risk ↑, Newly Added)
    Row 5: Search input
  
  [Vault Grid / Table (toggleable)]
    Columns:
      - Vault Name (with icon)
      - Chain badge
      - Protocol badge  
      - Asset
      - APY (large, highlight) + 24h change (green/red arrow)
      - TVL (millions)
      - Risk (color badge)
      - Actions: [View] [Favorite]
    
    Sorting: Clickable column headers
    Pagination: 20 per page
    Mobile: Stack into card view

  [Bottom Section]
    "Want to build on vaults?" CTA to API docs
    "See something missing?" - Form to suggest vaults
```

#### **Vault Detail**
```
Layout:
  [Back button + Breadcrumb: Vaults > Ethereum > Morpho > Steakhouse USDC]
  
  [Header]
    Vault name: "Steakhouse USDC"
    Chain badge: "Ethereum"
    Protocol badge: "Morpho"
    Risk badge: "Low"
  
  [Key Metrics (4-column grid)]
    APY: 8.25% (large font) | 24h: +0.3% (green)
    TVL: $285M
    Avg APY (30d): 8.1%
    Share Price: $1.000234
  
  [APY Charts]
    Line chart showing APY over time
    Toggles: 6h | 24h | 7d | 30d | 90d | All
    Tooltip on hover shows exact APY + date
  
  [Strategy Section]
    "This vault is ideal for: Yield-focused strategies"
    Description of what it does
    Key highlights: "High APY", "Battle-tested", "Active management"
  
  [Risk Assessment]
    Risk level: Low
    Risk factors (bullets):
      - Smart contract (links to audit)
      - Oracle (links to oracle info)
      - Market risk (explanation)
    
    Audits section:
      OpenZeppelin audit 2024 - Passed ✓
      [View Report]
    
    TVL breakdown by time:
      Max TVL: $350M (Jan 2026)
      Current: $285M
      (Shows if TVL is stable/growing)
  
  [Asset Details]
    Asset: USDC
    Underlying vault: Morpho Blue
    Contract address: 0xbeef... [Copy]
    Deploy date: March 2024
    Transaction: [View on Etherscan]
  
  [Similar Vaults]
    3-4 other vaults with similar risk/APY
    (Competitive comparison)
  
  [Call to Action]
    [Deposit into Vault] (opens wallet modal)
    [Add to Watchlist]
    [Share Strategy]
```

#### **Portfolio Dashboard** (Phase 2)
```
[Summary Cards]
  Total Invested: $50,000
  Current Value: $52,500
  Earned Yield: $2,500 (5%)
  Blended APY: 6.8%

[By Chain Breakdown]
  Pie chart: ETH 60%, Base 25%, Polygon 15%

[By Protocol Breakdown]
  Bar chart: Morpho 45%, Aave 35%, Curve 20%

[Vault Holdings]
  Table:
    Vault Name | Chain | Invested | Current | APY | Earned
    [rows for each vault]

[Historical Chart]
  Line chart: Account value over time (30d, 90d, 1y)

[Upcoming Rebalancing]
  "Move $5,000 from Curve (4.2%) to Morpho (8.2%)"
  Est. gas: $45
  Expected APY gain: +$340/year
  [Rebalance]
```

#### **Strategy Builder** (Phase 2)
```
[Questionnaire Path]
  Q1: "What's your risk tolerance?" (Low / Medium / High / Mixed)
  Q2: "Which chains do you prefer?" (checkboxes)
  Q3: "What asset are you starting with?" (dropdown: USDC, USDT, ETH, etc)
  Q4: "How much capital?" ($, to estimate gas)

[Recommendation Engine]
  "Based on your preferences, we recommend:"
  
  Suggested Portfolio:
    [Card] Steakhouse USDC (Morpho, ETH) - 40% - 8.25% APY
    [Card] Aave USDC (Ethereum) - 30% - 4.5% APY
    [Card] Curve 3CRV (Ethereum) - 20% - 3.85% APY
    [Card] Moonwell (Base) - 10% - 7.56% APY
  
  Blended APY: 6.8%
  Expected Annual Yield: $3,400 (on $50k)

[Custom Builder]
  "Or build your own:"
  [Drag-and-drop or % sliders]
  Vault selector (searchable, filterable)
  Add up to 20 vaults
  Real-time blended APY calculation

[Save Strategy]
  [Save]
  Share URL: goldrush.dev/strategy/abc123
  Strategy name: "Conservative Multi-Chain"
  [Copy link] [Save to portfolio]
```

### 6.2 Visual Design

**Color Palette** (GoldRush Dark Theme)
```
Background:     #0f0f0f (near-black)
Card:           #1a1a1a (dark gray)
Border:         #2a2a2a (subtle)
Accent (Gold):  #f59e0b (warm amber/gold)
Text Primary:   #ffffff
Text Secondary: #a0a0a0
Success:        #22c55e (green)
Warning:        #f97316 (orange)
Danger:         #ef4444 (red)
```

**Typography**
```
Headings:       Geist (sans-serif, 600-700 weight)
Body:           Geist (sans-serif, 400-500 weight)
Mono:           Geist Mono (for addresses, numbers)
```

**Components**
- Vault cards: Rounded corners, hover lift effect, shadow on hover
- Badges: Pill-shaped, color-coded by type (chain, risk, protocol)
- Charts: Recharts library, custom theme to match dark mode
- Buttons: Gold accent on hover, clear CTAs
- Tables: Striped rows, sortable headers, sticky header on scroll

---

## 7. TECHNICAL ARCHITECTURE

### 7.1 Data Pipeline

```
Vault Discovery Service (Lambda / Node)
  ├── Smart Contract Scanners (per protocol)
  │   ├── MorphoScanner (subgraph + contract)
  │   ├── AaveScanner (subgraph)
  │   ├── CurveScanner (registry contract)
  │   └── [etc for other protocols]
  │
  ├── Data Aggregator
  │   ├── Normalize schemas
  │   ├── Deduplicate
  │   ├── Validate
  │   └── Store in PostgreSQL
  │
  └── Metrics Calculator
      ├── APY from historical yields
      ├── TVL from balance × price
      ├── Risk scoring
      └── Update every 10 minutes

Real-Time Metrics Service
  ├── Event listener (Ethers.js)
  │   ├── Deposit/Withdraw events
  │   ├── Price updates
  │   └── Governance proposals
  │
  └── WebSocket broadcaster
      └── Push to frontend in real-time

API Layer (REST + GraphQL)
  ├── /vaults (list all)
  ├── /vaults/{id} (detail)
  ├── /vaults?chain=eth&apy_min=5 (filtered)
  ├── /metrics/historical (for charts)
  └── /portfolio/{walletAddress} (user data)

Frontend (Next.js)
  ├── Pages: Discovery, Detail, Portfolio, Strategies
  ├── Real-time subscription (WebSocket)
  ├── Charts (Recharts)
  └── State (React Query for caching)
```

### 7.2 Database Schema (Key Tables)

```sql
-- Core vault data
CREATE TABLE vaults (
  id VARCHAR PRIMARY KEY,              -- "aave-usdc-eth"
  protocol VARCHAR,                    -- "Aave"
  chain VARCHAR,                        -- "eth-mainnet"
  address VARCHAR UNIQUE,              -- contract address
  name VARCHAR,
  description TEXT,
  symbol VARCHAR,
  asset_symbol VARCHAR,
  asset_address VARCHAR,
  apy DECIMAL,
  tvl DECIMAL,
  risk_level VARCHAR,
  audit_status VARCHAR,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  INDEX(protocol, chain, risk_level, apy DESC)
);

-- Historical metrics (for charting)
CREATE TABLE vault_metrics_history (
  vault_id VARCHAR,
  timestamp TIMESTAMP,
  apy DECIMAL,
  tvl DECIMAL,
  tvl_24h_change DECIMAL,
  PRIMARY KEY(vault_id, timestamp),
  INDEX(vault_id, timestamp DESC)
);

-- User portfolios (Phase 2)
CREATE TABLE user_portfolios (
  user_id VARCHAR PRIMARY KEY,
  wallet_address VARCHAR UNIQUE,
  total_invested DECIMAL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE portfolio_positions (
  user_id VARCHAR,
  vault_id VARCHAR,
  amount_invested DECIMAL,
  shares_owned DECIMAL,
  deposit_date TIMESTAMP,
  PRIMARY KEY(user_id, vault_id),
  FOREIGN KEY(user_id) REFERENCES user_portfolios
);

-- User-saved strategies (Phase 2)
CREATE TABLE saved_strategies (
  strategy_id VARCHAR PRIMARY KEY,
  user_id VARCHAR,
  name VARCHAR,
  description TEXT,
  vaults JSONB,                        -- [{vault_id, allocation}]
  blended_apy DECIMAL,
  shared_url VARCHAR UNIQUE,
  created_at TIMESTAMP
);
```

---

## 8. IMPLEMENTATION ROADMAP & RESOURCE PLAN

### 8.1 Timeline (12 Weeks to Competitive Parity)

| Phase | Week | Focus | Team | Status |
|-------|------|-------|------|--------|
| Foundation | 1-3 | Data expansion (16→150 vaults) | 1 Backend, 1 Data | 🔴 TODO |
| Foundation | 4-6 | Real-time metrics + API | 1 Backend, 1 Infra | 🔴 TODO |
| Foundation | 7-8 | UI Polish + Responsive design | 1 Frontend, 1 Design | 🔴 TODO |
| Beta Launch | 9 | Testing + bugfixes | 1 QA, 1 PM | 🔴 TODO |
| Differentiation | 10-15 | Portfolio tracking | 2 Backend, 1 Frontend | 🔴 TODO |
| Differentiation | 16-20 | Analytics + charting | 1 Frontend, 1 Backend | 🔴 TODO |
| Differentiation | 21-26 | Strategy builder | 1 Frontend, 1 Backend | 🔴 TODO |
| Launch | 27 | Marketing + docs | 1 Marketing, 1 PM | 🔴 TODO |

### 8.2 Resource Requirements

- **Backend Engineers:** 2-3 FTE (data pipeline, API, portfolio logic)
- **Frontend Engineers:** 2 FTE (discovery, portfolio, strategy UI)
- **Data/DevOps:** 1 FTE (data infrastructure, monitoring)
- **Product Manager:** 1 FTE (strategy, roadmap, prioritization)
- **Design:** 0.5 FTE (already have solid dark theme foundation)
- **QA:** 0.5 FTE (testing + monitoring)

**Total:** ~7 FTE, 26 weeks to full feature parity with Quicknode Earn

---

## 9. COMPETITIVE POSITIONING & GO-TO-MARKET

### 9.1 Unique Value Propositions

**vs vaults.fyi:**
- Real-time metrics (vs hourly)
- Beautiful UI/UX (vs dated design)
- Educational content (Docs section)
- Risk scoring (vs minimal)
- Coming: Portfolio tracking

**vs Quicknode Earn:**
- Open to all vaults (not just Quicknode)
- 7.5x more vaults (150+ vs 20)
- Free (no RPC subscription required)
- Multi-protocol focus (not just Quicknode)

**vs Yearn:**
- Broader vault coverage
- Simpler UX for retail users
- Cross-chain (not just ETH)
- Comparison view (not single-protocol)

### 9.2 Key Positioning Pillars

1. **"The canonical vault discovery layer"** — Powered by Covalent's indexed blockchain data
2. **"Built for everyone"** — From casual users to sophisticated traders
3. **"Real-time, not historical"** — Live metrics updated every 10 minutes
4. **"Open ecosystem"** — All audited protocols, no vendor lock-in

### 9.3 Go-to-Market Phases

**Phase 1 (Week 1-9): "Private Beta"**
- Announce expansion to 150+ vaults
- Invite Covalent users + DeFi Twitter
- Gather feedback on UI/UX

**Phase 2 (Week 10-20): "Feature Expansion"**
- Launch portfolio tracking
- Position as "Quicknode Earn for everyone"
- Build thought leadership content

**Phase 3 (Week 21-26): "Market Leadership"**
- Full feature parity achieved
- Position as the default vault discovery tool
- B2B partnerships (portfolio trackers, wallets, DAOs)

---

## 10. SUCCESS METRICS & KPIs

### 10.1 Usage Metrics

- **MAU (Monthly Active Users):** 10K → 50K → 100K+ (by month 6)
- **Avg Session Duration:** 3min → 8min → 15min (as features expand)
- **Vault Pages Viewed:** 50K → 500K → 2M+ (per month)
- **Portfolio Connections:** 0 → 5K → 25K+ (by month 6)

### 10.2 Business Metrics

- **API Calls:** 0 → 500K → 5M+ (per day)
- **B2B Partners:** 0 → 3 → 10+ (wallet integrations, DAOs)
- **Premium features:** TBD (think: tax reports, advanced analytics)

### 10.3 Quality Metrics

- **Data Freshness:** Real-time (< 5 min) vs vaults.fyi (hourly)
- **Vault Accuracy:** 99%+ audit match with on-chain state
- **Uptime:** 99.9% (must be reliable data source)
- **User Satisfaction:** 4.5+/5 stars

---

## 11. RISK ANALYSIS & MITIGATIONS

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|-----------|
| Data quality issues (APY miscalc) | HIGH | MEDIUM | Thorough validation + manual audits |
| Subgraph downtime | HIGH | LOW | Fallback to on-chain scanning |
| Market shift to new protocols | HIGH | LOW | Pluggable scanner architecture |
| Regulatory changes (staking taxes) | MEDIUM | LOW | Monitor & adapt documentation |
| Competitive response from Quicknode | MEDIUM | HIGH | Keep feature velocity high |
| User onboarding is too complex | MEDIUM | MEDIUM | Invest heavily in docs + UX testing |

---

## 12. BUDGET ESTIMATE (Conservative)

- **Engineering:** $1.2M (7 FTE × 26 weeks)
- **Infrastructure:** $50K (data pipeline, APIs, CDN)
- **Design/UX:** $80K (design contractor, user testing)
- **Marketing:** $60K (content, community, partnerships)
- **Contingency (15%):** $250K
- **Total:** ~$1.64M

---

## 13. SUCCESS CRITERIA FOR EACH PHASE

### Phase 1: Foundation ✅
- [ ] 150+ vaults discovered and indexed
- [ ] Real-time metrics pipeline operational
- [ ] UI matches or exceeds vaults.fyi quality
- [ ] 1,000+ MAU in private beta
- [ ] Zero data quality complaints

### Phase 2: Differentiation ✅
- [ ] Portfolio tracking adopted by 5,000+ users
- [ ] APY history charts working smoothly
- [ ] Strategy builder used for 10%+ of sessions
- [ ] 10K+ MAU

### Phase 3: Leadership ✅
- [ ] 50K+ MAU
- [ ] 3+ B2B integrations
- [ ] Cited as primary vault discovery tool in community
- [ ] Zero vendor complaints about coverage

---

## 14. OPEN QUESTIONS & NEXT STEPS

### Open Questions
1. **Monetization:** How do we monetize without alienating users?
   - Freemium analytics?
   - Premium portfolio insights?
   - API tiering?
   - Affiliate fees to protocols?

2. **Data Sourcing:** Should we scrape vaults.fyi or build independently?
   - **Recommendation:** Build independently (data quality + differentiation)

3. **Smart Contract Interaction:** Should we enable direct deposits?
   - **Recommendation:** Yes, Phase 2 (portfolio tracking requires it)

4. **Governance:** Should we create a DAO for vault curation?
   - **Recommendation:** Not MVP, but consider for Phase 3

### Next Steps (This Week)
1. [ ] Align with Engineering on data pipeline architecture
2. [ ] Create detailed spike for Morpho Blue vault discovery
3. [ ] Design mockups for portfolio dashboard
4. [ ] Reach out to 5 vault protocols for API partnership
5. [ ] User interviews (5 retail DeFi users, 5 power users)

---

## Appendix A: Vault Discovery SQL Queries

```sql
-- Find all vaults with APY > 6%
SELECT name, apy, tvl, chain
FROM vaults
WHERE apy > 0.06
  AND audit_status = 'passed'
ORDER BY apy DESC
LIMIT 50;

-- Vaults by chain
SELECT chain, COUNT(*) as vault_count, AVG(apy) as avg_apy
FROM vaults
GROUP BY chain
ORDER BY vault_count DESC;

-- Risk distribution
SELECT risk_level, COUNT(*) as count, AVG(apy) as avg_apy
FROM vaults
GROUP BY risk_level;
```

---

## Appendix B: Competitive Positioning Canvas

```
            VAULTS.FYI    QUICKNODE    YEARN       GOLDRUSH
Breadth:    ████████░░    ███░░░░░░░   ██░░░░░░░░  ████░░░░░░
Depth:      ██░░░░░░░░    █████████░   ████████░░  ░░░░░░░░░░
UX/Polish:  ███░░░░░░░    ██████████   ██░░░░░░░░  ██████░░░░
Real-Time:  ░░░░░░░░░░    ██████████   ███░░░░░░░  ██████░░░░
Onboarding: ░░░░░░░░░░    ████████░░   ░░░░░░░░░░  █████░░░░░
Portfolio:  ░░░░░░░░░░    ███░░░░░░░   ██████████  ░░░░░░░░░░

GoldRush Strategy: Move to top-right quadrant
  → Broaden to 150+ (already have foundation)
  → Polish UI to match Quicknode (design debt)
  → Add portfolio tracking (differentiate from vaults.fyi)
  → Maintain real-time data (competitive advantage)
```

---

**Document Owner:** Senior TPM  
**Last Updated:** 2026-06-25  
**Review Cycle:** Bi-weekly  
**Distribution:** Engineering, Product, Leadership


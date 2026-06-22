# Feature Spec: Earn Opportunities (Full Support)

Based on jumper.xyz/earn patterns and DeFi aggregator standards.

---

## 1. LIST VIEW (`/earn`)

### Header
- Title: "Earn Opportunities" or "Discover Yield"
- Subtitle: "Curated vault strategies across DeFi"
- Optional: TVL badges showing total ecosystem TVL

### Search & Filters

**Search Bar**
- Placeholder: "Search opportunities, assets, protocols..."
- Real-time filter on: name, asset symbol, protocol name
- Icon: search glass or magnifying icon

**Filter Dropdowns (Collapsible on Mobile)**
- **Chain:** eth-mainnet, base-mainnet, polygon, arbitrum, optimism, bsc
  - Multi-select or single-select
  - Show count: "Base (8)"
  
- **Protocol:** Morpho, Aave, Euler, Compound, Yearn, Spark, Fluid
  - Multi-select
  
- **Risk Level:** Low, Medium, High
  - Radio buttons or multi-select
  
- **Asset:** USDC, USDT, WETH, ETH, DAI, etc.
  - Multi-select
  - Appears only if filtering worth it (10+ opportunities)

**Sorting Dropdown**
- Default: "Best APY"
- Options:
  - "Best APY" (APY descending)
  - "Highest TVL" (TVL descending)
  - "Most Active" (recent deployments or inflows)
  - "Lowest Risk"
  - "Name A-Z"

**Controls Layout**
```
[Search: "USDC"] [Chain▼] [Protocol▼] [Risk▼] [Sort: Best APY▼]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Cards Grid

**Opportunity Card Layout (Mobile: 1 col, Tablet: 2 cols, Desktop: 3-4 cols)**

```
┌─────────────────────────────────┐
│ [Logo] Protocol | [Chain▼] [Risk]│  ← Top row
├─────────────────────────────────┤
│ Steakhouse USDC                 │  ← Name (clickable)
│                                 │
│ 8.24% APY        $124.5M TVL    │  ← Key metrics (large)
│                                 │
│ +0.31% (30d)    24h: +$2.1M    │  ← Performance (secondary)
│                                 │
│ ⭐ Low Risk     →               │  ← Risk badge + click arrow
└─────────────────────────────────┘
```

**Card Data Fields**
- Protocol logo (left of protocol name, 32px)
- Protocol name badge (e.g., "Morpho Blue")
- Chain badge (e.g., "ETH")
- Risk color indicator (green=low, orange=medium, red=high)
- **Opportunity Name** (large, bold)
- **APY** (huge, colored text, right-aligned)
- **TVL** (secondary size, lighter color, right-aligned)
- **30-day APY Change** (percentage, green/red)
- **24h TVL Change** (absolute $, gray)
- **Hover state:** Border highlight, slight shadow, cursor pointer

**Card Click Behavior**
- Click anywhere → Navigate to `/earn/[slug]`
- Arrow icon → Optional secondary CTA (can be same)

### Empty States
- **No results:** "No opportunities match your filters. Try adjusting."
- **Loading:** Skeleton cards (3-4 placeholder rows)
- **Error:** "Unable to load opportunities. Try again." + Retry button

### Pagination / Infinite Scroll
- **MVP:** Show all (if <50), or paginate by 20
- **UX:** Either "Load More" button OR infinite scroll on scroll
- **Total count badge:** "(24 opportunities)"

### Stats Carousel (Optional, Top of Page)
```
Total TVL: $1.2B    Avg APY: 6.3%    Top Opportunity: Steakhouse USDC (8.24%)
```

---

## 2. DETAIL VIEW (`/earn/[slug]`)

### Header Section

**Breadcrumb & Back Link**
```
← Back to Opportunities
```

**Title Section**
```
┌─────────────────────────────────────────────────┐
│ [Logo] [Morpho] [ETH] [Low Risk]               │  ← Badges (left)
│                                                 │
│ Steakhouse USDC                                │  ← Name (large)
│ Earn USDC yield on 3 Morpho Blue markets      │  ← Subheading
│                                                 │
│ APY: 8.24%  |  TVL: $124.5M  |  Risk: Low    │  ← Key metrics
│ 30d Change: +0.31%  |  Updated: 2 minutes ago │  ← Secondary
└─────────────────────────────────────────────────┘
```

**Key Metrics Row**
- **APY** (huge, left-aligned)
- **TVL** (mid-size, center)
- **Utilization / Composition** (right)
- **Updated timestamp** (small, gray, always included)

### Two-Column Layout (Desktop), Single Stack (Mobile)

#### LEFT COLUMN (65%)

**Strategy Section**
```
Strategy
────────────────────
Supply [Asset] to [Protocol] [Location] to earn yield.

[3-5 bullet points explaining what happens with the money]
• Funds are allocated to Morpho Blue USDC/WETH market
• Supply rate: 8.24% APY
• Withdrawable anytime (subject to liquidity)

Why this opportunity:
• Established vault (2+ years)
• $124M+ TVL
• Transparent allocation strategy
• Active management
```

**Risk Section (Collapsible)**
```
Risk Factors
─────────────
◀ Low Risk

Smart Contract Risk: Morpho audited by OpenZeppelin. All code risks present.
Oracle Risk: Chainlink oracle feeds. Potential delays or pricing errors.
Market Risk: Utilization at 78%; liquidity is sufficient but can spike.
Governance Risk: Protocol governed by MORPHO token; changes could affect terms.

Notes: Morpho is battle-tested with $15B+ TVL. Base-specific vault is 1+ years old.
```

**About Section**
```
About This Opportunity
──────────────────────
Steakhouse Finance is a yield optimization team operating on Morpho Blue.
Founded in 2023. Manages 3 vaults with $200M+ AUM.
Profile: https://steakhouse.finance
```

#### RIGHT COLUMN (35%)

**Quick Facts Box**
```
QUICK FACTS
────────────
Protocol:        Morpho Blue
Chain:          Ethereum Mainnet
Asset:          USDC
Collateral:     Mixed (WETH, LRT, etc.)
Status:         Active
Min Deposit:    None
Withdrawal Fee: None
Management Fee: None (for this vault)
```

**Historical APY Chart (Optional, Phase 2)**
```
APY Over 30 Days
───────────────
    |
8.3%├─────╱╲─────
    │    ╱  ╲
8.1%├───╱    ╲──
    │
7.9%├──────────
    └──┬──┬──┬──→ (days)
```

**APY Data Points** (if chart not shown)
```
APY Today:     8.24%
7-day avg:     8.15%
30-day avg:    7.95%
High (30d):    8.52%
Low (30d):     7.63%
```

**Metrics Card**
```
ALLOCATION      VALUE       % OF TVL
────────────────────────────────────
Idle (USDC)     $12.5M      10.0%
WETH Market     $89.2M      71.6%
LRT Market      $22.8M      18.3%
```

### Action Buttons (Footer or Sticky)

**Two CTAs at bottom**
```
┌─────────────────────────────────────────┐
│ [View in Vault Explorer]  [Deploy Now]  │
└─────────────────────────────────────────┘
```

**Button Details**
- **View in Vault Explorer:** Link to `/vault/[address]?chain=eth-mainnet`
  - Shows the decomposed vault internals, transaction history, etc.
  
- **Deploy / Get Yield:** External link to protocol UI
  - Aave: `https://app.aave.com/?referral=...` 
  - Morpho: `https://app.morpho.org/...`
  - Yearn: `https://yearn.finance/...`

### Related Opportunities (Optional, Phase 2)
```
Similar Opportunities
──────────────────────
┌──────────┐ ┌──────────┐ ┌──────────┐
│ Gauntlet │ │ Moonwell │ │ Re7 WETH │
│ USDC     │ │ USDC     │ │ on ETH   │
│ 7.8%     │ │ 5.2%     │ │ 6.4%     │
└──────────┘ └──────────┘ └──────────┘
```

### Sharing (Optional)
```
Share: [Twitter] [Copy Link]
```

---

## 3. Data Model & API

### Opportunity Interface (Expanded)

```typescript
interface Opportunity {
  // Identity
  slug: string;                           // "steakhouse-usdc-eth"
  name: string;                           // "Steakhouse USDC"
  description: string;                    // "Earn USDC yield..."
  vaultAddress: string;                   // ERC-4626 address
  
  // Classification
  chain: SupportedChain;
  protocol: Protocol;
  asset: {
    symbol: string;                       // "USDC"
    address: string;
    decimals: number;
    logo: string;
  };
  
  // Risk
  riskLevel: "low" | "medium" | "high";
  riskFactors: string[];                  // ["smart contract", "oracle"]
  auditedBy?: string[];                   // ["OpenZeppelin"]
  
  // Highlights
  highlights: string[];                   // ["Established", "High APY"]
  
  // Metrics (Live)
  apy: number | null;                     // 0.0824 = 8.24%
  tvl: number;                            // 124500000
  utilization?: number;                   // 0-1
  apyChange30d?: number;                  // 0.0031 = 0.31%
  tvlChange24h?: number;                  // 2100000
  
  // Strategy Details
  strategy: {
    title: string;
    description: string;                  // Multi-line
    allocation?: {
      market: string;
      pct: number;
      tvl: number;
    }[];
  };
  
  // Metadata
  manager?: {
    name: string;
    website?: string;
    aum?: number;
  };
  fees?: {
    deposit?: number;
    withdrawal?: number;
    management?: number;
    performance?: number;
  };
  
  // Links
  vaultUrl?: string;                      // Protocol deposit UI
  auditUrl?: string;
  docsUrl?: string;
  
  // Historical (Phase 2)
  apyHistory?: Array<{
    timestamp: number;
    apy: number;
  }>;
}
```

### API Endpoints

**GET /api/opportunities**
```
Query: ?chain=eth&protocol=morpho&risk=low&asset=usdc&sort=apy&search=steakhouse
Response:
{
  opportunities: Opportunity[],
  count: number,
  total: number,      // Total across all filters
  filtered: number    // After search/filters
}
```

**GET /api/opportunities/[slug]**
```
Response: Opportunity (with all fields populated, live apy/tvl fetched)
Cache: 60 seconds
```

### Data Sources

**Live Data (Per Request)**
- APY: Via `recursiveDecompose()` → MarketPosition.supplyApy
- TVL: rootNode.balanceUSD from decomposition
- Utilization: From market position data
- Updated: Current timestamp

**Static Data (Seed)**
- Name, description, strategy, risk factors, manager, fees
- Highlights, audit info, links

**Historical APY (Phase 2)**
- Store last 30 data points in seed data
- Or fetch from DefiLlama / Morpho API

---

## 4. Desktop vs Mobile

### Desktop Layout
- 2-column (detail view)
- 3-4 column grid (list)
- Sticky header with filters
- Horizontal scrolling not needed

### Mobile Layout
- 1-column cards (list)
- Stacked layout (detail)
- Collapsible filter sidebar or modal
- Touch-friendly button sizes (48px+)
- Filters below search
- Swipe-through related opportunities

---

## 5. Interactions

### List View
- Filter changes: Instant update (debounce 200ms)
- Search: Real-time (debounce 300ms)
- Sort: Instant
- Card click: Navigate to detail
- Pagination: Load more or infinite scroll

### Detail View
- Collapsible sections (risk, about)
- Copy address button (on vault address field)
- Share buttons (Twitter, copy link)
- "View Vault" → `/vault/[address]` in new tab
- "Deploy" → Protocol external link in new tab

---

## 6. Visual Design Notes

### Colors
- **APY:** Accent color (orange/amber for Covalent brand)
- **Risk Low:** Green (#22c55e)
- **Risk Medium:** Orange (#f97316)
- **Risk High:** Red (#ef4444)
- **TVL:** Gray (secondary text)
- **Change Positive:** Green
- **Change Negative:** Red

### Typography
- Name: Large, bold (28px+ desktop, 20px mobile)
- APY: Huge (36px+), bold
- Metrics: 14-18px
- Body: 14px

### Spacing
- Card padding: 16px (mobile), 20px (desktop)
- Grid gap: 16px
- Section padding: 24px
- Filter spacing: 12px between dropdowns

### Accessibility
- All badges have aria-labels
- Form inputs have associated labels
- Color not only indicator (use text + color)
- Keyboard navigation for filters
- Focus states visible on buttons

---

## 7. Edge Cases

### No Data
- "Unable to fetch opportunities" → show seed data as fallback
- Stale APY → show last known + "Updated X hours ago"
- Missing historical APY → show text "Data not available"

### Performance
- Lazy-load protocol logos
- Paginate cards (20 per page)
- Cache filter results (60s)
- Debounce search

### Browser Support
- Modern browsers (ES2020+)
- Mobile Safari 12+
- Chrome 90+
- Firefox 88+

---

## 8. Implementation Checklist

**List View**
- [ ] Layout: header, search, filters, grid
- [ ] Filter logic: chain, protocol, risk, asset, search
- [ ] Sort logic: APY desc, TVL desc, etc.
- [ ] Pagination or infinite scroll
- [ ] Card component with hover state
- [ ] Mobile responsive (1 col)
- [ ] Empty states (loading, error, no results)

**Detail View**
- [ ] Fetch opportunity + live metrics
- [ ] Render strategy section
- [ ] Collapsible risk section
- [ ] Quick facts sidebar
- [ ] Action buttons (View Vault, Deploy)
- [ ] Related opportunities carousel (Phase 2)
- [ ] Mobile responsive (stacked)

**Data & API**
- [ ] API list endpoint (filter, sort, search, cache)
- [ ] API detail endpoint (live metrics, cache)
- [ ] Data model types
- [ ] Error handling (404, 500, network)

**Polish**
- [ ] SEO meta tags per opportunity
- [ ] Share buttons (Twitter, copy link)
- [ ] Loading states (skeleton, spinners)
- [ ] Toast notifications (copy address, link copied)
- [ ] Keyboard navigation
- [ ] Focus management

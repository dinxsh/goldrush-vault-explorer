# Hybrid Strategy: Curated + Full Enumeration

Support both discovery (curated) and research (all vaults) use cases.

---

## Architecture

### Two Data Modes

**Mode 1: Curated (Default)**
- Hand-picked 20-30 vaults per chain
- High quality, with risk/strategy explanations
- Data source: `lib/opportunities-data.ts` (hardcoded)
- Label: "Featured Opportunities"

**Mode 2: Full (Optional)**
- All vaults from Morpho, Aave, Yearn, Compound, Euler
- Auto-fetched from protocol APIs
- Minimal metadata (name, APY, TVL only initially)
- Label: "All Opportunities" or "Browse All"

### UI Flow

```
/earn
  ├─ Default view: 20-30 curated opportunities
  │  - Filters: chain, protocol, risk, sort
  │  - Each has strategy, risk explanation, manager
  │  - Quality-first, discovery-focused
  │
  └─ Toggle/Tab: "View All Vaults" 
     - 110+ ETH, 18+ Base, 20+ Polygon
     - Minimal cards (name, apy, tvl only)
     - Filters: chain, protocol only (risk calc'd live)
     - Sort: apy, tvl, name
     - Full enumeration like vaults.fyi
```

---

## Implementation (Phases)

### Phase 1: Curated Only (Days 1-7)

```typescript
// lib/opportunities-data.ts
export const CURATED_OPPORTUNITIES = {
  "steakhouse-usdc-eth": { /* full data */ },
  "gauntlet-usdc-core-eth": { /* full data */ },
  // ... 20-30 total
};

// app/earn/page.tsx
const opportunities = CURATED_OPPORTUNITIES;
```

**MVP Feature Set:**
- List with 6-30 curated vaults
- Detail page with full strategy/risk
- Filters: chain, protocol, risk, sort
- No toggle yet (full enumeration hidden)

**Deployment:** Launch curated only, gather feedback

---

### Phase 2: Add Full Enumeration (Days 8-14)

**New UI Element: Toggle/Tab**
```
Featured Opportunities | Browse All Vaults
      (default)           (new)
```

**Backend: Parallel Data Fetching**

```typescript
// lib/vault-aggregators.ts

// Morpho: Fetch all markets
async function getMorphoVaults(chain: SupportedChain): Promise<VaultSummary[]> {
  const response = await fetch(`https://api.morpho.org/markets?chainId=${CHAIN_IDS[chain]}`);
  const markets = await response.json();
  
  return markets.map(m => ({
    slug: `morpho-${m.id}`,
    name: `Morpho ${m.loanToken.symbol}/${m.collateralToken.symbol}`,
    vaultAddress: m.address,
    chain,
    protocol: "Morpho",
    apy: m.supplyRate,
    tvl: m.tvl,
    // Risk calculated on-the-fly from utilization
    riskLevel: calculateRisk(m.utilization),
    highlights: [],
    // NO strategy, audit, manager (Phase 2 minimal)
  }));
}

// Aave: Fetch all reserves
async function getAaveVaults(chain: SupportedChain): Promise<VaultSummary[]> {
  // Use subgraph or Aave API
  const response = await fetch(`https://aave-api.aave.com/data/markets?chainId=${CHAIN_IDS[chain]}`);
  const reserves = await response.json();
  
  return reserves.map(r => ({
    slug: `aave-${r.address}`,
    name: `Aave ${r.symbol}`,
    vaultAddress: r.address,
    chain,
    protocol: "Aave",
    apy: r.supplyAPY,
    tvl: r.totalSupply * r.priceUSD,
    riskLevel: "low", // Aave assumed lower risk
  }));
}

// Yearn, Compound v3, Euler v2 (similar pattern)
```

**Updated API Routes**

```typescript
// app/api/opportunities/route.ts
export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get("mode") || "curated";
  // "curated" = hardcoded seed data
  // "all" = live fetch from APIs
  
  if (mode === "curated") {
    // Use CURATED_OPPORTUNITIES
    const opps = getAllCurated();
    return NextResponse.json({ opportunities: opps, count: opps.length });
  }
  
  if (mode === "all") {
    // Fetch live from all aggregators
    const [morpho, aave, yearn, compound, euler] = await Promise.all([
      getMorphoVaults(chain),
      getAaveVaults(chain),
      getYearnVaults(chain),
      getCompoundVaults(chain),
      getEulerVaults(chain),
    ]);
    
    const all = [...morpho, ...aave, ...yearn, ...compound, ...euler];
    const filtered = filterOpportunities(all, filters);
    
    // Cache for 30 minutes (live data, refresh often)
    return NextResponse.json({ 
      opportunities: filtered, 
      count: filtered.length,
      mode: "all",
      refreshedAt: Date.now(),
    });
  }
}
```

**Frontend: Toggle Component**

```typescript
// components/OpportunityModeToggle.tsx
export default function OpportunityModeToggle({ mode, onChange }) {
  return (
    <div className="flex gap-2 mb-4">
      <button
        onClick={() => onChange("curated")}
        className={mode === "curated" ? "active" : ""}
      >
        ✨ Featured (20-30)
      </button>
      <button
        onClick={() => onChange("all")}
        className={mode === "all" ? "active" : ""}
      >
        🔍 Browse All (110+)
      </button>
    </div>
  );
}
```

**Updated List Page**

```typescript
// app/earn/page.tsx
"use client";

const [mode, setMode] = useState<"curated" | "all">("curated");

useEffect(() => {
  const query = new URLSearchParams({ mode, chain, protocol, sort, q });
  fetch(`/api/opportunities?${query}`).then(r => r.json()).then(setOpportunities);
}, [mode, chain, protocol, sort, q]);

return (
  <>
    <OpportunityModeToggle mode={mode} onChange={setMode} />
    {/* Rest of list view */}
  </>
);
```

---

## Data Comparison

### Curated Card (Featured)
```
┌──────────────────────────────────┐
│ [Logo] Morpho | ETH | Low Risk   │
├──────────────────────────────────┤
│ Steakhouse USDC                  │
│ 8.24% APY        $124.5M TVL    │
│ +0.31% (30d)    24h: +$2.1M    │
│ ⭐ Low Risk      → View Detail   │
└──────────────────────────────────┘
```

### All Vaults Card (Minimal)
```
┌──────────────────────────────────┐
│ Morpho USDC/WETH                 │
│ 7.82% APY        $89.2M TVL      │
│ → View Detail                    │
└──────────────────────────────────┘
```

**Curated Card Fields:**
- Logo, Protocol, Chain, Risk badge
- Name (bold)
- APY, TVL
- 30d change, 24h change
- Risk badge with color
- Hover effect

**All Vaults Card Fields:**
- Protocol, Name (minimal)
- APY, TVL
- Click to expand or go to detail

---

## Risk Calculation (For "All" Mode)

Since we don't have manual risk assessments for auto-fetched vaults, calculate risk live:

```typescript
function calculateRiskLevel(
  utilization: number,
  tvl: number,
  auditedProtocols: string[],
  protocol: string
): "low" | "medium" | "high" {
  // Protocol default risk
  const protocolRisk: Record<string, number> = {
    "Aave": 1,      // Lowest
    "Compound": 1,
    "Morpho": 2,    // Medium (smaller TVL per market)
    "Euler": 2,
    "Yearn": 2,
  };
  
  // Utilization risk (high utilization = higher risk)
  const utilizationRisk = utilization > 0.8 ? 2 : utilization > 0.5 ? 1 : 0;
  
  // TVL risk (smaller TVL = higher risk)
  const tvlRisk = tvl < 1_000_000 ? 2 : tvl < 10_000_000 ? 1 : 0;
  
  const totalRisk = protocolRisk[protocol] + utilizationRisk + tvlRisk;
  
  if (totalRisk <= 1) return "low";
  if (totalRisk <= 3) return "medium";
  return "high";
}
```

---

## Detail Page Logic

**Curated Opportunity**
```
/earn/steakhouse-usdc-eth
  ├─ Full strategy section
  ├─ Risk factors (manual)
  ├─ Manager info
  └─ CTAs: View Vault, Deploy
```

**All Vaults Opportunity**
```
/earn/morpho-usdc-weth-eth
  ├─ Basic info (protocol, chain, asset)
  ├─ Live metrics (APY, TVL, utilization)
  ├─ Calculated risk level
  ├─ NO strategy/manager (optional add)
  └─ CTAs: View Vault, Deploy
```

---

## Caching Strategy

**Curated Data:**
- Cache: Never (hardcoded, always fresh)
- API response cache: 5 minutes (reduce DB hits)

**All Vaults Data:**
- API response cache: 30 minutes (live data, refresh often)
- Last-modified header to detect changes
- Background refresh job (optional, Phase 3)

---

## Phase 2 API Costs

**Morpho API:** Free (public endpoint)
**Aave Subgraph:** Free (TheGraph, rate-limited)
**Yearn API:** Free (public endpoint)
**Compound / Euler:** Free (on-chain reads or public APIs)

**Total API calls per request:**
- 5 parallel fetches (one per protocol)
- Cached for 30 minutes
- ~5-10 API calls per user session (low)

---

## Launch Timeline

**Week 1 (MVP):** Curated only, 6-30 vaults, full detail pages
**Week 2 (Phase 2):** Add "Browse All" toggle, 110+ auto-fetched vaults
**Week 3+:** Background jobs, historical APY, enhanced risk scoring

---

## User Journeys

### Discovery User (70%)
1. Land on `/earn`
2. See "Featured Opportunities" (default)
3. Browse curated list, read strategies
4. Click detail page for full risk/strategy
5. "View Vault" to decompose internals

### Research User (30%)
1. Land on `/earn`
2. Click "Browse All Vaults"
3. Filter by protocol/chain
4. Sort by APY/TVL
5. Quick-scan 50+ vaults
6. Click detail for live metrics or "View Vault"

---

## Success Metrics

**Curated Mode:**
- Click-through to detail: >30%
- "View Vault" clicks: >20%
- Time on page: >60 seconds

**All Vaults Mode:**
- Engagement: metric to define
- Sort/filter usage: >50%
- Detail page visits: >10%

---

## FAQ

**Q: Won't "Browse All" just be a copy of vaults.fyi?**
A: No. Ours integrates with the vault decomposer and risk scoring. Users can:
   - View full position breakdowns (Morpho markets, Euler collateral splits)
   - Compare protocols side-by-side
   - Jump to our wallet explorer
   - See transaction history

**Q: What if a vault is in both Curated and All?**
A: Show the curated version in "Featured" tab. In "All" tab, show the auto-fetched version (less detail). User can toggle between them.

**Q: How do we keep "All" fresh if APIs go down?**
A: Use a 30-min cache + fallback to last-known-good data. If fetch fails, show cache with "updated X hours ago" label.

**Q: Will this be slow?**
A: 5 parallel API calls take ~2-3 seconds first time, then serve from 30-min cache. Users see cached data immediately in subsequent requests. Lazy-load on tab switch.

---

## Implementation Checklist

**Phase 1 (Curated, Days 1-7)**
- [ ] Seed data with 20-30 opportunities
- [ ] List page with filters/sort
- [ ] Detail page with strategy/risk
- [ ] API routes (curated only)
- [ ] Responsive design
- [ ] Deploy MVP

**Phase 2 (Full Enumeration, Days 8-14)**
- [ ] Aggregator functions (Morpho, Aave, Yearn, etc.)
- [ ] Risk calculation function
- [ ] Toggle component
- [ ] API route: add `?mode=all` parameter
- [ ] Caching for 30 minutes
- [ ] Detail page: minimal version for auto-fetched
- [ ] Testing: verify counts (110+ ETH, etc.)
- [ ] Deploy Phase 2

**Phase 3+ (Polish)**
- [ ] Background refresh job
- [ ] Historical APY for all vaults
- [ ] Enhanced risk scoring
- [ ] Admin panel to manage curated list
- [ ] Analytics: which vaults are clicked most

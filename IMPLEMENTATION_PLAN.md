# Earn Opportunities: Implementation Plan

Add `/earn` (list) and `/earn/[slug]` (detail) routes. Reuse existing GoldRush/RPC infrastructure.

---

## Data Model

```typescript
// types/opportunity.ts
export interface Opportunity {
  slug: string;                    // "steakhouse-usdc-eth"
  name: string;                    // "Steakhouse USDC"
  description: string;             // One-line summary
  vaultAddress: string;            // ERC-4626 vault address
  chain: SupportedChain;
  protocol: "Morpho" | "Aave" | "Euler" | "Compound" | "Yearn";
  riskLevel: "low" | "medium" | "high";
  riskFactors: string[];           // ["smart contract", "oracle"]
  highlights: string[];            // Selling points (array)
}
```

Store as hardcoded JSON in `lib/opportunities-data.ts` (~25 vaults: reuse existing presets + manual curation).

---

## Backend

### API Routes

**`GET /api/opportunities`**
```
Query: ?chain=eth-mainnet&protocol=Morpho&sort=apy-desc&q=usdc
Response: { opportunities: Opportunity[], count: number }
Filters: chain, protocol, riskLevel, search (name/description)
Sorting: apy-desc, apy-asc, tvl-desc, name
Cache: 60s (5-min browser cache)
```

**`GET /api/opportunities/[slug]`**
```
Response: Opportunity + live metrics { apy, tvl, apyChange24h, updatedAt }
Data: Fetch via recursiveDecompose(vaultAddress, chain)
  - Read vault on-chain (getVaultInfo, viem RPC)
  - Calculate APY from decomposition tree
  - Price via getTokenData (GoldRush pricing API)
Cache: 60s
Error: Return 404 if slug not found
```

### GoldRush Endpoints Used

Reuse existing calls in `lib/goldrush.ts` and `lib/vault.ts`:

1. **Token pricing & metadata**
   ```
   POST https://api.covalenthq.com/v1/pricing/historical_by_addresses_v2/{chain}/USD/{addresses}
   Returns: name, symbol, decimals, logo, price, 24h price (for change %)
   ```

2. **On-chain reads (via viem + fallback RPC)**
   ```
   RPC: https://rpc.goldrushdata.com/v1/{chain} (auth), fallback to public nodes
   Calls: totalAssets(), asset(), decimals(), MORPHO(), EVC()
   For Morpho Blue: position(), market(), utilization → APY calculation
   ```

3. **Wallet balances (if needed for filtering)**
   ```
   GoldRushClient.BalanceService.getTokenBalancesForWalletAddress()
   ```

---

## Frontend

### List View (`/earn`)

**Components:**
- `app/earn/page.tsx` — Main page, fetch `/api/opportunities`, render grid
- `components/OpportunityCard.tsx` — Card: name, APY, TVL, badges, click → detail
- `components/OpportunityFilters.tsx` — Dropdowns: chain, protocol, risk, sort, search

**Layout:**
```
[Search] [Chain▼] [Protocol▼] [Risk▼] [Sort:APY▼]
────────────────────────────────────────────────
┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
│Opp 1 │ │Opp 2 │ │Opp 3 │ │Opp 4 │
│8.2%  │ │5.1%  │ │4.8%  │ │3.2%  │
│$120M │ │$85M  │ │$42M  │ │$210M │
└──────┘ └──────┘ └──────┘ └──────┘
```

### Detail View (`/earn/[slug]`)

**Components:**
- `app/earn/[slug]/page.tsx` — Fetch `/api/opportunities/[slug]`, render detail
- `components/OpportunityDetail.tsx` — Strategy, risk, metrics, CTAs

**Layout:**
```
[Back]
Protocol/Chain/Risk badges
Name
Description

8.2% APY | $120M TVL | 3 positions | Updated: 2 min ago

┌─────────────────┐ ┌──────────────┐
│ Strategy        │ │ Quick Facts  │
│ Description...  │ │ Morpho Blue  │
│                 │ │ ETH mainnet  │
│ Highlights:     │ │ Low risk     │
│ • Point A       │ │              │
│ • Point B       │ │ Risk factors │
│ • Point C       │ │ • SC risk    │
└─────────────────┘ │ • Oracle     │
                    └──────────────┘

[View Vault] [Deposit →]
```

---

## File Structure

**New:**
```
types/
  └── opportunity.ts

lib/
  ├── opportunities-data.ts         # Hardcoded list
  └── opportunities.ts              # Filter/sort logic

app/
  ├── earn/
  │   ├── page.tsx                  # List
  │   └── [slug]/page.tsx           # Detail
  └── api/opportunities/
      ├── route.ts                  # List API
      └── [slug]/route.ts           # Detail API

components/
  ├── OpportunityCard.tsx
  ├── OpportunityDetail.tsx
  └── OpportunityFilters.tsx
```

**Modified:**
```
app/page.tsx                        # Add link: "Explore Opportunities" → /earn
```

---

## Implementation Checklist

- [ ] **Data & Types** (1 day)
  - [ ] Define Opportunity interface
  - [ ] Create opportunities-data.ts with ~25 seed opportunities
  - [ ] Create opportunities.ts with filter/sort helpers

- [ ] **API Routes** (1.5 days)
  - [ ] `/api/opportunities` (list, filter, sort)
  - [ ] `/api/opportunities/[slug]` (fetch + live metrics via recursiveDecompose)
  - [ ] Caching + error handling

- [ ] **List Page** (1.5 days)
  - [ ] app/earn/page.tsx (fetch + state management)
  - [ ] OpportunityCard.tsx (render, click handler)
  - [ ] OpportunityFilters.tsx (dropdowns, search)
  - [ ] Responsive grid layout

- [ ] **Detail Page** (1.5 days)
  - [ ] app/earn/[slug]/page.tsx (fetch + render)
  - [ ] OpportunityDetail.tsx (strategy, risk, CTAs)
  - [ ] Links to /vault and protocol UIs
  - [ ] Responsive layout

- [ ] **Polish & QA** (1 day)
  - [ ] Responsive mobile (cards stack, filters collapse)
  - [ ] Lazy-load images
  - [ ] Error states (404, no results)
  - [ ] Breadcrumb nav between /vault ↔ /earn

**Total: 6–7 days** (MVP ready for testing)

---

## Key Decisions

| Item | Choice | Why |
|------|--------|-----|
| Data source | Hardcoded JSON in code | Control, no external API dependency, manual updates OK at launch |
| APY freshness | 60s cache (5min browser) | Balances real-time feel vs. RPC load |
| Routing | Slug-based (`/earn/slug`) | SEO-friendly, human-readable, prevents URL collisions |
| Filters | Simple dropdowns | Fast MVP; upgrade to faceted search if 100+ opportunities |
| Detail layout | 2-column (strategy + sidebar) | Matches Jumper.xyz pattern; easy to scan |
| Admin | None (edit data.ts + redeploy) | Phase 2 post-launch; fine for manual curation |

---

## Notes on GoldRush Integration

1. **APY Calculation:**
   - Morpho vaults: Read from `MarketPosition.supplyApy` (already in decomposer)
   - Other ERC-4626: Store manually in seed data (use protocol's web APY as reference)
   - Comet (Compound v3): No built-in APY endpoint; store in seed data

2. **TVL:**
   - Read `rootNode.balanceUSD` from `recursiveDecompose()` output

3. **24h Change:**
   - Use `rootNode.balance24hChange` (already in VaultNode)
   - Convert to % change: `(change / tvl) * 100`

4. **Historical APY:**
   - MVP: Store sample points in seed data
   - Phase 2: Optional DefiLlama integration for time-series

---

## Slug Examples

```
"Steakhouse USDC" (ETH)     → "steakhouse-usdc-eth"
"Moonwell USDC" (Base)      → "moonwell-usdc-base"
"Re7 WETH" (ETH)            → "re7-weth-eth"
"Gauntlet USDC Core" (ETH)  → "gauntlet-usdc-core-eth"
```

Enforce uniqueness in seed data; no UUID suffix needed if manually curated.

---

## Success Criteria (MVP)

- [ ] `/earn` loads & displays 25+ opportunities in <1s
- [ ] Filters (chain, protocol, risk, search) work
- [ ] Click card → navigate to `/earn/[slug]`
- [ ] Detail page shows APY, TVL, strategy, risk, CTAs
- [ ] Links to `/vault/[address]?chain=...` work
- [ ] Mobile responsive (cards stack, layout adjusts)
- [ ] No 404s on deployed opportunities

---

## Future (Phase 2+)

- Admin panel (CRUD opportunities without redeploy)
- Historical APY chart (time-series storage + UI)
- Real-time APY polling (30s refresh on list)
- Related opportunities sidebar (similar asset/protocol)
- Breadcrumb nav and cross-links between /vault ↔ /earn
- Analytics: track clicks to vault explorer vs. protocol

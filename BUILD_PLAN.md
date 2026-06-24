# Build Plan: Earn Opportunities Implementation

**Timeline:** 6-7 days (MVP to shipping)

## Phase 1: MVP (Days 1-3) - List + Detail

### Day 1: List View (Card Grid)
- [ ] Create `app/earn/page.tsx` (client component)
- [ ] Create `components/OpportunityFilters.tsx` (search, dropdowns)
- [ ] Create `components/OpportunityCard.tsx` (already exists, enhance)
- [ ] Create `components/OpportunityList.tsx` (grid layout)
- [ ] Fetch from `/api/opportunities?chain=...&protocol=...`
- [ ] Implement filters (chain, protocol, risk, search)
- [ ] Implement sorting (APY, TVL, name)
- [ ] Empty states (loading, error, no results)
- [ ] Mobile responsive

### Day 2: Detail View
- [ ] Create `app/earn/[slug]/page.tsx` (client component)
- [ ] Create `components/OpportunityDetail.tsx` (layout)
- [ ] Create `components/OpportunityHeader.tsx` (metrics, badges)
- [ ] Create `components/OpportunityStrategy.tsx` (strategy section)
- [ ] Create `components/OpportunitySidebar.tsx` (quick facts, risk)
- [ ] Fetch from `/api/opportunities/[slug]` (live APY/TVL)
- [ ] Implement CTAs (View Vault, Deploy)
- [ ] Mobile responsive

### Day 3: Polish MVP
- [ ] Error handling (404, network errors)
- [ ] Loading states (skeleton cards)
- [ ] Breadcrumb navigation
- [ ] Link from homepage to `/earn`
- [ ] Browser testing
- [ ] Deploy MVP

---

## Phase 2: Enhanced Features (Days 4-5)

### Day 4: Table View + View Toggle
- [ ] Create `components/OpportunityTable.tsx` (sortable columns)
- [ ] Create `components/ViewToggle.tsx` (grid/table buttons)
- [ ] Implement sorting (click headers to sort)
- [ ] Add pagination (20 rows per page)
- [ ] Show address under vault name
- [ ] Responsive: hide columns on mobile

### Day 5: Info Tooltips
- [ ] Create `components/InfoTooltip.tsx` (reusable)
- [ ] Add tooltips to: APY, TVL, Risk
- [ ] Implement tooltip positioning (above/below)
- [ ] Keyboard accessible (focus shows tooltip)
- [ ] Mobile: tap to show, tap elsewhere to hide

---

## Phase 3: Educational Docs (Days 6-7, optional)

### Day 6: Docs Structure
- [ ] Create `app/earn/docs/page.tsx`
- [ ] Create `components/DocsSidebar.tsx` (navigation)
- [ ] Create `components/DocsContent.tsx` (scrollspy)
- [ ] Write docs content (5 sections)
- [ ] Landing page modal/banner

### Day 7: Polish & Deploy
- [ ] Test all user flows
- [ ] Accessibility audit
- [ ] Performance: lazy-load images
- [ ] SEO: meta tags
- [ ] Deploy Phase 3

---

## Key Files to Create

```
app/
  ├── earn/
  │   ├── page.tsx                    (list view)
  │   ├── [slug]/
  │   │   └── page.tsx                (detail view)
  │   └── docs/
  │       └── page.tsx                (docs, Phase 3)
  │
  └── layout.tsx                      (update: add nav link)

components/
  ├── OpportunityList.tsx             (grid container)
  ├── OpportunityTable.tsx            (table view, Phase 2)
  ├── OpportunityCard.tsx             (already exists, enhance)
  ├── OpportunityFilters.tsx          (search + filters)
  ├── ViewToggle.tsx                  (grid/table toggle, Phase 2)
  ├── OpportunityDetail.tsx           (detail layout)
  ├── OpportunityHeader.tsx           (header section)
  ├── OpportunityStrategy.tsx         (strategy + risk)
  ├── OpportunitySidebar.tsx          (quick facts)
  ├── InfoTooltip.tsx                 (reusable tooltip, Phase 2)
  └── DocsSidebar.tsx                 (docs nav, Phase 3)

lib/
  ├── opportunities-data.ts           (already exists, use as-is)
  └── opportunities.ts                (filter/sort logic, already exists)
```

---

## Implementation Strategy

**Use existing patterns:**
- Mirror `app/vault/[address]/page.tsx` structure
- Reuse existing Tailwind + CSS vars
- Reuse existing API fetching pattern
- Leverage viem + GoldRush infrastructure

**No dependencies to add** (use existing Next.js + React + Tailwind)

**State management:** `useState` for filters, view mode (no Redux/Zustand)

**Testing:** Manual via browser (no Jest needed for MVP)

---

## Success Criteria

✅ MVP (Day 3):
- [ ] `/earn` list view works with 6 seed opportunities
- [ ] `/earn/[slug]` detail view works
- [ ] Live APY/TVL fetching works
- [ ] Filters work (chain, protocol, risk, search)
- [ ] Mobile responsive
- [ ] No console errors

✅ Phase 2 (Day 5):
- [ ] Table view renders and sorts
- [ ] View toggle works
- [ ] Pagination works (table)
- [ ] Info tooltips work

✅ Phase 3 (Day 7):
- [ ] Docs page loads
- [ ] Sidebar nav works
- [ ] Modal/banner on list view

---

## Rollout Strategy

1. **Commit MVP on Day 3** → Test in branch
2. **Commit Phase 2 on Day 5** → More features
3. **Commit Phase 3 on Day 7** → Educational content
4. **Final PR review** → Ship all at once

Or deploy MVP on Day 3, then Phase 2-3 as follow-ups.

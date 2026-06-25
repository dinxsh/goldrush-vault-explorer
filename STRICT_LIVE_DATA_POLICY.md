# Strict Live-Only Data Policy
## GoldRush Vault Explorer - No Fallback Data

**Effective:** 2026-06-25  
**Commit:** 71707d2  
**Status:** ✅ Enforced Across Entire Platform

---

## Core Philosophy

**One Rule: LIVE DATA ONLY**

- ✅ Return live blockchain data when available
- ❌ Never fall back to static/cached data
- 🚨 Return explicit errors when live data unavailable
- 📊 Always transparently indicate data source

---

## Why No Fallback Data?

### Problems with Silent Fallbacks
1. **User Deception** — Users think data is current when it's stale
2. **Risk Exposure** — Outdated APY/TVL leads to bad decisions
3. **Hidden Failures** — Users don't know data is unavailable
4. **Debugging Nightmare** — Hard to trace data freshness issues

### Benefits of Strict Live-Only
1. **Transparency** — Users know exactly what they're seeing
2. **Trust** — Real data or honest error, never misleading data
3. **Debugging** — Clear error codes and recovery guidance
4. **Data Quality** — Forces fix protocol issues instead of hiding them

---

## Data Sources

### ✅ Live (Blockchain) Data
- Direct RPC calls to blockchain nodes
- ERC-4626 vault interface calls
- Current balances and APY calculations
- Updated in real-time

### ❌ Removed: Static Data Fallback
- Database default APY values
- Cached TVL figures
- Historical snapshots
- Estimated yields

---

## Error Handling Strategy

### When Live Data Fails

#### Scenario 1: Network Unreachable
```
Request → RPC Timeout (8 seconds)
         → Return 503 VAULT_DATA_FETCH_FAILED
         → Suggest: "Try again in a moment"
```

#### Scenario 2: Invalid Contract
```
Request → Contract doesn't implement ERC-4626
         → Return 503 INVALID_VAULT_DATA
         → Suggest: "Contact protocol team"
```

#### Scenario 3: Missing APY
```
Request → Contract doesn't expose APY
         → Return 503 APY_DATA_MISSING
         → Suggest: "APY not available for this vault"
```

### Error Response Structure
```json
{
  "error": "Human-readable error message",
  "errorCode": "VAULT_DATA_FETCH_FAILED",
  "slug": "vault-slug",
  "vault": {
    "address": "0x...",
    "chain": "eth-mainnet",
    "protocol": "Morpho"
  },
  "timestamp": "2026-06-25T...",
  "suggestedAction": "What user should do next"
}
```

---

## API Behavior

### GET /api/opportunities/[slug]

#### Success Case (200)
```json
{
  "slug": "morpho-steakhouse-usdc-eth",
  "name": "Steakhouse USDC",
  "apy": 0.0825,
  "tvl": 285000000,
  "apyChange24h": 0.0034,
  "dataSource": "live",
  "updatedAt": 1687000320000,
  "chain": "eth-mainnet",
  "protocol": "Morpho"
}
```

**Headers:**
- `X-Data-Source: live`
- `X-Vault-Data: blockchain-live`
- `Cache-Control: public, max-age=60`

#### Error Case (503)
```json
{
  "error": "Failed to fetch live vault data: Vault data fetch timeout after 8000ms",
  "errorCode": "VAULT_DATA_FETCH_FAILED",
  "slug": "gearbox-usdc-leverage-eth",
  "vault": {
    "address": "0xb3b14e5d...",
    "chain": "eth-mainnet",
    "protocol": "Gearbox"
  },
  "timestamp": "2026-06-25T14:32:00.000Z",
  "suggestedAction": "This vault's live blockchain data is currently unavailable..."
}
```

---

## Error Codes

| Code | HTTP | Meaning | Recovery |
|------|------|---------|----------|
| `VAULT_DATA_FETCH_FAILED` | 503 | Network/RPC error | Retry in moments |
| `INVALID_VAULT_DATA` | 503 | Contract incompatible | Contact protocol |
| `APY_DATA_MISSING` | 503 | APY unavailable | N/A for this vault |
| `INVALID_SLUG` | 400 | Bad slug format | Check slug |
| `VAULT_NOT_FOUND` | 404 | Vault doesn't exist | List available vaults |

---

## Implementation Details

### Detail Endpoint Flow
```
GET /api/opportunities/[slug]
  ↓
Validate slug (400 error if invalid)
  ↓
Look up in database (404 error if not found)
  ↓
Fetch LIVE blockchain data (8 second timeout)
  ├─ Success → Validate response
  │   ├─ Has balanceUSD → Check APY
  │   │   ├─ Has APY → Return 200 with live data
  │   │   └─ No APY → Return 503 APY_DATA_MISSING
  │   └─ Empty → Return 503 INVALID_VAULT_DATA
  └─ Timeout/Error → Return 503 VAULT_DATA_FETCH_FAILED
```

### Data Source Headers
Every response includes:
- `X-Data-Source: live` — Always live, never static
- `X-Vault-Data: blockchain-live` — From blockchain RPC

---

## For Frontend Developers

### What to Expect

**✅ Success (200):** Real blockchain data, ready to display
```javascript
if (response.ok) {
  const vault = await response.json();
  // vault.dataSource === 'live'
  // vault.updatedAt === current timestamp
  // Safe to display and make decisions based on
}
```

**❌ Error (503):** Live data unavailable, show error UI
```javascript
if (response.status === 503) {
  const error = await response.json();
  // error.errorCode identifies the issue
  // error.suggestedAction guides user
  // Show error UI with recovery options
}
```

### Never Do This
```javascript
// ❌ Don't assume it falls back to static data
const data = response.ok ? json : getCachedData();

// ❌ Don't ignore errors and show old data
if (!response.ok) return lastKnownData;

// ❌ Don't silence errors to users
if (error) { /* show nothing */ }
```

### Always Do This
```javascript
// ✅ Trust that data is always live or error
const data = await response.json();

// ✅ Show errors explicitly to users
if (error.errorCode) {
  showErrorUI(error.message, error.suggestedAction);
}

// ✅ Check data source for transparency
console.log(data.dataSource); // Always 'live'
```

---

## Migration from Previous Version

### Breaking Changes
- No more static data fallback
- Previously working vaults that don't support ERC-4626 will error
- APY changes are no longer synthetic (were ±2% deterministic)
- Static data fields no longer used

### Affected Vaults
- Non-ERC-4626 vaults: Gearbox, and others
- Vaults without APY exposure: Will error
- Vaults with network issues: Will error

### How to Fix Vaults
1. **Network Errors** — Infrastructure will auto-recover
2. **Incompatible Contracts** — Protocol team must implement ERC-4626
3. **Missing APY** — Protocol must expose APY data on-chain

---

## Monitoring & Alerts

### Track These Metrics
- `VAULT_DATA_FETCH_FAILED` error rate
- `APY_DATA_MISSING` occurrences
- Average response time (should be <500ms)
- Timeout vs network error ratio

### Alert Thresholds
- > 5% 503 error rate → Investigate RPC/network
- Any vault consistently failing → Flag protocol team
- Timeouts increasing → RPC latency issue

---

## FAQ

**Q: Why not use static data as fallback?**
A: Users deserve honest data. Stale data is worse than no data.

**Q: What if blockchain is down?**
A: Users get a clear error. They know to try again later.

**Q: What if vault contract is broken?**
A: Error message tells them to contact the protocol team.

**Q: Can we cache results?**
A: Yes, but only cache successful live responses (max 60s).

**Q: What about historical data?**
A: Use APY history API (`/api/apy-history`), not fallback.

---

## Summary

- ✅ **Live-only:** All data is current blockchain data
- ✅ **No fallback:** Explicit errors instead of stale data
- ✅ **Transparent:** Data source always indicated
- ✅ **Debuggable:** Clear error codes and guidance
- ✅ **User-friendly:** Honest data builds trust

**Status:** Strictly Enforced Across Entire Platform ✅

**Commit:** 71707d2  
**Build:** ✓ Clean (9.9s, 0 errors)  
**Deployment:** Ready for Vercel ✅

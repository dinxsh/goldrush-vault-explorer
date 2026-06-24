# Vault Data Sourcing & Integration Guide
## Comprehensive Vault Discovery Across All DeFi Protocols

**Status:** Ready for Implementation  
**Estimated Integration Time:** 3-4 weeks  
**Data Coverage Target:** 300+ vaults across 6+ chains

---

## 1. VAULT DISCOVERY SOURCES BY PROTOCOL

### 1.1 Morpho Blue (Highest Priority - Core to Strategy)

**Protocol Overview:** Modular lending primitive
- **Mainnet Address:** 0xBBBBBbbBBb9cC89eCAFQaDF567840C33F20B318e
- **Subgraph:** https://api.thegraph.com/subgraphs/name/morpho-org/morpho-blue-ethereum
- **Vaults Estimated:** 80+ active, 200+ historical

**Integration Points:**

```typescript
// 1. Factory Query - List all active markets
query {
  markets(first: 1000) {
    id
    collateralAsset { symbol address decimals }
    loanAsset { symbol address decimals }
    oracle { address }
    irm { address }
    maxMarketBorrow
    supplyApy
    borrowApy
  }
}

// 2. MetaMorpho Vaults - Vault managers
query {
  metamorphoVaults(first: 1000) {
    id
    name
    asset { symbol address }
    curator
    owner
    totalAssets
    totalShares
  }
}

// 3. Events - New vault creation
subscription {
  metamorphoCreated(first: 1000) {
    id
    indexed
    logIndex
    transaction { id }
  }
}
```

**Vault Types to Index:**
1. **MetaMorpho Vaults** - Actively managed (Steakhouse, Gauntlet, Re7)
2. **Direct Morpho Blue Markets** - Base lending pairs (as backup)

**Data to Extract:**
- Vault name, symbol, asset
- Current APY (from recent interest)
- TVL (totalAssets × priceUSD)
- Manager/curator address (for filtering trusted vaults)
- Creation date

---

### 1.2 Aave V3 (Broad Coverage - All Chains)

**Protocol Overview:** Largest lending protocol
- **Ethereum:** 0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e (LendingPoolAddressesProvider)
- **Arbitrum:** 0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb
- **Optimism:** 0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb
- **Base:** 0x1a13D4D5573D5d8a25ff759843c36eDa3379379D
- **Polygon:** 0xd05e3E715d945B59290df0ae8eF85c1BdB684744
- **Avalanche:** 0xb6A86025F0FE1862B372cb817ca8FA41b6D02FF7

**Subgraph Pattern:** `https://api.thegraph.com/subgraphs/name/aave/protocol-v3-{chain}`

**Vaults Estimated:** 150+ total (25-40 per chain)

**Integration Points:**

```typescript
// 1. Reserve markets - Get all lending markets
query {
  reserves(first: 1000) {
    id
    name
    symbol
    underlyingAsset
    liquidityRate
    variableBorrowRate
    stableBorrowRate
    totalLiquidity
    utilizationRate
  }
}

// 2. Calculate APY - Interest rate math
const supplyApy = (liquidityRate / 1e27) * 100  // Ray math
const borrowApy = (variableBorrowRate / 1e27) * 100

// 3. Incentives - Rewards programs
query {
  incentiveData(first: 1000) {
    reserve { id }
    emissionPerSecond
    rewardTokenAddress
    rewardTokenDecimals
  }
}
```

**Vault Types to Index:**
1. **Supply positions** - aTokens (aUSDC, aDAI, etc.)
2. **Borrow opportunities** - Variable rate

**Data to Extract:**
- Supply APY (liquidityRate-based)
- Borrow APY (variableBorrowRate)
- Total liquidity (TVL)
- Incentive APY (reward tokens)
- Risk parameters (collateral factor, LTV)

---

### 1.3 Curve Finance (Stableswap + LPs)

**Protocol Overview:** Stablecoin DEX & AMM
- **Factory:** 0xF18056Bbd320E96A48e3519c41a9b9d1A6A3e756
- **Subgraph:** https://api.thegraph.com/subgraphs/name/messari/curve-finance-ethereum
- **Vaults Estimated:** 60-80 active pools

**Integration Points:**

```typescript
// 1. Pool registry - All active pools
query {
  liquidityPools(first: 1000) {
    id
    name
    symbol
    totalValueLockedUSD
    outputTokenSupply
    fees  // APY derived from trading fees
    tokens { symbol }
  }
}

// 2. Gauge yields - LP rewards
query {
  gauges(first: 1000) {
    workingSupply
    crvRewardRate
    gauge_address
  }
}

// 3. Fee APY calculation
// APY = (24h trading volume × fee rate / TVL) × 365
```

**Vault Types to Index:**
1. **3Pool (USDC/USDT/DAI)** - Stablecoin swapping
2. **Factory pools** - Various stable pairs
3. **Gauge yields** - CRV rewards

**Data to Extract:**
- Pool APY (trading fees)
- CRV rewards APY
- TVL (totalValueLockedUSD)
- Asset composition
- Historical fee data

---

### 1.4 Yearn Finance V3 (Active Strategies)

**Protocol Overview:** Strategy aggregator
- **Registry:** 0x50c1a2eA2a5bCE4b3d32d5Cb46937Ff8Fcf5b11b (V3 Registry)
- **Subgraph:** https://api.thegraph.com/subgraphs/name/yearn/yearn-vaults-v3-ethereum
- **Vaults Estimated:** 20-30 active

**Integration Points:**

```typescript
// 1. Vault registry - All deployed vaults
query {
  vaults(first: 1000) {
    id
    symbol
    asset { symbol }
    totalAssets
    pricePerShare
    strategies { address name }
  }
}

// 2. Historical APY - Strategy performance
query {
  vaultDayDatas(first: 365) {
    vault { id }
    timestamp
    pricePerShare  // Calculate from daily change
  }
}

// 3. Strategy details
query {
  strategies(first: 1000) {
    vault { id }
    name
    address
    totalAssets
  }
}
```

**Vault Types to Index:**
1. **V3 Vaults** - Latest generation strategies
2. **Strategy breakdown** - Multi-strategy vaults

**Data to Extract:**
- Strategy APY (from pricePerShare changes)
- Strategy names (for descriptions)
- TVL (totalAssets)
- Underlying asset
- Creation date

---

### 1.5 Compound (Classic Lending)

**Protocol Overview:** Lending protocol (cToken based)
- **Ethereum:** 0x3d9819210a31b4961b30ef54dc2f4b50b15d5e1f (Comptroller)
- **Arbitrum:** 0xa86e122EBDcbc680sdc1848e0B1e73b8Ca5f39a (Comet)
- **Base:** 0xb125E6687d4313864e53df431d5417e9a61859ae
- **Subgraph:** https://api.thegraph.com/subgraphs/name/messari/compound-ethereum

**Vaults Estimated:** 15-20 per chain

**Integration Points:**

```typescript
// 1. Markets - All lending markets
query {
  markets(first: 1000) {
    id
    name
    symbol
    underlyingToken { symbol }
    exchangeRate  // cToken/underlying ratio
    supplyRate
    borrowRate
    totalSupply
  }
}

// 2. COMP distribution
query {
  compData {
    market { id }
    compSpeed
  }
}
```

**Data to Extract:**
- Supply APY (supplyRate + COMP distribution)
- Borrow APY (borrowRate + COMP)
- TVL (totalSupply × exchange rate)
- Risk parameters

---

### 1.6 Lido & Liquid Staking

**Lido (stETH)**
- **Contract:** 0xae7ab96520DE3A18E5e111B5EaAc2D6F0b82F2fC
- **APY Source:** Beacon chain APY + MEV + Lido fees
- **Current APY:** ~3.2% (check @lido_oracle)
- **Subgraph:** https://api.thegraph.com/subgraphs/name/lidofinance/lido-ethereum

```typescript
// 1. stETH APY
query {
  dailyDatas(first: 365) {
    timestamp
    apr  // Daily APR
  }
}

// 2. TVL - Total staked ETH
query {
  protocol {
    totalStaked
  }
}
```

**Rocket Pool (rETH)**
- **Contract:** 0xae78eb9030eb3a280d256a300ee4461551d50328
- **APY Source:** Network rewards + Rocket Pool fees
- **Current APY:** ~3.5%
- **API:** https://rocketpool.net/api/...

---

### 1.7 Pendle (Yield Trading)

**Protocol Overview:** Decentralized yield marketplace
- **Contract:** 0x6DB96BBEB081d82D67bA0ba3789B5246f932Fef9
- **Subgraph:** https://api.thegraph.com/subgraphs/name/pendle-finance/pendle-mainnet
- **Vaults Estimated:** 40+ yield markets

**Integration Points:**

```typescript
// 1. Markets - Yield trading pairs
query {
  markets(first: 1000) {
    id
    principalToken { symbol }
    yieldToken { symbol }
    impliedApy
    totalValueLockedUSD
  }
}

// 2. Underlying yield source
// Each market wraps a yield-bearing token
// Example: PT-stETH (principal token of stETH, separates yield)
```

**Data to Extract:**
- Implied APY (option-based pricing)
- TVL
- Underlying asset (stETH, aDAI, etc.)
- Maturity date (for time-limited yields)

---

### 1.8 Gearbox (Leveraged Yield)

**Protocol Overview:** Leverage for yield farming
- **Contract:** 0xA50Bbf00C33935F069e352e1Ad39956CC674d86b
- **Subgraph:** https://api.thegraph.com/subgraphs/name/gearboxprotocol/gearbox-ethereum
- **Vaults Estimated:** 10-15 positions

**Integration Points:**

```typescript
// 1. Credit accounts - Leveraged positions
query {
  creditAccounts(first: 1000) {
    id
    manager
    borrowAmount
    leverage
    collaterals { symbol }
  }
}

// 2. Farms - Leverage targets
query {
  farmPools(first: 1000) {
    name
    underlyingToken
    expectedApy  // With leverage baked in
  }
}
```

**Data to Extract:**
- Leveraged APY (base APY × leverage)
- Risk level (leverage ratio, liquidation risk)
- Underlying farm
- TVL

---

### 1.9 Sommelier (Active Management via Strategies)

**Protocol Overview:** Coprocessor-based active management
- **Contract:** 0x1Eb2eC3Bb5a0DAA1bB0f2f937F2c72A4c15eDe8a
- **API:** https://api.sommelier.finance
- **Vaults Estimated:** 5-10 strategies

**Integration Points:**

```typescript
// 1. Strategies - Active positions
GET /strategies
Response:
{
  "strategies": [
    {
      "id": "somm-curve-stable",
      "name": "Curve Stable Yield",
      "apy": 0.0487,
      "tvl": 50_000_000,
      "asset": "USDC",
      "rebalance_schedule": "weekly"
    }
  ]
}

// 2. Performance metrics
GET /strategies/{id}/performance
```

**Data to Extract:**
- Strategy APY
- Rebalancing frequency
- TVL
- Strategy description
- Performance history

---

### 1.10 EigenLayer (Restaking Yields)

**Protocol Overview:** Restaking protocol for Ethereum validators
- **Contract:** 0x858646983B2f07b4Cfe7f5479113f3Babe40503b
- **Subgraph:** https://api.thegraph.com/subgraphs/name/eigenlayer/eigenlayer-ethereum
- **Vaults Estimated:** 3-5 operators

**Integration Points:**

```typescript
// 1. Operators - Restaking operators
query {
  operators(first: 1000) {
    id
    address
    totalStaked
    delegators
  }
}

// 2. Rewards - Operator rewards
query {
  rewardEvents(first: 1000) {
    operator { id }
    token { symbol }
    amount
  }
}

// 3. Calculate APY
// APY = (sum of rewards over 365 days / TVL) × 100
```

**Data to Extract:**
- Operator APY (historical rewards)
- TVL staked with operator
- Operator reputation/slashing risk
- Token rewards

---

## 2. SMART CONTRACT SCANNING ARCHITECTURE

### 2.1 Automated Vault Discovery

```typescript
interface VaultScanner {
  name: string
  protocol: string
  chains: Chain[]
  factoryAddress: string
  eventSignature: string  // e.g., "event Transfer(indexed address, ...)"
  dataExtractor: (event) => VaultData
}

// Implementation pattern
class MorphoScanner implements VaultScanner {
  async discoverVaults() {
    // 1. Query factory events
    const events = await ethers.provider.getLogs({
      address: MORPHO_FACTORY,
      topics: [NEW_MARKET_SIGNATURE],
      fromBlock: DEPLOY_BLOCK,
      toBlock: 'latest'
    })

    // 2. Extract vault addresses
    const vaults = events.map(e => {
      const marketId = e.topics[1]  // First indexed arg
      return extractVaultData(marketId)
    })

    // 3. Normalize to canonical schema
    return vaults.map(normalizeVault)
  }
}
```

### 2.2 Real-Time Event Monitoring

```typescript
// Listen for new vaults in real-time
provider.on({
  address: MORPHO_FACTORY,
  topics: [NEW_MARKET_SIGNATURE]
}, (log) => {
  const vault = extractVaultData(log)
  db.insert('vaults', vault)
  eventBus.emit('vault_discovered', vault)
})

// Broadcast to frontend via WebSocket
io.emit('vault_discovered', {
  vault_id: vault.id,
  name: vault.name,
  apy: vault.apy,
  chain: vault.chain
})
```

### 2.3 Data Validation Pipeline

```typescript
interface ValidationRule {
  field: string
  rules: ValidationFn[]
}

const validationRules: ValidationRule[] = [
  {
    field: 'apy',
    rules: [
      (v) => v >= 0 && v <= 10,  // Sanity check
      (v) => !isNaN(v),           // Not NaN
      (v) => Number.isFinite(v)   // Not Infinity
    ]
  },
  {
    field: 'tvl',
    rules: [
      (v) => v >= 0,
      (v) => v < 1e18  // Less than ~$1 quadrillion
    ]
  },
  {
    field: 'address',
    rules: [
      (v) => /^0x[a-fA-F0-9]{40}$/.test(v)  // Valid address format
    ]
  }
]
```

---

## 3. API SCHEMA - VAULT ENDPOINT RESPONSES

### 3.1 List All Vaults

```
GET /api/vaults
GET /api/vaults?chain=eth&protocol=Morpho&apy_min=5&risk=low

Response:
{
  "vaults": [
    {
      "id": "morpho-steakhouse-usdc-eth",
      "name": "Steakhouse USDC",
      "description": "MetaMorpho USDC vault by Steakhouse Finance",
      "chain": "eth-mainnet",
      "protocol": "Morpho",
      "asset": {
        "symbol": "USDC",
        "address": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        "decimals": 6
      },
      "apy": 0.0825,
      "tvl": 285000000,
      "riskLevel": "low",
      "riskFactors": ["smart_contract", "oracle"],
      "audits": [
        {
          "firm": "OpenZeppelin",
          "date": "2024-03-01",
          "status": "passed"
        }
      ],
      "address": "0xbeef01735c132ada46aa9aa4c54623caa92a64cb",
      "chain_icon": "ethereum",
      "protocol_icon": "morpho",
      "updated_at": "2026-06-25T14:32:00Z"
    },
    ...
  ],
  "total": 256,
  "page": 1,
  "per_page": 50
}
```

### 3.2 Vault Detail with History

```
GET /api/vaults/{id}
GET /api/vaults/morpho-steakhouse-usdc-eth

Response:
{
  "vault": {
    ...vault data...
    "apy_history": [
      {"timestamp": "2026-06-25T14:30:00Z", "apy": 0.0825},
      {"timestamp": "2026-06-25T14:20:00Z", "apy": 0.0820},
      ...last 48 hours in 10-min increments...
    ],
    "tvl_history": [
      {"timestamp": "2026-06-25T14:30:00Z", "tvl": 285000000},
      ...
    ],
    "strategy": {
      "description": "Allocates USDC to Morpho Blue markets...",
      "highlights": ["High APY", "Battle-tested"],
      "fee": "1% management fee"
    },
    "governance": {
      "curator": "0x...",
      "reward_token": "none"
    }
  }
}
```

### 3.3 Filtered Search

```
GET /api/vaults/search?q=usdc&chain=ethereum&min_apy=5&max_apy=15

Response:
{
  "query": "usdc",
  "filters": {
    "chain": "ethereum",
    "apy_range": [0.05, 0.15]
  },
  "results": [...vaults matching...]
}
```

---

## 4. IMPLEMENTATION CHECKLIST

### Phase 1: Core Data Pipeline (Weeks 1-2)

- [ ] Set up Subgraph queries for Morpho Blue
- [ ] Implement Morpho vault discovery service
- [ ] Create vault data normalization layer
- [ ] Build PostgreSQL schema for vault storage
- [ ] Implement API endpoint `/api/vaults`
- [ ] Add real-time metrics calculation (APY, TVL)
- [ ] Create data validation pipeline
- [ ] Set up monitoring/alerting for data quality

### Phase 2: Multi-Protocol Integration (Weeks 2-3)

- [ ] Add Aave V3 scanner (all 5 chains)
- [ ] Add Curve subgraph queries
- [ ] Add Yearn V3 scanner
- [ ] Add Compound scanner
- [ ] Add Lido/Rocket Pool APIs
- [ ] Add Pendle scanner
- [ ] Test cross-protocol deduplication
- [ ] Validate data accuracy vs on-chain

### Phase 3: Advanced Features (Week 4)

- [ ] Historical APY tracking (via metrics table)
- [ ] Risk scoring algorithm
- [ ] Audit information database
- [ ] Governance token tracking
- [ ] Real-time WebSocket updates
- [ ] API rate limiting + caching
- [ ] GraphQL endpoint for advanced queries

---

## 5. DATA FRESHNESS TARGETS

| Metric | Update Frequency | Method |
|--------|------------------|--------|
| APY | Every 10 minutes | On-chain calculation |
| TVL | Every 10 minutes | Balance × Price feed |
| Audits | Daily | Manual + API checks |
| Risk Score | Daily | Event-based + recalc |
| New Vaults | Real-time | Event listener |
| TVL History | Hourly | Snapshot before update |
| APY History | Every 10 min | Store every update |

---

## 6. ESTIMATED VAULT COVERAGE BY LAUNCH

| Protocol | Chains | Est. Vaults | Status |
|----------|--------|-------------|--------|
| Morpho Blue | ETH, Base, Arb, etc. | 80 | 🟢 High Priority |
| Aave | 5 (E, Arb, Op, Base, Polygon) | 40 | 🟢 Phase 1 |
| Curve | ETH, Polygon, Arb | 20 | 🟢 Phase 1 |
| Yearn | ETH, Arb | 15 | 🟢 Phase 1 |
| Compound | 3 (E, Arb, Base) | 12 | 🟡 Phase 2 |
| Pendle | ETH, Arb | 10 | 🟡 Phase 2 |
| Lido | ETH | 3 | 🟡 Phase 2 |
| Gearbox | ETH | 5 | 🟠 Phase 3 |
| EigenLayer | ETH | 5 | 🟠 Phase 3 |
| **Total** | **6+** | **190+** | |

---

## 7. NEXT STEPS

1. **This Week:**
   - [ ] Create Morpho scanner prototype
   - [ ] Validate subgraph queries
   - [ ] Design vault data schema

2. **Next Week:**
   - [ ] Deploy Morpho discovery (80+ vaults)
   - [ ] Add Aave scanner (40+ vaults)
   - [ ] Implement API endpoint

3. **Week 3:**
   - [ ] Add Curve, Yearn, Compound
   - [ ] Cross-protocol deduplication
   - [ ] Launch expanded UI (150+ vaults)

---

**Owner:** Backend Team  
**Timeline:** 4 weeks to 150+ vaults  
**Success Criteria:** 99%+ data accuracy, <10 min freshness


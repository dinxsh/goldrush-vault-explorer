# GoldRush Vault Explorer

Paste any EVM vault contract address and get back a recursive holdings table with live USD values. For **MetaMorpho** vaults the app goes past the headline "vault → underlying asset" view and decomposes the vault into the individual **Morpho Blue markets** it lends into, grouped by collateral, each priced in USD. A companion transaction feed shows recent vault interactions with decoded event names.

---

## What it shows

For a MetaMorpho vault like Steakhouse USDC:

```
Steakhouse USDC          $107.3M   [ERC-4626 Vault · Morpho]
├── WBTC Market           $74.4M   [Blue Market]   ← USDC lent against WBTC
├── cbBTC Market          $21.4M   [Blue Market]
├── wstETH Market          $7.3M   [Blue Market]
├── WETH Market            $2.1M   [Blue Market]
└── weETH Market           $2.1M   [Blue Market]
```

A plain ERC-4626 vault (Euler, Yearn, sDAI, …) resolves to its single underlying asset, and recurses if that underlying is itself a vault. A normal wallet address falls back to a flat GoldRush token-balance list.

---

## Why two data sources

A MetaMorpho vault's TVL is **not** held as ERC-20 balances at the vault address - it sits inside the Morpho Blue singleton's internal accounting. So no balances endpoint can see it. The app splits the work accordingly:

| Data | Source |
| --- | --- |
| Is it a vault? `asset()`, `totalAssets()`, share price | on-chain via **GoldRush JSON-RPC** (`rpc.goldrushdata.com`) |
| Morpho Blue markets, per-market supplied assets, collateral | on-chain via **GoldRush JSON-RPC** |
| Token prices (spot + 24h), names, symbols, logos | **GoldRush Foundational API** (pricing) |
| Recent transactions, decoded events, lifetime stats | **GoldRush Foundational API** (transactions) |

On-chain reads prefer GoldRush JSON-RPC and fall back to public RPC nodes (via viem's `fallback` transport) if a call errors, so the app stays up even when JSON-RPC credits run out.

---

## Prerequisites

- Node 18+
- A GoldRush API key - [register free](https://goldrush.dev/platform/auth/register). The same key authenticates both the REST API and the JSON-RPC endpoint.

---

## Install and run

```bash
npm install
cp .env.example .env   # paste your GOLDRUSH_API_KEY
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Featured vaults

| Name | Chain | Address |
| --- | --- | --- |
| Steakhouse USDC | Ethereum | `0xbeef01735c132ada46aa9aa4c54623caa92a64cb` |
| Steakhouse USDT | Ethereum | `0xbEef047a543E45807105E51A8BBEFCc5950fcfBa` |
| Gauntlet WETH Core | Ethereum | `0x4881Ef0BF6d2365D3dd6499ccd7532bcdBCE0658` |
| Gauntlet USDC Core | Ethereum | `0x8eB67A509616cd6A7c1B3c8C21D48FF57df3d458` |
| Moonwell Flagship USDC | Base | `0xc1256Ae5FF1cf2719D4937adb3bbCCab2E00A2Ca` |
| Re7 WETH | Ethereum | `0x78Fc2c2eD1A4cDb5402365934aE5648aDAd094d0` |

---

## How it works

The core is `lib/vault.ts:recursiveDecompose()`:

1. `getVaultInfo()` (`lib/rpc.ts`) reads `asset()` / `MORPHO()` on-chain to classify the address.
2. **MetaMorpho** → `buildMorphoTree()`: walk `withdrawQueue`, read each market's `position` and `market` from the Morpho Blue singleton, convert supply shares to assets, group by collateral token.
3. **Plain ERC-4626** → `buildErc4626Tree()`: show the underlying asset, recurse up to 3 levels if it's a nested vault.
4. **Anything else** → `getWalletHoldings()`: GoldRush `BalanceService` token list.
5. Prices, names, symbols and logos for every token come from one batched GoldRush pricing call (`lib/goldrush.ts:getTokenData()`).

---

## GoldRush docs

- [Foundational API - Balances & Pricing](https://goldrush.dev/docs/goldrush-foundational-api/overview)
- [JSON-RPC](https://goldrush.dev/docs/goldrush-json-rpc/overview)

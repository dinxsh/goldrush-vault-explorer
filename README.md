# GoldRush Vault Explorer

Paste any EVM vault contract address and get back a recursive holdings table with live USD values. The app calls the [GoldRush BalanceService](https://goldrush.dev/docs/goldrush-foundational-api/overview) to decompose a DeFi vault into its underlying token positions, detects ERC-4626 sub-vaults, and recurses up to three levels deep. A companion transaction feed shows the last ten vault interactions with decoded event names.

APIs used: `BalanceService.getTokenBalancesForWalletAddress`, `TransactionService.getAllTransactionsForAddressByPage`

---

## Prerequisites

- Node 18+
- A GoldRush API key — [register free](https://goldrush.dev/platform/auth/register)

---

## Install and run

```bash
npm install
cp .env.example .env   # paste your GOLDRUSH_API_KEY
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## How it works

The core is `lib/vault.ts:recursiveDecompose()`. Given a vault address and chain:

1. Call `BalanceService.getTokenBalancesForWalletAddress` for the vault address.
2. For each token returned, check `item.supports_erc` for `"erc4626"`.
3. If the token is itself an ERC-4626 vault, recurse into it (max depth: 3).
4. Sort all nodes by USD value descending.

```
vault (0xd63070...)
├── USDC                 $1,234,567   [Token]
├── 0x... (sub-vault)   $456,789     [ERC-4626 Vault]
│   ├── WETH             $300,000    [Token]
│   └── USDC             $156,789    [Token]
└── WBTC                 $89,123     [Token]
```

The GoldRush `supports_erc` field signals ERC-4626 compliance — no on-chain ABI calls needed.

---

## Preset vaults to try

| Name                     | Address                                      | Chain        |
| ------------------------ | -------------------------------------------- | ------------ |
| Morpho USDC              | `0xd63070114470f685b75B74D60EEc7c1113d33a3d` | base-mainnet |
| Euler USDC               | `0x797DD80692c3b2dAdabCe8e30C07a7d6E32914aa` | eth-mainnet  |
| Steakhouse USDC (Morpho) | `0xbeeF010f9cb27031Ad51e3333f9aF9C6B1228183` | base-mainnet |

---

## GoldRush docs

[GoldRush Foundational API — BalanceService](https://goldrush.dev/docs/goldrush-foundational-api/balance-service/get-token-balances-for-wallet-address/)

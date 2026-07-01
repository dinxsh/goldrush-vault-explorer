"use client";

import AddressInput from "@/components/AddressInput";
import { type SupportedChain } from "@/types/vault";
import { useRouter } from "next/navigation";
import { useState } from "react";

const CHAINS: { value: SupportedChain; label: string }[] = [
    { value: "eth-mainnet", label: "Ethereum" },
    { value: "base-mainnet", label: "Base" },
    { value: "matic-mainnet", label: "Polygon" },
    { value: "arbitrum-mainnet", label: "Arbitrum" },
    { value: "optimism-mainnet", label: "Optimism" },
    { value: "bsc-mainnet", label: "BNB Chain" },
];

const PRESETS: { label: string; protocol: string; address: string; chain: SupportedChain; desc: string }[] = [
    {
        label: "Steakhouse USDC",
        protocol: "Morpho · ETH",
        address: "0xbeef01735c132ada46aa9aa4c54623caa92a64cb",
        chain: "eth-mainnet",
        desc: "MetaMorpho USDC vault by Steakhouse Finance — allocates to Morpho Blue markets",
    },
    {
        label: "Steakhouse USDT",
        protocol: "Morpho · ETH",
        address: "0xbEef047a543E45807105E51A8BBEFCc5950fcfBa",
        chain: "eth-mainnet",
        desc: "MetaMorpho USDT vault by Steakhouse Finance — rich Deposit/Withdraw tx history",
    },
    {
        label: "Gauntlet WETH Core",
        protocol: "Morpho · ETH",
        address: "0x4881Ef0BF6d2365D3dd6499ccd7532bcdBCE0658",
        chain: "eth-mainnet",
        desc: "MetaMorpho WETH vault by Gauntlet — supplies to LRT-collateralised Morpho Blue markets",
    },
    {
        label: "Gauntlet USDC Core",
        protocol: "Morpho · ETH",
        address: "0x8eB67A509616cd6A7c1B3c8C21D48FF57df3d458",
        chain: "eth-mainnet",
        desc: "MetaMorpho USDC vault by Gauntlet — risk-optimised allocation across Morpho Blue",
    },
    {
        label: "Moonwell Flagship USDC",
        protocol: "Morpho · Base",
        address: "0xc1256Ae5FF1cf2719D4937adb3bbCCab2E00A2Ca",
        chain: "base-mainnet",
        desc: "Base-native MetaMorpho USDC vault curated by Moonwell governance",
    },
    {
        label: "Re7 WETH",
        protocol: "Morpho · ETH",
        address: "0x78Fc2c2eD1A4cDb5402365934aE5648aDAd094d0",
        chain: "eth-mainnet",
        desc: "MetaMorpho WETH vault by Re7 Capital — focused on ETH-denominated yield strategies",
    },
];

export default function HomePage() {
    const router = useRouter();
    const [address, setAddress] = useState("");
    const [chain, setChain] = useState<SupportedChain>("eth-mainnet");

    function navigate(addr: string, ch: SupportedChain) {
        router.push(`/vault/${addr}?chain=${ch}`);
    }

    function handleExplore() {
        if (!address) return;
        navigate(address, chain);
    }

    return (
        <main className="flex min-h-screen items-center justify-center px-4 py-12" style={{ background: "var(--bg)" }}>
            <div
                className="w-full max-w-lg rounded-lg border p-8 flex flex-col gap-6"
                style={{ background: "var(--card)", borderColor: "var(--border)" }}
            >
                {/* Heading */}
                <div className="flex flex-col gap-2">
                    <h1
                        className="text-2xl font-bold tracking-tight"
                        style={{
                            color: "var(--accent)",
                            fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                        }}
                    >
                        GoldRush Vault Explorer
                    </h1>
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                        Paste any EVM vault address to decompose its underlying holdings.
                    </p>
                </div>

                {/* Address input */}
                <div className="flex flex-col gap-2">
                    <label
                        className="text-xs font-semibold uppercase tracking-wider"
                        style={{ color: "var(--text-secondary)" }}
                    >
                        Vault address
                    </label>
                    <AddressInput value={address} onChange={setAddress} placeholder="0x..." />
                </div>

                {/* Network select */}
                <div className="flex flex-col gap-2">
                    <label
                        className="text-xs font-semibold uppercase tracking-wider"
                        style={{ color: "var(--text-secondary)" }}
                    >
                        Network
                    </label>
                    <select
                        value={chain}
                        onChange={(e) => setChain(e.target.value as SupportedChain)}
                        className="w-full rounded border px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--accent)]"
                        style={{
                            background: "var(--card)",
                            color: "var(--text-primary)",
                            borderColor: "var(--border)",
                        }}
                    >
                        {CHAINS.map((c) => (
                            <option key={c.value} value={c.value}>
                                {c.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Explore button */}
                <button
                    onClick={handleExplore}
                    disabled={!address}
                    className="w-full rounded px-4 py-3 text-sm font-semibold transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                        background: "var(--accent)",
                        color: "#0f0f0f",
                    }}
                >
                    Explore →
                </button>

                {/* Discover Opportunities Link */}
                <div className="relative">
                    <div className="absolute inset-0 flex items-center" style={{ borderColor: "var(--border)" }}>
                        <div className="w-full border-t" style={{ borderColor: "var(--border)" }} />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase" style={{ background: "var(--card)" }}>
                        <span style={{ color: "var(--text-secondary)", paddingLeft: "8px", paddingRight: "8px" }}>Or</span>
                    </div>
                </div>

                <button
                    onClick={() => router.push("/")}
                    className="w-full rounded border px-4 py-3 text-sm font-semibold transition-colors"
                    style={{
                        background: "rgba(255,76,139,0.08)",
                        borderColor: "var(--accent)",
                        color: "var(--accent)",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,76,139,0.16)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,76,139,0.08)")}
                >
                    Browse Earn Vaults →
                </button>

                {/* Presets */}
                <div className="flex flex-col gap-3">
                    <span
                        className="text-xs font-semibold uppercase tracking-wider"
                        style={{ color: "var(--text-secondary)" }}
                    >
                        Featured vaults
                    </span>
                    <div className="flex flex-col gap-2">
                        {PRESETS.map((preset) => (
                            <button
                                key={preset.address}
                                onClick={() => navigate(preset.address, preset.chain)}
                                className="rounded border px-3 py-2.5 text-left transition-colors hover:border-[var(--accent)] group"
                                style={{
                                    background: "transparent",
                                    borderColor: "var(--border)",
                                }}
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <span
                                        className="text-sm font-medium group-hover:text-[var(--accent)] transition-colors"
                                        style={{ color: "var(--text-primary)" }}
                                    >
                                        {preset.label}
                                    </span>
                                    <span
                                        className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold"
                                        style={{ background: "var(--accent-dim)", color: "var(--accent)" }}
                                    >
                                        {preset.protocol}
                                    </span>
                                </div>
                                <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                                    {preset.desc}
                                </p>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}

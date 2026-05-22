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
        address: "0xbEef047a543E45807105E51A8BBEFCc5950fcfBa",
        chain: "eth-mainnet",
        desc: "MetaMorpho vault — allocates across Morpho Blue USDC markets",
    },
    {
        label: "Re7 WETH",
        protocol: "Morpho · ETH",
        address: "0x78Fc2c2eD1A4cDb5402365934aE5648aDAd094d",
        chain: "eth-mainnet",
        desc: "Curated WETH vault with nested lending positions",
    },
    {
        label: "Gauntlet USDC Prime",
        protocol: "Morpho · ETH",
        address: "0xdd0f28e19C1780eb6396170735D45153D261490d",
        chain: "eth-mainnet",
        desc: "Risk-managed USDC vault across multiple Morpho markets",
    },
    {
        label: "Moonwell Flagship USDC",
        protocol: "Morpho · Base",
        address: "0xc1256Ae5FF1cf2719D4937adb3bbCCab2E00A2Ca",
        chain: "base-mainnet",
        desc: "Base-native MetaMorpho vault curated by Moonwell",
    },
    {
        label: "Morpho Flagship USDC",
        protocol: "Morpho · Base",
        address: "0xd63070114470f685b75B74D60EEc7c1113d33a3d",
        chain: "base-mainnet",
        desc: "Flagship USDC MetaMorpho vault on Base",
    },
    {
        label: "Euler USDC",
        protocol: "Euler · ETH",
        address: "0x797DD80692c3b2dAdabCe8e30C07a7d6E32914aa",
        chain: "eth-mainnet",
        desc: "EVC-powered ERC-4626 USDC vault on Euler v2",
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
                                        style={{ background: "rgba(249,115,22,0.12)", color: "var(--accent)" }}
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

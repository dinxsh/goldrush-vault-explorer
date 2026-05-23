import { type SupportedChain } from "@/types/vault";

const RPC_URLS: Record<SupportedChain, string[]> = {
    "eth-mainnet": ["https://eth.drpc.org", "https://cloudflare-eth.com"],
    "base-mainnet": ["https://base.drpc.org", "https://mainnet.base.org"],
    "matic-mainnet": ["https://polygon.drpc.org", "https://polygon-rpc.com"],
    "arbitrum-mainnet": ["https://arbitrum.drpc.org", "https://arb1.arbitrum.io/rpc"],
    "optimism-mainnet": ["https://optimism.drpc.org", "https://mainnet.optimism.io"],
    "bsc-mainnet": ["https://bsc.drpc.org", "https://bsc-dataseed.binance.org"],
};

async function ethCall(chain: SupportedChain, to: string, data: string): Promise<string | null> {
    const urls = RPC_URLS[chain];
    for (const url of urls) {
        try {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 4000);
            const resp = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_call", params: [{ to, data }, "latest"] }),
                signal: controller.signal,
            });
            clearTimeout(timer);
            const json = (await resp.json()) as { result?: string; error?: unknown };
            if (json.error || !json.result || json.result === "0x") continue;
            return json.result;
        } catch {
            // try next RPC
        }
    }
    return null;
}

function decodeAddress(raw: string | null): string | null {
    if (!raw || raw.length < 66) return null;
    const addr = raw.slice(-40);
    return /^0+$/.test(addr) ? null : "0x" + addr;
}

function decodeUint256(raw: string | null): bigint | null {
    if (!raw || raw === "0x") return null;
    try {
        return BigInt(raw);
    } catch {
        return null;
    }
}

function decodeString(raw: string | null): string | null {
    if (!raw) return null;
    try {
        const h = raw.startsWith("0x") ? raw.slice(2) : raw;
        // Try ABI-encoded dynamic string (offset + length + data)
        if (h.length >= 128) {
            const offset = parseInt(h.slice(0, 64), 16) * 2;
            const len = parseInt(h.slice(offset, offset + 64), 16);
            if (len > 0 && len <= 500) {
                const str = Buffer.from(h.slice(offset + 64, offset + 64 + len * 2), "hex").toString("utf8");
                if (str.trim()) return str.trim();
            }
        }
        // Fallback: bytes32 static encoding (e.g., MKR, WBTC)
        const bytes = Buffer.from(h.padEnd(64, "0").slice(0, 64), "hex");
        const str = bytes.toString("utf8").replace(/\0/g, "").trim();
        return str || null;
    } catch {
        return null;
    }
}

export async function vaultAsset(chain: SupportedChain, address: string): Promise<string | null> {
    return decodeAddress(await ethCall(chain, address, "0x38d52e0f")); // asset()
}

export async function vaultTotalAssets(chain: SupportedChain, address: string): Promise<bigint | null> {
    return decodeUint256(await ethCall(chain, address, "0x01e1d114")); // totalAssets()
}

export async function tokenDecimals(chain: SupportedChain, address: string): Promise<number | null> {
    const n = decodeUint256(await ethCall(chain, address, "0x313ce567")); // decimals()
    return n !== null ? Number(n) : null;
}

export async function tokenSymbol(chain: SupportedChain, address: string): Promise<string | null> {
    return decodeString(await ethCall(chain, address, "0x95d89b41")); // symbol()
}

export async function tokenName(chain: SupportedChain, address: string): Promise<string | null> {
    return decodeString(await ethCall(chain, address, "0x06fdde03")); // name()
}

export async function vaultConvertToAssets(
    chain: SupportedChain,
    vault: string,
    shareDecimals: number
): Promise<bigint | null> {
    const oneShare = BigInt("1" + "0".repeat(shareDecimals));
    const hex = oneShare.toString(16).padStart(64, "0");
    return decodeUint256(await ethCall(chain, vault, "0x07a2d13a" + hex)); // convertToAssets(uint256)
}

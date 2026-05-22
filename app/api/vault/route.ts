import { recursiveDecompose } from "@/lib/vault";
import { type SupportedChain } from "@/types/vault";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const address = req.nextUrl.searchParams.get("address");
    const chain = (req.nextUrl.searchParams.get("chain") ?? "eth-mainnet") as SupportedChain;

    if (!address) {
        return NextResponse.json({ error: "address query param is required" }, { status: 400 });
    }

    try {
        const holdings = await recursiveDecompose(address, chain);
        return NextResponse.json({ holdings });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

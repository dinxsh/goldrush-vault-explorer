import { getAllOpportunities, filterOpportunities, sortOpportunities } from "@/lib/opportunities-data";
import { type NextRequest, NextResponse } from "next/server";

export const revalidate = 60; // Cache for 60 seconds

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const chain = searchParams.get("chain") || undefined;
  const protocol = searchParams.get("protocol") || undefined;
  const riskLevel = searchParams.get("riskLevel") || undefined;
  const search = searchParams.get("q") || undefined;
  const sortBy = (searchParams.get("sort") as "name" | "apy-desc" | "apy-asc" | "tvl-desc") || "name";

  try {
    let opportunities = getAllOpportunities();

    // Apply filters
    opportunities = filterOpportunities(opportunities, {
      chain,
      protocol,
      riskLevel,
      search,
    });

    // Apply sorting
    opportunities = sortOpportunities(opportunities, sortBy);

    return NextResponse.json({
      opportunities,
      count: opportunities.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

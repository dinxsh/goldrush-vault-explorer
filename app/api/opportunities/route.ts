import { getAllOpportunities, filterOpportunities, sortOpportunities, getStatistics } from "@/lib/complete-vault-database";
import { type NextRequest, NextResponse } from "next/server";

export const revalidate = 60; // Cache for 60 seconds

export async function GET(req: NextRequest) {
  try {
    // Handle /api/opportunities/stats endpoint
    if (req.nextUrl.pathname.includes("/stats")) {
      const stats = getStatistics();
      return NextResponse.json(
        {
          statistics: stats,
          timestamp: new Date().toISOString(),
        },
        { headers: { "cache-control": "public, max-age=60" } }
      );
    }

    const searchParams = req.nextUrl.searchParams;

    // Extract and validate filter parameters
    const chain = searchParams.get("chain") || undefined;
    const protocol = searchParams.get("protocol") || undefined;
    const riskLevel = searchParams.get("riskLevel") || undefined;
    const search = searchParams.get("q") || undefined;
    const minApy = searchParams.get("minApy") ? parseFloat(searchParams.get("minApy")!) : undefined;
    const maxApy = searchParams.get("maxApy") ? parseFloat(searchParams.get("maxApy")!) : undefined;
    const sortBy = (searchParams.get("sort") as "name" | "apy-desc" | "apy-asc" | "tvl-desc" | "tvl-asc") || "apy-desc";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));

    // Validate APY ranges
    if (minApy !== undefined && (isNaN(minApy) || minApy < 0 || minApy > 1)) {
      return NextResponse.json(
        {
          error: "Invalid minApy parameter — must be between 0 and 1",
          errorCode: "INVALID_MIN_APY",
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    if (maxApy !== undefined && (isNaN(maxApy) || maxApy < 0 || maxApy > 1)) {
      return NextResponse.json(
        {
          error: "Invalid maxApy parameter — must be between 0 and 1",
          errorCode: "INVALID_MAX_APY",
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    if (minApy !== undefined && maxApy !== undefined && minApy > maxApy) {
      return NextResponse.json(
        {
          error: "Invalid APY range — minApy cannot be greater than maxApy",
          errorCode: "INVALID_APY_RANGE",
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Get all opportunities
    let opportunities = getAllOpportunities();

    // Apply filters
    opportunities = filterOpportunities({
      chain,
      protocol,
      riskLevel,
      search,
      minApy,
      maxApy,
    });

    // Sort opportunities
    opportunities = sortOpportunities(opportunities, sortBy);

    // Paginate
    const total = opportunities.length;
    const startIdx = (page - 1) * limit;
    const endIdx = startIdx + limit;
    const paginatedOpportunities = opportunities.slice(startIdx, endIdx);

    if (paginatedOpportunities.length === 0 && page > 1) {
      return NextResponse.json(
        {
          error: `Page ${page} is out of bounds — only ${Math.ceil(total / limit)} pages available`,
          errorCode: "PAGE_OUT_OF_BOUNDS",
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        opportunities: paginatedOpportunities,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
          hasNextPage: page < Math.ceil(total / limit),
          hasPreviousPage: page > 1,
        },
        filters: {
          chain,
          protocol,
          riskLevel,
          search,
          minApy,
          maxApy,
          sort: sortBy,
        },
        metadata: {
          timestamp: new Date().toISOString(),
          vaultCount: total,
        },
      },
      { headers: { "cache-control": "public, max-age=60" } }
    );
  } catch (error) {
    console.error("Error in /api/opportunities:", error);

    const message = error instanceof Error ? error.message : "Unknown error";
    const stack = error instanceof Error ? error.stack : undefined;

    return NextResponse.json(
      {
        error: message,
        errorCode: "INTERNAL_SERVER_ERROR",
        stack: process.env.NODE_ENV === "development" ? stack : undefined,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

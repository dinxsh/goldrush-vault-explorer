import { type NextRequest, NextResponse } from "next/server";
import { getApyHistory, recordApyHistory } from "@/lib/portfolio-database";
import { getOpportunityBySlug } from "@/lib/complete-vault-database";

export const dynamic = "force-dynamic";

interface RecordApyRequest {
  slug: string;
  apy: number;
  tvl: number;
}

// GET /api/apy-history?slug=...&days=30 - Get APY history
export async function GET(req: NextRequest) {
  try {
    const slug = req.nextUrl.searchParams.get("slug");
    const daysStr = req.nextUrl.searchParams.get("days") || "30";

    if (!slug) {
      return NextResponse.json(
        { error: "slug parameter is required" },
        { status: 400 }
      );
    }

    const days = Math.min(Math.max(parseInt(daysStr, 10), 1), 365);

    // Verify vault exists
    const vault = getOpportunityBySlug(slug);
    if (!vault) {
      return NextResponse.json(
        { error: "Vault not found" },
        { status: 404 }
      );
    }

    const history = getApyHistory(slug, days);

    return NextResponse.json({
      slug,
      days,
      history,
      count: history.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch APY history" },
      { status: 500 }
    );
  }
}

// POST /api/apy-history - Record APY for vault
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RecordApyRequest;

    if (!body.slug || body.apy === undefined || body.tvl === undefined) {
      return NextResponse.json(
        { error: "slug, apy, and tvl are required" },
        { status: 400 }
      );
    }

    // Verify vault exists
    const vault = getOpportunityBySlug(body.slug);
    if (!vault) {
      return NextResponse.json(
        { error: "Vault not found" },
        { status: 404 }
      );
    }

    // Validate APY range
    if (body.apy < 0 || body.apy > 1) {
      return NextResponse.json(
        { error: "APY must be between 0 and 1 (0-100%)" },
        { status: 400 }
      );
    }

    recordApyHistory(body.slug, body.apy, body.tvl);

    return NextResponse.json({
      slug: body.slug,
      apy: body.apy,
      tvl: body.tvl,
      recorded: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to record APY history" },
      { status: 500 }
    );
  }
}

import { type NextRequest, NextResponse } from "next/server";
import {
  createPortfolio,
  getPortfolio,
  addPosition,
  removePosition,
  updatePosition,
  getApyHistory,
  getAllPortfolios,
  type Portfolio,
} from "@/lib/portfolio-database";

export const dynamic = "force-dynamic";

interface CreatePortfolioRequest {
  userId: string;
}

interface AddPositionRequest {
  slug: string;
  amountUSD: number;
  entryApyPercent: number;
  notes?: string;
}

interface UpdatePositionRequest {
  amountUSD?: number;
  entryApyPercent?: number;
  notes?: string;
}

// POST /api/portfolio - Create new portfolio
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreatePortfolioRequest;

    if (!body.userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const portfolio = createPortfolio(body.userId);
    return NextResponse.json(portfolio);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create portfolio" },
      { status: 500 }
    );
  }
}

// GET /api/portfolio?id=... - Get portfolio
export async function GET(req: NextRequest) {
  try {
    const portfolioId = req.nextUrl.searchParams.get("id");

    if (!portfolioId) {
      const portfolios = getAllPortfolios();
      return NextResponse.json({ portfolios });
    }

    const portfolio = getPortfolio(portfolioId);
    if (!portfolio) {
      return NextResponse.json(
        { error: "Portfolio not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(portfolio);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch portfolio" },
      { status: 500 }
    );
  }
}

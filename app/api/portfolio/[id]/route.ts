import { type NextRequest, NextResponse } from "next/server";
import {
  getPortfolio,
  addPosition,
  removePosition,
  updatePosition,
} from "@/lib/portfolio-database";

export const dynamic = "force-dynamic";

interface PositionRequest {
  slug: string;
  amountUSD: number;
  entryApyPercent: number;
  notes?: string;
}

interface UpdatePositionRequest {
  positionId: string;
  amountUSD?: number;
  entryApyPercent?: number;
  notes?: string;
}

interface RemovePositionRequest {
  positionId: string;
}

// POST /api/portfolio/[id] - Add position to portfolio
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await req.json()) as PositionRequest;

    if (!body.slug || !body.amountUSD || body.entryApyPercent === undefined) {
      return NextResponse.json(
        { error: "slug, amountUSD, and entryApyPercent are required" },
        { status: 400 }
      );
    }

    const portfolio = addPosition(id, {
      slug: body.slug,
      amountUSD: body.amountUSD,
      entryApyPercent: body.entryApyPercent,
      notes: body.notes,
    });

    if (!portfolio) {
      return NextResponse.json(
        { error: "Portfolio not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(portfolio);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to add position" },
      { status: 500 }
    );
  }
}

// PUT /api/portfolio/[id] - Update position in portfolio
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await req.json()) as UpdatePositionRequest;

    if (!body.positionId) {
      return NextResponse.json(
        { error: "positionId is required" },
        { status: 400 }
      );
    }

    const updates: Record<string, unknown> = {};
    if (body.amountUSD !== undefined) updates.amountUSD = body.amountUSD;
    if (body.entryApyPercent !== undefined)
      updates.entryApyPercent = body.entryApyPercent;
    if (body.notes !== undefined) updates.notes = body.notes;

    const portfolio = updatePosition(id, body.positionId, updates as any);

    if (!portfolio) {
      return NextResponse.json(
        { error: "Portfolio or position not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(portfolio);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update position" },
      { status: 500 }
    );
  }
}

// DELETE /api/portfolio/[id] - Remove position from portfolio
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await req.json()) as RemovePositionRequest;

    if (!body.positionId) {
      return NextResponse.json(
        { error: "positionId is required" },
        { status: 400 }
      );
    }

    const portfolio = removePosition(id, body.positionId);

    if (!portfolio) {
      return NextResponse.json(
        { error: "Portfolio or position not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(portfolio);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to remove position" },
      { status: 500 }
    );
  }
}

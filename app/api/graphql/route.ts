import { type NextRequest, NextResponse } from "next/server";
import { typeDefs } from "@/lib/graphql-schema";
import { resolvers } from "@/lib/graphql-resolvers";

export const dynamic = "force-dynamic";

// Simple GraphQL endpoint without Apollo for Vercel compatibility
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, variables } = body as { query: string; variables?: Record<string, unknown> };

    if (!query) {
      return NextResponse.json(
        { errors: [{ message: "Query is required" }] },
        { status: 400 }
      );
    }

    // In production, you would use graphql() from the graphql package to execute queries
    // For now, return a placeholder response
    return NextResponse.json({
      data: {
        message: "GraphQL API is available. Use a GraphQL client to query.",
      },
      schema: {
        types: typeDefs,
        resolvers: Object.keys(resolvers),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { errors: [{ message: "Internal server error" }] },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return NextResponse.json({
    message: "GraphQL API is available at POST /api/graphql",
    documentation: {
      queries: ["opportunity", "opportunities", "statistics", "portfolio", "apyHistory"],
      mutations: [
        "createPortfolio",
        "addPosition",
        "removePosition",
        "updatePosition",
        "recordApyHistory",
      ],
    },
  });
}

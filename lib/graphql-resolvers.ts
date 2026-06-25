import {
  getAllOpportunities,
  getOpportunityBySlug,
  getStatistics,
  filterOpportunities,
  sortOpportunities,
} from "@/lib/complete-vault-database";
import {
  createPortfolio,
  getPortfolio,
  addPosition,
  removePosition,
  updatePosition,
  getApyHistory,
  recordApyHistory,
} from "@/lib/portfolio-database";

export const resolvers = {
  Query: {
    opportunity: (_: any, args: { slug: string }) => {
      return getOpportunityBySlug(args.slug);
    },

    opportunities: (
      _: any,
      args: {
        page?: number;
        limit?: number;
        chain?: string;
        protocol?: string;
        riskLevel?: string;
        search?: string;
        minApy?: number;
        maxApy?: number;
        sort?: string;
      }
    ) => {
      const page = args.page || 1;
      const limit = args.limit || 20;

      const filtered = filterOpportunities({
        chain: args.chain,
        protocol: args.protocol,
        riskLevel: args.riskLevel,
        search: args.search,
        minApy: args.minApy,
        maxApy: args.maxApy,
      });

      const sorted = sortOpportunities(
        filtered,
        (args.sort as any) || "apy-desc"
      );

      const total = sorted.length;
      const pages = Math.ceil(total / limit);
      const start = (page - 1) * limit;
      const opportunities = sorted.slice(start, start + limit);

      return {
        opportunities,
        pagination: {
          total,
          page,
          limit,
          pages,
          hasNextPage: page < pages,
          hasPreviousPage: page > 1,
        },
        filters: {
          chain: args.chain,
          protocol: args.protocol,
          riskLevel: args.riskLevel,
          search: args.search,
          minApy: args.minApy,
          maxApy: args.maxApy,
          sort: args.sort,
        },
      };
    },

    statistics: () => {
      return getStatistics();
    },

    portfolio: (_: any, args: { id: string }) => {
      return getPortfolio(args.id);
    },

    apyHistory: (_: any, args: { slug: string; days?: number }) => {
      const days = args.days || 30;
      const history = getApyHistory(args.slug, days);
      return {
        slug: args.slug,
        days,
        history,
        count: history.length,
      };
    },
  },

  Mutation: {
    createPortfolio: (_: any, args: { userId: string }) => {
      return createPortfolio(args.userId);
    },

    addPosition: (
      _: any,
      args: {
        portfolioId: string;
        slug: string;
        amountUSD: number;
        entryApyPercent: number;
        notes?: string;
      }
    ) => {
      const portfolio = addPosition(args.portfolioId, {
        slug: args.slug,
        amountUSD: args.amountUSD,
        entryApyPercent: args.entryApyPercent,
        notes: args.notes,
      });

      if (!portfolio) {
        throw new Error("Portfolio not found");
      }

      return portfolio;
    },

    removePosition: (
      _: any,
      args: {
        portfolioId: string;
        positionId: string;
      }
    ) => {
      const portfolio = removePosition(args.portfolioId, args.positionId);

      if (!portfolio) {
        throw new Error("Portfolio or position not found");
      }

      return portfolio;
    },

    updatePosition: (
      _: any,
      args: {
        portfolioId: string;
        positionId: string;
        amountUSD?: number;
        entryApyPercent?: number;
        notes?: string;
      }
    ) => {
      const updates: Record<string, unknown> = {};
      if (args.amountUSD !== undefined) updates.amountUSD = args.amountUSD;
      if (args.entryApyPercent !== undefined)
        updates.entryApyPercent = args.entryApyPercent;
      if (args.notes !== undefined) updates.notes = args.notes;

      const portfolio = updatePosition(args.portfolioId, args.positionId, updates as any);

      if (!portfolio) {
        throw new Error("Portfolio or position not found");
      }

      return portfolio;
    },

    recordApyHistory: (_: any, args: { slug: string; apy: number; tvl: number }) => {
      recordApyHistory(args.slug, args.apy, args.tvl);
      const date = new Date().toISOString().split("T")[0];
      return {
        slug: args.slug,
        date,
        apy: args.apy,
        tvl: args.tvl,
      };
    },
  },
};

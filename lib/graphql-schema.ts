import { gql } from "graphql-tag";

export const typeDefs = gql`
  type Opportunity {
    slug: String!
    name: String!
    description: String!
    chain: String!
    protocol: String!
    asset: String!
    apy: Float
    tvl: Float!
    riskLevel: String!
    riskFactors: [String!]!
    highlights: [String!]!
    vaultAddress: String!
  }

  type Statistics {
    totalVaults: Int!
    totalTvl: Float!
    avgApy: Float!
    maxApy: Float!
    chains: Int!
    protocols: Int!
  }

  type Portfolio {
    id: String!
    userId: String!
    createdAt: Int!
    updatedAt: Int!
    positions: [PortfolioPosition!]!
    totalValue: Float!
    totalApy: Float!
  }

  type PortfolioPosition {
    id: String!
    slug: String!
    amountUSD: Float!
    shares: Float
    entryApyPercent: Float!
    addedAt: Int!
    notes: String
  }

  type ApyHistoryEntry {
    slug: String!
    date: String!
    apy: Float!
    tvl: Float!
  }

  type ApyHistory {
    slug: String!
    days: Int!
    history: [ApyHistoryEntry!]!
    count: Int!
  }

  type PageInfo {
    total: Int!
    page: Int!
    limit: Int!
    pages: Int!
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
  }

  type OpportunitiesConnection {
    opportunities: [Opportunity!]!
    pagination: PageInfo!
    filters: FilterInput!
  }

  input FilterInput {
    chain: String
    protocol: String
    riskLevel: String
    search: String
    minApy: Float
    maxApy: Float
    sort: String
  }

  type Query {
    opportunity(slug: String!): Opportunity
    opportunities(
      page: Int
      limit: Int
      chain: String
      protocol: String
      riskLevel: String
      search: String
      minApy: Float
      maxApy: Float
      sort: String
    ): OpportunitiesConnection!
    statistics: Statistics!
    portfolio(id: String!): Portfolio
    apyHistory(slug: String!, days: Int): ApyHistory!
  }

  type Mutation {
    createPortfolio(userId: String!): Portfolio!
    addPosition(
      portfolioId: String!
      slug: String!
      amountUSD: Float!
      entryApyPercent: Float!
      notes: String
    ): Portfolio!
    removePosition(portfolioId: String!, positionId: String!): Portfolio!
    updatePosition(
      portfolioId: String!
      positionId: String!
      amountUSD: Float
      entryApyPercent: Float
      notes: String
    ): Portfolio!
    recordApyHistory(slug: String!, apy: Float!, tvl: Float!): ApyHistoryEntry!
  }
`;

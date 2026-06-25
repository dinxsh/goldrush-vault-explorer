// Portfolio tracking database - stores user portfolio allocations
// In production, this would be backed by a real database with user authentication

export interface Portfolio {
  id: string;
  userId: string;
  createdAt: number;
  updatedAt: number;
  positions: PortfolioPosition[];
  totalValue: number;
  totalApy: number;
}

export interface PortfolioPosition {
  id: string;
  slug: string;
  amountUSD: number;
  shares?: number;
  entryApyPercent: number;
  addedAt: number;
  notes?: string;
}

export interface ApyHistory {
  slug: string;
  date: string; // YYYY-MM-DD
  apy: number;
  tvl: number;
}

// In-memory storage for demo (would be database in production)
const portfolios = new Map<string, Portfolio>();
const apyHistory = new Map<string, ApyHistory[]>();

export function createPortfolio(userId: string): Portfolio {
  const id = `portfolio_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const portfolio: Portfolio = {
    id,
    userId,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    positions: [],
    totalValue: 0,
    totalApy: 0,
  };
  portfolios.set(id, portfolio);
  return portfolio;
}

export function getPortfolio(portfolioId: string): Portfolio | null {
  return portfolios.get(portfolioId) || null;
}

export function addPosition(
  portfolioId: string,
  position: Omit<PortfolioPosition, "id" | "addedAt">
): Portfolio | null {
  const portfolio = portfolios.get(portfolioId);
  if (!portfolio) return null;

  const newPosition: PortfolioPosition = {
    ...position,
    id: `pos_${Date.now()}`,
    addedAt: Date.now(),
  };

  portfolio.positions.push(newPosition);
  portfolio.totalValue += position.amountUSD;
  portfolio.totalApy = calculatePortfolioApy(portfolio.positions);
  portfolio.updatedAt = Date.now();

  return portfolio;
}

export function removePosition(
  portfolioId: string,
  positionId: string
): Portfolio | null {
  const portfolio = portfolios.get(portfolioId);
  if (!portfolio) return null;

  const position = portfolio.positions.find((p) => p.id === positionId);
  if (!position) return null;

  portfolio.positions = portfolio.positions.filter((p) => p.id !== positionId);
  portfolio.totalValue -= position.amountUSD;
  portfolio.totalApy = calculatePortfolioApy(portfolio.positions);
  portfolio.updatedAt = Date.now();

  return portfolio;
}

export function updatePosition(
  portfolioId: string,
  positionId: string,
  updates: Partial<PortfolioPosition>
): Portfolio | null {
  const portfolio = portfolios.get(portfolioId);
  if (!portfolio) return null;

  const position = portfolio.positions.find((p) => p.id === positionId);
  if (!position) return null;

  const oldValue = position.amountUSD;
  Object.assign(position, updates);
  portfolio.totalValue = portfolio.totalValue - oldValue + position.amountUSD;
  portfolio.totalApy = calculatePortfolioApy(portfolio.positions);
  portfolio.updatedAt = Date.now();

  return portfolio;
}

export function recordApyHistory(
  slug: string,
  apy: number,
  tvl: number
): void {
  const date = new Date().toISOString().split("T")[0];
  if (!apyHistory.has(slug)) {
    apyHistory.set(slug, []);
  }

  const history = apyHistory.get(slug)!;
  const existing = history.find((h) => h.date === date);

  if (existing) {
    existing.apy = apy;
    existing.tvl = tvl;
  } else {
    history.push({ slug, date, apy, tvl });
  }
}

export function getApyHistory(slug: string, days: number = 30): ApyHistory[] {
  const history = apyHistory.get(slug) || [];
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

  return history
    .filter((h) => new Date(h.date).getTime() >= cutoff)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

function calculatePortfolioApy(positions: PortfolioPosition[]): number {
  if (positions.length === 0) return 0;

  const totalValue = positions.reduce((sum, p) => sum + p.amountUSD, 0);
  if (totalValue === 0) return 0;

  const weightedApy = positions.reduce(
    (sum, p) => sum + (p.entryApyPercent / 100) * (p.amountUSD / totalValue),
    0
  );

  return weightedApy;
}

export function getAllPortfolios(): Portfolio[] {
  return Array.from(portfolios.values());
}

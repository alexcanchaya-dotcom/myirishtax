/**
 * Investment Capital Gains Tax Calculator for Ireland
 *
 * Handles:
 * - Cryptocurrency capital gains
 * - Stock/ETF capital gains
 * - Share pooling and cost basis calculation
 * - FIFO method (Irish Revenue standard)
 * - Annual CGT exemption (€1,270)
 * - Loss carry-forward
 * - Tax year calculation
 */

export interface Investment {
  id: string;
  symbol: string; // BTC, ETH, AAPL, etc.
  type: 'crypto' | 'stock' | 'etf';
  quantity: number;
  acquisitionDate: string;
  acquisitionPrice: number; // Per unit in EUR
  acquisitionCost: number; // Total cost including fees
  disposalDate?: string;
  disposalPrice?: number; // Per unit in EUR
  disposalProceeds?: number; // Total proceeds minus fees
}

export interface CGTCalculation {
  // Acquisitions
  totalAcquisitions: Investment[];
  totalAcquisitionCost: number;

  // Disposals
  totalDisposals: Investment[];
  totalDisposalProceeds: number;

  // Gains/Losses
  capitalGain: number;
  capitalLoss: number;
  netGain: number;

  // Tax calculation
  annualExemption: number; // €1,270
  taxableGain: number;
  cgtRate: number; // 33%
  cgtDue: number;

  // Loss carry-forward
  lossCarriedForward: number;
  previousLosses: number;
}

export interface PortfolioHolding {
  symbol: string;
  type: 'crypto' | 'stock' | 'etf';
  quantity: number;
  averageCostBasis: number;
  totalCostBasis: number;
  currentPrice?: number;
  currentValue?: number;
  unrealizedGain?: number;
  unrealizedGainPercent?: number;
}

export interface TaxYearReport {
  taxYear: number;
  totalRealizedGains: number;
  totalRealizedLosses: number;
  netGain: number;
  exemptionUsed: number;
  taxableGain: number;
  cgtDue: number;
  lossCarriedForward: number;
  transactions: Investment[];
}

const CGT_RATE = 0.33; // 33% for Ireland
const ANNUAL_EXEMPTION = 1270; // €1,270 annual exemption

/**
 * Calculate cost basis using FIFO (First In, First Out)
 * This is the method required by Irish Revenue
 */
export function calculateCostBasisFIFO(
  acquisitions: Investment[],
  disposalQuantity: number
): { costBasis: number; remainingHoldings: Investment[] } {
  const sortedAcquisitions = [...acquisitions].sort(
    (a, b) => new Date(a.acquisitionDate).getTime() - new Date(b.acquisitionDate).getTime()
  );

  let remainingToSell = disposalQuantity;
  let totalCostBasis = 0;
  const remainingHoldings: Investment[] = [];

  for (const acquisition of sortedAcquisitions) {
    if (remainingToSell <= 0) {
      remainingHoldings.push(acquisition);
      continue;
    }

    if (acquisition.quantity <= remainingToSell) {
      // Use entire acquisition
      totalCostBasis += acquisition.acquisitionCost;
      remainingToSell -= acquisition.quantity;
    } else {
      // Use partial acquisition
      const percentageUsed = remainingToSell / acquisition.quantity;
      totalCostBasis += acquisition.acquisitionCost * percentageUsed;

      // Keep remainder
      remainingHoldings.push({
        ...acquisition,
        quantity: acquisition.quantity - remainingToSell,
        acquisitionCost: acquisition.acquisitionCost * (1 - percentageUsed),
      });

      remainingToSell = 0;
    }
  }

  return { costBasis: totalCostBasis, remainingHoldings };
}

/**
 * Calculate CGT for a tax year
 */
export function calculateCGT(
  investments: Investment[],
  taxYear: number,
  previousLosses: number = 0
): CGTCalculation {
  // Filter disposals for the tax year
  const disposals = investments.filter((inv) => {
    if (!inv.disposalDate) return false;
    const year = new Date(inv.disposalDate).getFullYear();
    return year === taxYear;
  });

  // Calculate total proceeds from disposals
  const totalDisposalProceeds = disposals.reduce(
    (sum, inv) => sum + (inv.disposalProceeds || 0),
    0
  );

  // Calculate gains and losses
  let totalGains = 0;
  let totalLosses = 0;

  for (const disposal of disposals) {
    const gain = (disposal.disposalProceeds || 0) - disposal.acquisitionCost;
    if (gain > 0) {
      totalGains += gain;
    } else {
      totalLosses += Math.abs(gain);
    }
  }

  // Net gain/loss
  const netGain = totalGains - totalLosses;

  // Apply previous year losses
  const netAfterLosses = Math.max(0, netGain - previousLosses);

  // Apply annual exemption
  const taxableGain = Math.max(0, netAfterLosses - ANNUAL_EXEMPTION);
  const exemptionUsed = Math.min(ANNUAL_EXEMPTION, netAfterLosses);

  // Calculate CGT due
  const cgtDue = taxableGain * CGT_RATE;

  // Calculate loss carry-forward
  const lossCarriedForward = netGain < 0 ? Math.abs(netGain) : 0;

  // Get all acquisitions
  const acquisitions = investments.filter((inv) => !inv.disposalDate);
  const totalAcquisitionCost = acquisitions.reduce(
    (sum, inv) => sum + inv.acquisitionCost,
    0
  );

  return {
    totalAcquisitions: acquisitions,
    totalAcquisitionCost,
    totalDisposals: disposals,
    totalDisposalProceeds,
    capitalGain: totalGains,
    capitalLoss: totalLosses,
    netGain,
    annualExemption: ANNUAL_EXEMPTION,
    taxableGain,
    cgtRate: CGT_RATE,
    cgtDue,
    lossCarriedForward,
    previousLosses,
  };
}

/**
 * Calculate portfolio holdings with unrealized gains
 */
export function calculatePortfolioHoldings(
  investments: Investment[],
  currentPrices: Map<string, number>
): PortfolioHolding[] {
  // Group by symbol
  const holdings = new Map<string, PortfolioHolding>();

  for (const inv of investments) {
    if (inv.disposalDate) continue; // Skip sold investments

    const existing = holdings.get(inv.symbol);
    if (existing) {
      existing.quantity += inv.quantity;
      existing.totalCostBasis += inv.acquisitionCost;
      existing.averageCostBasis = existing.totalCostBasis / existing.quantity;
    } else {
      holdings.set(inv.symbol, {
        symbol: inv.symbol,
        type: inv.type,
        quantity: inv.quantity,
        totalCostBasis: inv.acquisitionCost,
        averageCostBasis: inv.acquisitionCost / inv.quantity,
      });
    }
  }

  // Add current prices and unrealized gains
  for (const [symbol, holding] of holdings) {
    const currentPrice = currentPrices.get(symbol);
    if (currentPrice) {
      holding.currentPrice = currentPrice;
      holding.currentValue = holding.quantity * currentPrice;
      holding.unrealizedGain = holding.currentValue - holding.totalCostBasis;
      holding.unrealizedGainPercent =
        (holding.unrealizedGain / holding.totalCostBasis) * 100;
    }
  }

  return Array.from(holdings.values());
}

/**
 * Generate tax year report
 */
export function generateTaxYearReport(
  investments: Investment[],
  taxYear: number,
  previousLosses: number = 0
): TaxYearReport {
  const cgt = calculateCGT(investments, taxYear, previousLosses);

  return {
    taxYear,
    totalRealizedGains: cgt.capitalGain,
    totalRealizedLosses: cgt.capitalLoss,
    netGain: cgt.netGain,
    exemptionUsed: cgt.annualExemption,
    taxableGain: cgt.taxableGain,
    cgtDue: cgt.cgtDue,
    lossCarriedForward: cgt.lossCarriedForward,
    transactions: cgt.totalDisposals,
  };
}

/**
 * Check if 30-day wash sale rule applies (for crypto)
 * Irish Revenue may apply wash sale rules to prevent tax loss harvesting
 */
export function checkWashSale(
  disposal: Investment,
  reacquisitions: Investment[],
  days: number = 30
): boolean {
  if (!disposal.disposalDate) return false;

  const disposalDate = new Date(disposal.disposalDate);
  const washSalePeriod = days * 24 * 60 * 60 * 1000; // Convert days to milliseconds

  for (const reacq of reacquisitions) {
    if (reacq.symbol !== disposal.symbol) continue;

    const reacqDate = new Date(reacq.acquisitionDate);
    const timeDiff = Math.abs(reacqDate.getTime() - disposalDate.getTime());

    if (timeDiff <= washSalePeriod) {
      return true; // Wash sale detected
    }
  }

  return false;
}

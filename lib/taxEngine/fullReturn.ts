import { NormalisedTransaction } from '../normalisers/types';
import { calculateNetIncome, CalculationInput, TaxBreakdown } from './index';

export interface FullTaxComputation {
  paye: TaxBreakdown;
  uscTotal: number;
  prsiTotal: number;
  dividendTax: number;
  interestTax: number;
  cgt: number;
  foreignCredit: number;
  lossCarryForward: number;
  finalLiability: number;
}

export function computeFullTaxReturn(
  incomeInput: CalculationInput,
  transactions: NormalisedTransaction[],
  options?: { lossCarryForward?: number; foreignCredit?: number }
): FullTaxComputation {
  const base = calculateNetIncome(incomeInput);
  const dividends = transactions.filter((t) => t.type === 'dividend');
  const interests = transactions.filter((t) => t.type === 'interest');
  const gains = transactions.filter((t) => t.type === 'stock_trade' || t.type === 'crypto_trade' || t.type === 'etf_trade');

  const dividendTax = dividends.reduce((sum, d) => sum + (d.amount ?? 0) * 0.335, 0);
  const interestTax = interests.reduce((sum, i) => sum + (i.amount ?? 0) * 0.2, 0);
  const cgtGross = gains.reduce((sum, g) => sum + Math.max(0, (g.amount ?? 0) - (g.costBasis ?? 0)), 0);
  const annualExemption = 1270;
  const lossCarryForward = options?.lossCarryForward ?? 0;
  const cgt = Math.max(0, (cgtGross - annualExemption - lossCarryForward) * 0.33);

  const foreignCredit = options?.foreignCredit ?? 0;
  const finalLiability = base.totalTax + dividendTax + interestTax + cgt - foreignCredit;

  return {
    paye: base,
    uscTotal: base.usc.reduce((sum, b) => sum + b.amount, 0),
    prsiTotal: base.prsi,
    dividendTax,
    interestTax,
    cgt,
    foreignCredit,
    lossCarryForward,
    finalLiability,
  };
}

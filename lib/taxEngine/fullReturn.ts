import { NormalisedTransaction } from '../normalisers/types';
import { calculateNetIncome, CalculationInput, TaxBreakdown } from './index';
import {
  CGT_NO_DATE_NOTE,
  cgtRateForDisposal,
  irishDisposalDay,
  splitTaxableGainByRate,
  type CGTRatePart,
} from './cgtRate';

export interface FullTaxComputation {
  paye: TaxBreakdown;
  uscTotal: number;
  prsiTotal: number;
  dividendTax: number;
  interestTax: number;
  cgt: number;
  /** Taxable gain and CGT at each rate: 33% before 7 Oct 2026, 31% on or after. */
  cgtByRate: CGTRatePart[];
  /** Set when a gain had no usable date, so 31% was assumed. */
  cgtNote?: string;
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
  const gainsByRate = new Map<number, number>();
  let undatedGain = false;
  for (const g of gains) {
    const gain = Math.max(0, (g.amount ?? 0) - (g.costBasis ?? 0));
    if (gain <= 0) continue;
    if (irishDisposalDay(g.date) === null) undatedGain = true;
    const rate = cgtRateForDisposal(g.date); // 33% before 7 Oct 2026, 31% on or after (31% if no date)
    gainsByRate.set(rate, (gainsByRate.get(rate) ?? 0) + gain);
  }
  const cgtGross = [...gainsByRate.values()].reduce((sum, v) => sum + v, 0);
  const annualExemption = 1270;
  const lossCarryForward = options?.lossCarryForward ?? 0;
  const taxableGain = Math.max(0, cgtGross - annualExemption - lossCarryForward);
  const { cgtDue: cgt, parts: cgtByRate } = splitTaxableGainByRate(gainsByRate, taxableGain);

  const foreignCredit = options?.foreignCredit ?? 0;
  const finalLiability = base.totalTax + dividendTax + interestTax + cgt - foreignCredit;

  return {
    paye: base,
    uscTotal: base.usc.reduce((sum, b) => sum + b.amount, 0),
    prsiTotal: base.prsi,
    dividendTax,
    interestTax,
    cgt,
    cgtByRate,
    ...(undatedGain ? { cgtNote: CGT_NO_DATE_NOTE } : {}),
    foreignCredit,
    lossCarryForward,
    finalLiability,
  };
}

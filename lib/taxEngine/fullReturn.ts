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
  /** Items this endpoint does not tax (left out of finalLiability), with the reason. */
  unsupported?: UnsupportedItem[];
}

export type UnsupportedItem = { type: 'dividend' | 'etf_trade'; count: number; message: string };

/** DIRT on deposit interest: 33% (Revenue "What DIRT rate is applicable?"; unchanged 2020–2026). */
export const DIRT_RATE = 0.33;
export const DIVIDEND_NOT_SUPPORTED =
  'Dividends are not supported here: they are taxed at your marginal income tax rate plus USC and PRSI, with credit for any 25% DWT. Left out of the total.';
export const ETF_NOT_SUPPORTED =
  'ETF disposals are not supported here: most EU ETFs pay exit tax (not CGT), including the 8-year deemed disposal. Left out of the total.';

export function computeFullTaxReturn(
  incomeInput: CalculationInput,
  transactions: NormalisedTransaction[],
  options?: { lossCarryForward?: number; foreignCredit?: number }
): FullTaxComputation {
  const base = calculateNetIncome(incomeInput);
  const dividends = transactions.filter((t) => t.type === 'dividend');
  const interests = transactions.filter((t) => t.type === 'interest');
  const etfs = transactions.filter((t) => t.type === 'etf_trade');
  // ETFs are left out: most EU-domiciled ETFs are under the exit tax regime, not CGT.
  const gains = transactions.filter((t) => t.type === 'stock_trade' || t.type === 'crypto_trade');

  // Dividends are not taxed here (marginal income tax + USC + PRSI, less DWT, needs the full income picture).
  const dividendTax = 0;
  // Deposit interest: DIRT at 33%.
  const interestTax = interests.reduce((sum, i) => sum + (i.amount ?? 0) * DIRT_RATE, 0);
  const unsupported: UnsupportedItem[] = [];
  if (dividends.length > 0) unsupported.push({ type: 'dividend', count: dividends.length, message: DIVIDEND_NOT_SUPPORTED });
  if (etfs.length > 0) unsupported.push({ type: 'etf_trade', count: etfs.length, message: ETF_NOT_SUPPORTED });
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
    ...(unsupported.length > 0 ? { unsupported } : {}),
  };
}

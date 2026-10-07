import type { ContractorBreakdown } from './taxEngine/contractorCalculator';
import { roundToTotal } from './summaryRows';

/** Whole-euro rows for the contractor result card, same order as the take-home card, always adding up. */
export type ContractorRows = {
  gross: number;
  expenses: number;
  profit: number;
  incomeTaxBeforeCredits: number;
  creditsUsed: number;
  incomeTax: number;
  usc: number;
  prsi: number;
  totalDeductions: number;
  pension: number;
  takeHome: number;
};

// gross = expenses + income tax + USC + PRSI + pension contribution + take-home.
export function buildContractorRows(r: ContractorBreakdown): ContractorRows {
  const pensionExact = r.pension?.contribution ?? 0;
  const gross = Math.round(r.grossIncome);
  const [expenses, incomeTax, usc, prsi, pension, takeHome] = roundToTotal(
    [r.totalExpenses, r.incomeTax.afterCredits, r.usc.total, r.prsi.amount, pensionExact, r.netIncome],
    gross,
  );
  const incomeTaxBeforeCredits = Math.round(r.incomeTax.total);
  return {
    gross,
    expenses,
    profit: gross - expenses,
    incomeTaxBeforeCredits,
    creditsUsed: incomeTaxBeforeCredits - incomeTax,
    incomeTax,
    usc,
    prsi,
    totalDeductions: incomeTax + usc + prsi,
    pension,
    takeHome,
  };
}

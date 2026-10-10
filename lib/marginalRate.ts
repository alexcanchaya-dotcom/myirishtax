import { calculateNetIncome } from './taxEngine';

/** Single PAYE earner, 2026 rates: what an extra €1,000 a year adds to take-home pay, from the tax engine. */
export const MARGINAL_YEAR = 2026;
export const MARGINAL_HEADLINE_INCOME = 80000;
export const MARGINAL_TABLE_INCOMES = [30000, 50000, 80000, 120000];

export type MarginalRow = {
  income: number;
  incomeTax: number;
  usc: number;
  prsi: number;
  kept: number;
  rate: number;
};

// Round to 3 dp first so float noise (42.374999…) doesn't flip the cent.
const r2 = (n: number) => Math.round(Math.round(n * 1000) / 10) / 100;

export function marginalOnRaise(income: number, raise = 1000): MarginalRow {
  const run = (pay: number) =>
    calculateNetIncome({
      income: pay,
      period: 'annual',
      maritalStatus: 'single',
      taxYear: MARGINAL_YEAR
    });
  const a = run(income);
  const b = run(income + raise);
  const incomeTax = r2(b.payeAfterCredits - a.payeAfterCredits);
  const usc = r2(b.uscTotal - a.uscTotal);
  const prsi = r2(b.prsi - a.prsi);
  const kept = r2(raise - incomeTax - usc - prsi);
  return {
    income,
    incomeTax,
    usc,
    prsi,
    kept,
    rate: (incomeTax + usc + prsi) / raise
  };
}

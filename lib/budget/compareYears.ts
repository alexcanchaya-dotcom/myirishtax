import { calculateNetIncome } from '../taxEngine';
import { BUDGET_2027 } from '../config/taxYear2027';

/** Rent Tax Credit maximum by year (Revenue tax relief charts; 2027 from Budget 2027 TPC p.6 and Finance (No. 2) Bill 2026 s.4). */
export const RENT_CREDIT: Record<number, { single: number; couple: number } | undefined> = {
  2025: { single: 1000, couple: 2000 },
  2026: { single: 1000, couple: 2000 },
  ...(BUDGET_2027.credits.rentSingle !== null && BUDGET_2027.credits.rentCouple !== null
    ? { 2027: { single: BUDGET_2027.credits.rentSingle, couple: BUDGET_2027.credits.rentCouple } }
    : {}),
};

export type Household = 'single' | 'singleParent' | 'married';

export type CompareInput = {
  income: number;
  /** Defaults to 'single'. 'married' = married or civil partners taxed jointly. */
  household?: Household;
  /** Married or civil partners only: the other person's pay (0 = one income). */
  spouseIncome?: number;
  /** Claim the full Rent Tax Credit in both years (rent of at least 5 × the credit). */
  rent?: boolean;
};

export type YearLines = { incomeTax: number; usc: number; prsi: number; rentCredit: number; takeHome: number };
export type YearCompare = {
  from: number;
  to: number;
  before: YearLines;
  after: YearLines;
  diff: { year: number; month: number; week: number };
};

function lines(input: CompareInput, year: number, rentTable: typeof RENT_CREDIT): YearLines {
  const household = input.household ?? 'single';
  const married = household === 'married';
  const rentRow = rentTable[year];
  const rentCredit = input.rent && rentRow ? (married ? rentRow.couple : rentRow.single) : 0;
  const spouse = married ? Math.max(0, input.spouseIncome ?? 0) : 0;
  const r = calculateNetIncome({
    income: input.income,
    period: 'annual',
    maritalStatus: married ? 'married' : 'single',
    ...(household === 'singleParent' ? { singleParent: true } : {}),
    ...(spouse > 0 ? { spouseIncome: spouse } : {}),
    additionalCredits: rentCredit,
    taxYear: year,
  });
  return { incomeTax: r.payeAfterCredits, usc: r.uscTotal, prsi: r.prsi, rentCredit, takeHome: r.netAnnual };
}

/**
 * 2026 vs 2027 (or any two years) from calculateNetIncome, the same engine as the take-home calculator.
 * Headline is the weekly difference; month and year are shown next to it. For a couple, figures are for the household.
 */
export function compareYears(
  input: CompareInput,
  from = 2026,
  to = 2027,
  rentTable: typeof RENT_CREDIT = RENT_CREDIT,
): YearCompare {
  const before = lines(input, from, rentTable);
  const after = lines(input, to, rentTable);
  const year = after.takeHome - before.takeHome;
  return { from, to, before, after, diff: { year, month: year / 12, week: year / 52 } };
}

export function headlineWeekly(diffWeek: number): string {
  const n = Math.round(Math.abs(diffWeek) * 100) / 100;
  if (n < 0.5) return 'about the same each week';
  const amount = `€${n.toLocaleString('en-IE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return diffWeek > 0 ? `${amount} a week better off` : `${amount} a week worse off`;
}

import { compareScenarios } from '../taxEngine';

export const BUDGET_TABLE_INCOMES = [30000, 45000, 60000, 80000, 100000];

export type BudgetTableRow = {
  income: number;
  takeHomeBefore: number;
  takeHomeAfter: number;
  diffYear: number;
  diffMonth: number;
  diffWeek: number;
  /** Two-earner couples only: the second income. */
  spouseIncome?: number;
};

export type BudgetTable = { single: BudgetTableRow[]; couple: BudgetTableRow[]; coupleTwoEarners: BudgetTableRow[] };

/** Married / civil partners, both earning (household take-home). */
export const BUDGET_TABLE_TWO_EARNERS: [number, number][] = [
  [30000, 30000],
  [50000, 40000],
  [70000, 15000],
  [60000, 60000],
];

/**
 * Every cell comes from compareScenarios() → calculateNetIncome(), the same function the take-home calculator uses.
 * Returns unrounded numbers; round for display only.
 */
export function buildBudgetTable(
  fromYear: number,
  toYear: number,
  incomes: number[] = BUDGET_TABLE_INCOMES,
  twoEarners: [number, number][] = BUDGET_TABLE_TWO_EARNERS,
): BudgetTable {
  const row = (income: number, maritalStatus: 'single' | 'married', spouseIncome = 0): BudgetTableRow => {
      const base = {
        income,
        period: 'annual' as const,
        maritalStatus,
        pensionContribution: 0,
        additionalCredits: 0,
        ...(spouseIncome > 0 ? { spouseIncome } : {}),
      };
      const { scenarioA, scenarioB, delta } = compareScenarios(
        { ...base, taxYear: fromYear },
        { ...base, taxYear: toYear },
      );
      return {
        income,
        takeHomeBefore: scenarioA.netAnnual,
        takeHomeAfter: scenarioB.netAnnual,
        diffYear: delta.netAnnual,
        diffMonth: delta.netAnnual / 12,
        diffWeek: delta.netAnnual / 52,
        ...(spouseIncome > 0 ? { spouseIncome } : {}),
      };
  };
  return {
    single: incomes.map((i) => row(i, 'single')),
    couple: incomes.map((i) => row(i, 'married')),
    coupleTwoEarners: twoEarners.map(([a, b]) => row(a, 'married', b)),
  };
}

import { compareScenarios } from '../taxEngine';

export const BUDGET_TABLE_INCOMES = [30000, 45000, 60000, 80000, 100000];

export type BudgetTableRow = {
  income: number;
  takeHomeBefore: number;
  takeHomeAfter: number;
  diffYear: number;
  diffMonth: number;
};

export type BudgetTable = { single: BudgetTableRow[]; couple: BudgetTableRow[] };

/**
 * Every cell comes from compareScenarios() → calculateNetIncome(), the same function the take-home calculator uses.
 * Returns unrounded numbers; round for display only.
 */
export function buildBudgetTable(fromYear: number, toYear: number, incomes: number[] = BUDGET_TABLE_INCOMES): BudgetTable {
  const rows = (maritalStatus: 'single' | 'married'): BudgetTableRow[] =>
    incomes.map((income) => {
      const base = { income, period: 'annual' as const, maritalStatus, pensionContribution: 0, additionalCredits: 0 };
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
      };
    });
  return { single: rows('single'), couple: rows('married') };
}

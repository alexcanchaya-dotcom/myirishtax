import { compareScenarios } from '../taxEngine';

export const BUDGET_TABLE_INCOMES = [30000, 45000, 60000, 80000, 100000];

export type BudgetTableRow = {
  income: number;
  takeHomeBefore: number;
  takeHomeAfter: number;
  diffYear: number;
  diffMonth: number;
  diffWeek: number;
};

export type BudgetTable = { single: BudgetTableRow[] };

/**
 * Every cell comes from compareScenarios() → calculateNetIncome(), the same function the take-home calculator uses.
 * Single people only while Budget 2027 is single-only (PM, 11 Oct 2026). Returns unrounded numbers; round for display only.
 */
export function buildBudgetTable(fromYear: number, toYear: number, incomes: number[] = BUDGET_TABLE_INCOMES): BudgetTable {
  const row = (income: number): BudgetTableRow => {
    const base = { income, period: 'annual' as const, maritalStatus: 'single' as const, pensionContribution: 0, additionalCredits: 0 };
    const { scenarioA, scenarioB, delta } = compareScenarios({ ...base, taxYear: fromYear }, { ...base, taxYear: toYear });
    return {
      income,
      takeHomeBefore: scenarioA.netAnnual,
      takeHomeAfter: scenarioB.netAnnual,
      diffYear: delta.netAnnual,
      diffMonth: delta.netAnnual / 12,
      diffWeek: delta.netAnnual / 52,
    };
  };
  return { single: incomes.map(row) };
}

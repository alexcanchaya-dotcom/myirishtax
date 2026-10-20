import { compareScenarios, type CalculationInput } from '../taxEngine';

export const BUDGET_TABLE_INCOMES = [30000, 45000, 60000, 80000, 100000];

/** Married / civil partners, both earning (household take-home). */
export const BUDGET_TABLE_TWO_EARNERS: [number, number][] = [
  [30000, 30000],
  [50000, 40000],
  [70000, 15000],
  [60000, 60000],
];

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

export type BudgetTable = {
  single: BudgetTableRow[];
  singleParent: BudgetTableRow[];
  couple: BudgetTableRow[];
  coupleTwoEarners: BudgetTableRow[];
};

type Household = Pick<CalculationInput, 'maritalStatus' | 'singleParent' | 'spouseIncome'>;

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
  const row = (income: number, household: Household): BudgetTableRow => {
    const base = { income, period: 'annual' as const, pensionContribution: 0, additionalCredits: 0, ...household };
    const { scenarioA, scenarioB, delta } = compareScenarios({ ...base, taxYear: fromYear }, { ...base, taxYear: toYear });
    return {
      income,
      takeHomeBefore: scenarioA.netAnnual,
      takeHomeAfter: scenarioB.netAnnual,
      diffYear: delta.netAnnual,
      diffMonth: delta.netAnnual / 12,
      diffWeek: delta.netAnnual / 52,
      ...(household.spouseIncome ? { spouseIncome: household.spouseIncome } : {}),
    };
  };
  return {
    single: incomes.map((i) => row(i, { maritalStatus: 'single' })),
    singleParent: incomes.map((i) => row(i, { maritalStatus: 'single', singleParent: true })),
    couple: incomes.map((i) => row(i, { maritalStatus: 'married' })),
    coupleTwoEarners: twoEarners.map(([a, b]) => row(a, { maritalStatus: 'married', spouseIncome: b })),
  };
}

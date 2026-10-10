import { BUDGET_2027 } from '../../lib/config/taxYear2027';
import { isTaxYearAvailable, toTaxYearConfig } from '../../lib/config/taxYearConfig';
import { calculateNetIncome } from '../../lib/taxEngine';
import { buildBudgetTable } from '../../lib/budget/budgetTable';

// Appendix A of budget-2027-spec.md (2026, PRSI month-weighted), rounded to the euro.
const APPENDIX_A_2026 = {
  single: { 30000: 26296, 45000: 37010, 60000: 44925, 80000: 54979, 100000: 64532 },
  couple: { 30000: 28296, 45000: 39210, 60000: 48725, 80000: 58779, 100000: 68332 },
} as const;

describe('Budget 2027 table', () => {
  it('the 2026 column matches Appendix A', () => {
    const table = buildBudgetTable(2026, 2026);
    for (const row of table.single) {
      expect(Math.round(row.takeHomeBefore)).toBe(APPENDIX_A_2026.single[row.income as keyof typeof APPENDIX_A_2026.single]);
    }
    for (const row of table.couple) {
      expect(Math.round(row.takeHomeBefore)).toBe(APPENDIX_A_2026.couple[row.income as keyof typeof APPENDIX_A_2026.couple]);
    }
  });

  it('toTaxYearConfig throws while blanks are empty, naming them', () => {
    const blank = JSON.parse(JSON.stringify(BUDGET_2027)) as typeof BUDGET_2027;
    blank.incomeTax.standardRate = null;
    blank.prsi.rateFrom1Jan = null;
    expect(() => toTaxYearConfig(blank)).toThrow(/2027_STANDARD_RATE/);
    expect(() => toTaxYearConfig(blank)).toThrow(/2027_PRSI_RATE_FROM_1_JAN/);
  });

  it('2027 is not available while the config is pending', () => {
    if (BUDGET_2027.status === 'pending') {
      expect(isTaxYearAvailable(2027)).toBe(false);
    }
    expect(isTaxYearAvailable(2026)).toBe(true);
  });

  it('once confirmed, the 2027 cells equal calculateNetIncome(taxYear: 2027)', () => {
    if (BUDGET_2027.status !== 'confirmed') return;
    const table = buildBudgetTable(2026, 2027);
    for (const row of table.single) {
      const direct = calculateNetIncome({ income: row.income, period: 'annual', maritalStatus: 'single', taxYear: 2027 });
      expect(row.takeHomeAfter).toBeCloseTo(direct.netAnnual, 6);
    }
    for (const row of table.couple) {
      const direct = calculateNetIncome({ income: row.income, period: 'annual', maritalStatus: 'married', taxYear: 2027 });
      expect(row.takeHomeAfter).toBeCloseTo(direct.netAnnual, 6);
    }
  });
});

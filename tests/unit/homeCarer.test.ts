import { readFileSync } from 'fs';
import { join } from 'path';
import { calculateNetIncome, homeCarerCredit } from '../../lib/taxEngine';
import { getTaxYearConfig } from '../../lib/config/taxYearConfig';
import { fromSearch, toSearch, type HomeUrlState } from '../../lib/homeUrlState';

const c26 = getTaxYearConfig(2026);
const married = { period: 'annual' as const, maritalStatus: 'married' as const, taxYear: 2026 };

describe('Home Carer Tax Credit (Revenue rates page, TDM 15-01-29)', () => {
  it('max credit by year; €7,200 income limit, then half the excess (max income 2023 €10,600, 2024 €10,800, 2025/26 €11,100)', () => {
    expect([2023, 2024, 2025, 2026].map((y) => getTaxYearConfig(y).homeCarer)).toEqual([
      { max: 1700, incomeLimit: 7200 }, { max: 1800, incomeLimit: 7200 }, { max: 1950, incomeLimit: 7200 }, { max: 1950, incomeLimit: 7200 },
    ]);
    expect(homeCarerCredit(getTaxYearConfig(2023), 10600)).toBe(0);
    expect(homeCarerCredit(getTaxYearConfig(2024), 10800)).toBe(0);
    expect(homeCarerCredit(c26, 11100)).toBe(0);
  });

  it('Revenue table: carer income €10,950 → €75; €11,100 → €0; €7,200 → full €1,950', () => {
    expect(homeCarerCredit(c26, 10950)).toBe(75);
    expect(homeCarerCredit(c26, 11100)).toBe(0);
    expect(homeCarerCredit(c26, 7200)).toBe(1950);
    expect(homeCarerCredit(c26, 0)).toBe(1950);
  });

  it('one income €60,000, spouse at home: income tax 13,400 − (4,000 + 2,000 + 1,950) = €5,450', () => {
    const r = calculateNetIncome({ ...married, income: 60000, homeCarer: true });
    expect(r.payeAfterCredits).toBeCloseTo(5450, 6);
    expect(r.homeCarerCredit).toBe(1950);
    const without = calculateNetIncome({ ...married, income: 60000 });
    expect(r.netAnnual - without.netAnnual).toBeCloseTo(1950, 6);
  });

  it('carer earns €3,000: the credit beats the band increase (€6,050 vs €7,400 income tax)', () => {
    const r = calculateNetIncome({ ...married, income: 60000, spouseIncome: 3000, homeCarer: true });
    expect(r.payeAfterCredits).toBeCloseTo(6050, 6);
    expect(r.homeCarerCredit).toBe(1950);
    expect(r.household?.bandIncrease).toBe(0);
    const bandOnly = calculateNetIncome({ ...married, income: 60000, spouseIncome: 3000 });
    expect(bandOnly.payeAfterCredits).toBeCloseTo(7400, 6);
  });

  it('carer earns €9,000: the band increase is better (€7,400 vs €8,150), so no credit is used', () => {
    const r = calculateNetIncome({ ...married, income: 60000, spouseIncome: 9000, homeCarer: true });
    expect(r.payeAfterCredits).toBeCloseTo(7400, 6);
    expect(r.homeCarerCredit).toBeUndefined();
    expect(r.household?.bandIncrease).toBe(9000);
  });

  it('ignored when single; URL carer=1 for married only; UI checkbox and hint', () => {
    const s1 = calculateNetIncome({ ...married, maritalStatus: 'single', income: 40000, homeCarer: true });
    const s2 = calculateNetIncome({ ...married, maritalStatus: 'single', income: 40000 });
    expect(s1.netAnnual).toBe(s2.netAnnual);
    const d: HomeUrlState = {
      income: 60000, period: 'annual', maritalStatus: 'single', spouseIncome: 0, singleParent: false, homeCarer: false, over65: false,
      pension: 0, pensionAge: '', credits: 0, taxYear: 2026,
    };
    const s = fromSearch('?status=married&carer=1', d);
    expect(s.homeCarer).toBe(true);
    expect(toSearch(s, d)).toBe('?status=married&carer=1');
    expect(toSearch({ ...s, maritalStatus: 'single' }, d)).not.toContain('carer');
    const home = readFileSync(join(__dirname, '../../app/HomeClient.tsx'), 'utf8');
    expect(home).toContain('My spouse or partner is a home carer');
    expect(home).toContain('Home Carer Tax Credit up to €1,950 in 2026, reduced if their own pay is over €7,200');
    expect(readFileSync(join(__dirname, '../../components/TaxSummaryCard.tsx'), 'utf8')).toContain('Includes the Home Carer Tax Credit');
  });
});

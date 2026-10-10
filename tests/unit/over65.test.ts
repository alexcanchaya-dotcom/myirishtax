import { readFileSync } from 'fs';
import { join } from 'path';
import { calculateNetIncome } from '../../lib/taxEngine';
import { getTaxYearConfig } from '../../lib/config/taxYearConfig';
import { fromSearch, toSearch, type HomeUrlState } from '../../lib/homeUrlState';

const base = { period: 'annual' as const, taxYear: 2026 };

describe('65 or over: Age Tax Credit, exemption limits and marginal relief (Revenue)', () => {
  it('config: €245 / €490 credit, €18,000 / €36,000 exemption limits, 2023–2026', () => {
    for (const y of [2023, 2024, 2025, 2026]) {
      expect(getTaxYearConfig(y).over65).toEqual({ creditSingle: 245, creditMarried: 490, exemptionSingle: 18000, exemptionMarried: 36000 });
    }
  });

  it('single €60,000: Age Tax Credit only, income tax 15,200 − 4,245 = €10,955', () => {
    const r = calculateNetIncome({ ...base, maritalStatus: 'single', income: 60000, over65: true });
    expect(r.payeAfterCredits).toBeCloseTo(10955, 6);
    expect(r.ageCredit).toBe(245);
    expect(r.ageRelief).toBe('credits');
    const under = calculateNetIncome({ ...base, maritalStatus: 'single', income: 60000 });
    expect(r.netAnnual - under.netAnnual).toBeCloseTo(245, 6);
  });

  it('married €36,000 (one income): within the €36,000 exemption limit, so no income tax (credits alone leave €710)', () => {
    const r = calculateNetIncome({ ...base, maritalStatus: 'married', income: 36000, over65: true });
    expect(r.payeAfterCredits).toBe(0);
    expect(r.ageRelief).toBe('exempt');
    // 7,200 − (4,000 + 2,000 + 490) = 710 under the normal system
    expect(r.payeBeforeCredits - r.credits).toBeCloseTo(710, 6);
  });

  it('married €38,000: marginal relief 40% × (38,000 − 36,000) = €800 beats credits (€1,110)', () => {
    const r = calculateNetIncome({ ...base, maritalStatus: 'married', income: 38000, over65: true });
    expect(r.payeAfterCredits).toBeCloseTo(800, 6);
    expect(r.ageRelief).toBe('marginal');
  });

  it('married €45,000: credits (€2,510) beat marginal relief (€3,600); at twice the limit no marginal relief', () => {
    const r = calculateNetIncome({ ...base, maritalStatus: 'married', income: 45000, over65: true });
    expect(r.payeAfterCredits).toBeCloseTo(2510, 6);
    expect(r.ageRelief).toBe('credits');
  });

  it('two earners: exemption on joint income (€20,000 + €15,000 = €35,000 ≤ €36,000)', () => {
    const r = calculateNetIncome({ ...base, maritalStatus: 'married', income: 20000, spouseIncome: 15000, over65: true });
    expect(r.payeAfterCredits).toBe(0);
    expect(r.ageRelief).toBe('exempt');
  });

  it('USC and PRSI unchanged', () => {
    const a = calculateNetIncome({ ...base, maritalStatus: 'married', income: 38000, over65: true });
    const b = calculateNetIncome({ ...base, maritalStatus: 'married', income: 38000 });
    expect(a.uscTotal).toBe(b.uscTotal);
    expect(a.prsi).toBe(b.prsi);
  });

  it('URL over65=1, checkbox wording, hint and card line', () => {
    const d: HomeUrlState = {
      income: 60000, period: 'annual', maritalStatus: 'single', spouseIncome: 0, singleParent: false, homeCarer: false, over65: false,
      pension: 0, pensionAge: '', credits: 0, taxYear: 2026,
    };
    const s = fromSearch('?over65=1', d);
    expect(s.over65).toBe(true);
    expect(toSearch(s, d)).toBe('?over65=1');
    const home = readFileSync(join(__dirname, '../../app/HomeClient.tsx'), 'utf8');
    expect(home).toContain('Either of us is 65 or over this year');
    expect(home).toContain('I’m 65 or over this year');
    expect(home).toContain('If total income is €18,000 or less (€36,000 for a couple) there is no income tax');
    expect(readFileSync(join(__dirname, '../../components/TaxSummaryCard.tsx'), 'utf8')).toContain('marginal relief (40% of income above the 65+ exemption limit)');
  });
});

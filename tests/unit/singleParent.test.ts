import { readFileSync } from 'fs';
import { join } from 'path';
import { calculateNetIncome } from '../../lib/taxEngine';
import { getTaxYearConfig } from '../../lib/config/taxYearConfig';
import { fromSearch, toSearch, type HomeUrlState } from '../../lib/homeUrlState';

const base = { period: 'annual' as const, maritalStatus: 'single' as const, taxYear: 2026 };

describe('One-parent: Single Person Child Carer Credit + €4,000 wider band (Revenue)', () => {
  it('config matches the Revenue tax relief charts (credit / band)', () => {
    expect(getTaxYearConfig(2023).singlePersonChildCarer).toEqual({ credit: 1650, band: 44000 });
    expect(getTaxYearConfig(2024).singlePersonChildCarer).toEqual({ credit: 1750, band: 46000 });
    expect(getTaxYearConfig(2025).singlePersonChildCarer).toEqual({ credit: 1900, band: 48000 });
    expect(getTaxYearConfig(2026).singlePersonChildCarer).toEqual({ credit: 1900, band: 48000 });
    for (const y of [2023, 2024, 2025, 2026]) {
      const c = getTaxYearConfig(y);
      expect(c.singlePersonChildCarer.band - (c.incomeTaxBandsSingle[0].upTo ?? 0)).toBe(4000);
    }
  });

  it('audit case 6: one parent €40,000 (2026) → income tax €2,100, take-home €35,472.18', () => {
    const r = calculateNetIncome({ ...base, income: 40000, singleParent: true });
    expect(r.payeAfterCredits).toBeCloseTo(2100, 2); // 8,000 − (2,000 + 2,000 + 1,900)
    expect(r.netAnnual).toBeCloseTo(35472.18, 2);
    const without = calculateNetIncome({ ...base, income: 40000 });
    expect(r.netAnnual - without.netAnnual).toBeCloseTo(1900, 6);
  });

  it('€46,000: the €48,000 band is worth another €400 on top of the credit', () => {
    const r = calculateNetIncome({ ...base, income: 46000, singleParent: true });
    expect(r.payeBeforeCredits).toBeCloseTo(9200, 6); // all at 20%
    const typedCreditOnly = calculateNetIncome({ ...base, income: 46000, additionalCredits: 1900 });
    expect(r.netAnnual - typedCreditOnly.netAnnual).toBeCloseTo(400, 6);
  });

  it('ignored when married', () => {
    const a = calculateNetIncome({ ...base, maritalStatus: 'married', income: 60000, singleParent: true });
    const b = calculateNetIncome({ ...base, maritalStatus: 'married', income: 60000 });
    expect(a.netAnnual).toBe(b.netAnnual);
  });

  it('URL: ?parent=1 round-trips for single only; UI has the checkbox and Revenue-based hint', () => {
    const d: HomeUrlState = {
      income: 60000, period: 'annual', maritalStatus: 'single', spouseIncome: 0, singleParent: false,
      pension: 0, pensionAge: '', credits: 0, taxYear: 2026,
    };
    const s = fromSearch('?income=40000&parent=1', d);
    expect(s.singleParent).toBe(true);
    expect(toSearch(s, d)).toBe('?income=40000&parent=1');
    expect(toSearch({ ...s, maritalStatus: 'married' }, d)).not.toContain('parent');
    const home = readFileSync(join(__dirname, '../../app/HomeClient.tsx'), 'utf8');
    expect(home).toContain('I’m a single parent');
    expect(home).toContain('Single Person Child Carer Credit (€1,900 in 2026) and €4,000 more taxed at 20%');
    expect(readFileSync(join(__dirname, '../../app/api/calc/route.ts'), 'utf8')).toContain('singleParent: z.boolean().optional()');
  });
});

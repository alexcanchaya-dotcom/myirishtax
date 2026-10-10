import { readFileSync } from 'fs';
import { join } from 'path';
import { calculateNetIncome, calculateUSC, sumBands } from '../../lib/taxEngine';
import { getTaxYearConfig } from '../../lib/config/taxYearConfig';
import { fromSearch, toSearch, type HomeUrlState } from '../../lib/homeUrlState';

const c26 = getTaxYearConfig(2026);
const base = { period: 'annual' as const, maritalStatus: 'single' as const, taxYear: 2026 };

describe('Reduced USC: full medical card or 70+, income €60,000 or less (Revenue)', () => {
  it('config 2023–2026: 0.5% on the first €12,012, 2% on the balance, €60,000 limit', () => {
    for (const y of [2023, 2024, 2025, 2026]) {
      expect(getTaxYearConfig(y).reducedUsc).toEqual({ incomeLimit: 60000, bands: [{ upTo: 12012, rate: 0.005 }, { upTo: null, rate: 0.02 }] });
    }
  });

  it('Revenue example: €50,000 → €819.82 (€60.06 + €759.76)', () => {
    expect(sumBands(calculateUSC(50000, c26, true))).toBeCloseTo(819.82, 2);
  });

  it('€60,000 is reduced (€1,019.82); €60,001 goes back to the standard rates', () => {
    expect(sumBands(calculateUSC(60000, c26, true))).toBeCloseTo(60.06 + (60000 - 12012) * 0.02, 6);
    expect(sumBands(calculateUSC(60001, c26, true))).toBeCloseTo(sumBands(calculateUSC(60001, c26)), 6);
  });

  it('the €13,000 exemption still comes first', () => {
    expect(sumBands(calculateUSC(13000, c26, true))).toBe(0);
  });

  it('take-home at €50,000 rises by the USC saved; two earners: only your USC is reduced', () => {
    const a = calculateNetIncome({ ...base, income: 50000, reducedUsc: true });
    const b = calculateNetIncome({ ...base, income: 50000 });
    expect(a.uscTotal).toBeCloseTo(819.82, 2);
    expect(a.netAnnual - b.netAnnual).toBeCloseTo(b.uscTotal - 819.82, 6);
    const couple = calculateNetIncome({ ...base, maritalStatus: 'married', income: 50000, spouseIncome: 40000, reducedUsc: true });
    expect(couple.household?.yourUsc).toBeCloseTo(819.82, 2);
    expect(couple.household?.spouseUsc).toBeCloseTo(sumBands(calculateUSC(40000, c26)), 6);
  });

  it('URL medcard=1 and the checkbox wording', () => {
    const d: HomeUrlState = {
      income: 60000, period: 'annual', maritalStatus: 'single', spouseIncome: 0, singleParent: false, homeCarer: false, over65: false,
      reducedUsc: false, pension: 0, pensionAge: '', credits: 0, taxYear: 2026,
    };
    expect(toSearch(fromSearch('?medcard=1', d), d)).toBe('?medcard=1');
    const home = readFileSync(join(__dirname, '../../app/HomeClient.tsx'), 'utf8');
    expect(home).toContain('I have a full medical card, or I’m 70 or over');
    expect(home).toContain('0.5% on the first €12,012 and 2% on the rest, if your own income is €60,000 or less. Not for a GP visit card.');
  });
});

import { readFileSync } from 'fs';
import { join } from 'path';
import { PENSION_AGE_HINT, PENSION_AGE_OPTIONS } from '../../lib/pensionAgeOptions';

const read = (p: string) => readFileSync(join(__dirname, '..', '..', p), 'utf8');
const home = read('app/HomeClient.tsx');
const contractor = read('app/contractor-calculator/ContractorCalculatorClient.tsx');

describe('plain labels with short hints (married, age, other credits)', () => {
  it('married: plain label and a short joint-assessment hint; the assumption sits under the spouse pay box', () => {
    expect(home).toContain('label="Single or married?"');
    expect(home).toContain("taxed together (joint assessment). Add your spouse or partner’s pay, or leave it at 0 if only you earn.");
    expect(home).toContain('hint={SPOUSE_HINT}');
    expect(home).not.toContain('label="Marital status"');
  });

  it('age: "Your age" with the Revenue age limits in the hint (15% under 30 … 40% at 60+, €115,000 earnings cap)', () => {
    // Revenue, Tax relief limits on pension contributions: Under 30 15% … 60 or over 40%; earnings limit €115,000.
    expect(PENSION_AGE_HINT).toContain('15% under 30, up to 40% at 60 or over, on earnings up to €115,000');
    expect(PENSION_AGE_OPTIONS.map((o) => o.label)).toEqual([
      'Not set (40% limit)', 'Under 30 (15%)', '30–39 (20%)', '40–49 (25%)', '50–54 (30%)', '55–59 (35%)', '60 or over (40%)',
    ]);
    for (const src of [home, contractor]) {
      expect(src).toMatch(/label="Your age"[\s\S]{0,240}hint=\{PENSION_AGE_HINT\}/);
      expect(src).not.toContain('Age (pension relief limit)');
    }
  });

  it('other credits: plain label, hint with 2026 Revenue figures, standard credits already included', () => {
    // Revenue tax relief charts 2026: Rent Tax Credit 1,000 / 2,000; Age Tax Credit 245 / 490.
    expect(home).toContain('label="Other tax credits (per year)"');
    expect(home).toContain('rent tax credit (up to €1,000 in 2026, €2,000 for a couple)');
    expect(home).toContain('or dependent relative credit (€305)');
    expect(home).toContain('Your personal and Employee (PAYE) credits are already included.');
    expect(home).not.toContain('label="Extra credits"');
  });
});

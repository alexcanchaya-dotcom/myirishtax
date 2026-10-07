import fs from 'fs';
import path from 'path';
import { RATES_LABEL, RATES_CHECKED } from '../../lib/config/siteRates';

const root = path.join(__dirname, '..', '..');
const read = (p: string) => fs.readFileSync(path.join(root, p), 'utf8');

const PAGES = [
  'app/HomeClient.tsx',
  'app/contractor-calculator/ContractorCalculatorClient.tsx',
  'app/redundancy-calculator/RedundancyCalculatorClient.tsx',
  'app/auto-enrolment-calculator/AutoEnrolmentCalculatorClient.tsx',
  'app/rent-tax-credit/RentTaxCreditClient.tsx',
  'app/small-benefit-exemption/page.tsx',
  'app/second-income-form-12/page.tsx',
];

describe('trust strip', () => {
  it('rates label is one config value (switches to Budget 2027 when #39 ships)', () => {
    expect(RATES_LABEL).toBe('2026 rates');
    expect(RATES_CHECKED).toMatch(/^\d{1,2} [A-Z][a-z]{2} 20\d\d$/);
    const strip = read('components/TrustStrip.tsx');
    expect(strip).toContain('{RATES_LABEL}');
    expect(strip).toContain('checked {RATES_CHECKED}');
    expect(strip).toContain('Sources:');
    expect(strip).toContain('Estimate only, not financial or tax advice');
    expect(strip).not.toMatch(/2026 rates/);
  });

  it.each(PAGES)('%s shows the trust strip', (p) => {
    expect(read(p)).toMatch(/<TrustStrip[\s/>]/);
  });

  it('no accountant / ACCA wording on the site pages or strip', () => {
    for (const p of [...PAGES, 'app/about/page.tsx', 'components/TrustStrip.tsx', 'app/layout.tsx']) {
      expect(read(p)).not.toMatch(/\bACCA\b|qualified accountant|accountant[- ]reviewed|checked by an accountant/i);
    }
    expect(fs.existsSync(path.join(root, 'public/about.html'))).toBe(false);
  });
});

import fs from 'fs';
import path from 'path';

const read = (p: string) => fs.readFileSync(path.join(__dirname, '..', '..', p), 'utf8');

describe("'Owed tax back?' block", () => {
  const src = read('components/OwedTaxBack.tsx');
  it('gives the free Revenue route in Revenue’s words', () => {
    expect(src).toContain('Owed tax back?');
    expect(src).toContain('myAccount');
    expect(src).toContain('PAYE Services');
    expect(src).toContain('Review your tax for the previous 4 years');
    expect(src).toContain('https://www.revenue.ie/en/online-services/services/myaccount/help-guides/quick-steps-to-complete-an-online-review-of-your-taxes.aspx');
    expect(src).toContain('Estimate only, not financial or tax advice.');
  });
  it('has no affiliate links, tracking or ad label', () => {
    const hrefs = src.match(/https?:\/\/[^'"\s]+/g) ?? [];
    for (const h of hrefs) expect(h.startsWith('https://www.revenue.ie/')).toBe(true);
    expect(src).not.toMatch(/track\(|gtag|data-track|onClick|#Ad|utm_/);
  });
  it('sits under the take-home result card', () => {
    const home = read('app/HomeClient.tsx');
    expect(home.indexOf('<OwedTaxBack />')).toBeGreaterThan(home.indexOf('<TaxSummaryCard'));
  });
});

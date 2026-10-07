import fs from 'fs';
import path from 'path';

const read = (p: string) => fs.readFileSync(path.join(__dirname, '..', '..', p), 'utf8');

describe('FAQ + WebApplication structured data', () => {
  it('JSON-LD is built from the same items that are rendered (no hidden claims)', () => {
    const src = read('components/Faq.tsx');
    expect(src).toContain("'@type': 'FAQPage'");
    expect(src).toContain('items.map((i) => (');
    expect(src).toContain("'@type': 'WebApplication'");
    expect(src).toContain("price: '0'");
  });

  it.each([
    ['app/HomeClient.tsx', 'TAKE_HOME_FAQ'],
    ['app/contractor-calculator/ContractorCalculatorClient.tsx', 'CONTRACTOR_FAQ'],
    ['app/redundancy-calculator/RedundancyCalculatorClient.tsx', 'REDUNDANCY_FAQ'],
  ])('%s renders its FAQ and WebApplication data', (p, faq) => {
    const src = read(p);
    expect(src).toContain(`<Faq items={${faq}} />`);
    expect(src).toContain('<WebAppJsonLd');
  });

  it('FAQ answers match the engine figures and avoid forbidden words', () => {
    const faq = read('lib/faq/calculatorFaqs.ts');
    for (const s of ['4.2% to 4.35% on 1 October 2026', '€13,000 or less', '€115,000', 'lower of €35,000', '€650', '31 October 2026', '18 November 2026', '€10,160 plus €765', '€200,000', '1 January 2014', '€600 a week']) {
      expect(faq).toContain(s);
    }
    expect(faq).not.toMatch(/\b(accurate|precise|guaranteed)\b/i);
  });
});

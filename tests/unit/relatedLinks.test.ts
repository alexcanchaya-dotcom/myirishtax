import { readFileSync } from 'fs';
import { join } from 'path';

const read = (p: string) => readFileSync(join(__dirname, '..', '..', p), 'utf8');

describe('related links (SEO brief section 4)', () => {
  it('related box includes redundancy and rent-a-room relief', () => {
    const box = read('components/RelatedCalculators.tsx');
    expect(box).toContain("href: '/redundancy-calculator'");
    expect(box).toContain("href: '/rent-a-room-relief'");
  });

  it('contractor page links to take-home and Form 12 with descriptive text', () => {
    const page = read('app/contractor-calculator/ContractorCalculatorClient.tsx');
    expect(page).toMatch(/href="\/"[^>]*>\s*Take-home pay calculator/);
    expect(page).toMatch(/href="\/second-income-form-12"[^>]*>\s*Second income: do I need a Form 12\?/);
  });

  it('homepage links to the redundancy page with a descriptive anchor', () => {
    expect(read('app/HomeClient.tsx')).toMatch(
      /href="\/redundancy-calculator"[^>]*>\s*How much of a redundancy package is tax-free\?/,
    );
  });

  it('redundancy page links to take-home and Form 12', () => {
    const page = read('app/redundancy-calculator/RedundancyCalculatorClient.tsx');
    expect(page).toMatch(/href="\/"[^>]*>\s*Take-home pay calculator/);
    expect(page).toContain('href="/second-income-form-12"');
  });

  it('rent-a-room page shows the related box', () => {
    expect(read('app/rent-a-room-relief/page.tsx')).toContain('<RelatedCalculators current="rent-a-room" />');
  });
});

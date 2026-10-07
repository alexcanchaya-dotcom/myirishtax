import fs from 'fs';
import path from 'path';

const read = (p: string) => fs.readFileSync(path.join(__dirname, '..', '..', p), 'utf8');

describe('phone menu and related box (UX 4)', () => {
  const nav = read('components/NavBar.tsx');
  it.each([
    '/', '/contractor-calculator', '/redundancy-calculator', '/auto-enrolment-calculator', '/rent-tax-credit',
    '/small-benefit-exemption', '/second-income-form-12', '/about',
  ])('phone menu links to %s', (href) => {
    const mobile = nav.slice(nav.indexOf('const mobileGroups'));
    expect(mobile).toContain(`href: '${href}'`);
  });

  it('menu button is 44px (p-3 + 20px icon) with aria-expanded and aria-controls; items py-3', () => {
    expect(nav).toMatch(/className="rounded-md p-3 [^"]*"\s+aria-label=/);
    expect(nav).toContain('aria-expanded={mobileOpen}');
    expect(nav).toContain('aria-controls="mobile-menu"');
    expect(nav).toContain('id="mobile-menu"');
    expect(nav).toContain('px-3 py-3');
  });

  it('related calculators box includes redundancy', () => {
    expect(read('components/RelatedCalculators.tsx')).toContain("href: '/redundancy-calculator'");
  });
});

import fs from 'fs';
import path from 'path';

const read = (p: string) => fs.readFileSync(path.join(__dirname, '..', '..', p), 'utf8');

describe('guides link to the calculators and other guides', () => {
  it.each([
    ['app/exit-tax-ireland/page.tsx', 'exit-tax'],
    ['app/second-income-form-12/page.tsx', 'second-income'],
    ['app/small-benefit-exemption/page.tsx', 'small-benefit'],
  ])('%s renders the related box without linking to itself', (file, key) => {
    expect(read(file)).toContain(`<RelatedCalculators current="${key}" />`);
  });

  it('related box lists every calculator and guide', () => {
    const rel = read('components/RelatedCalculators.tsx');
    for (const href of [
      '/',
      '/auto-enrolment-calculator',
      '/rent-tax-credit',
      '/contractor-calculator',
      '/redundancy-calculator',
      '/payslip-october-prsi',
      '/rent-a-room-relief',
      '/marginal-tax-rate-ireland',
      '/emergency-tax-ireland',
      '/second-income-form-12',
      '/small-benefit-exemption',
      '/exit-tax-ireland',
    ]) {
      expect(rel).toContain(`href: '${href}'`);
    }
    expect(rel).toContain('Related calculators and guides');
  });
});

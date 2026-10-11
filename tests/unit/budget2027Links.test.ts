import fs from 'fs';
import path from 'path';

const read = (p: string) => fs.readFileSync(path.join(__dirname, '..', '..', p), 'utf8');

describe('Budget 2027 in-text links (draft)', () => {
  it('link component points to /budget-2027 with the planned anchor, gated on confirmed', () => {
    const c = read('components/Budget2027Link.tsx');
    expect(c).toContain('href="/budget-2027"');
    expect(c).toContain('Check your take-home pay with Budget 2027');
    expect(c).toContain("BUDGET_2027.status !== 'confirmed'");
  });

  it.each([
    'app/HomeClient.tsx',
    'app/contractor-calculator/ContractorCalculatorClient.tsx',
    'app/redundancy-calculator/RedundancyCalculatorClient.tsx',
    'app/marginal-tax-rate-ireland/page.tsx',
  ])('%s uses the Budget 2027 link', (f) => {
    expect(read(f)).toContain('<Budget2027Link');
  });

  it('/budget-2027 links to small benefit exemption and rent tax credit', () => {
    const page = read('app/budget-2027/page.tsx');
    expect(page).toContain('href="/small-benefit-exemption"');
    expect(page).toContain('href="/rent-tax-credit"');
  });
});

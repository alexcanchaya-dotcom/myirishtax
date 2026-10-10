import fs from 'fs';
import path from 'path';

const read = (p: string) => fs.readFileSync(path.join(__dirname, '..', '..', p), 'utf8');

describe('contractor page retitle + deadline note', () => {
  it('is titled sole trader / self-employed (Class S)', () => {
    expect(read('app/contractor-calculator/ContractorCalculatorClient.tsx')).toContain('title="Sole trader / self-employed tax (Class S)"');
    expect(read('app/contractor-calculator/page.tsx')).toContain("title: 'Sole trader / self-employed tax calculator (Class S) | MyIrishTax'");
  });
  it('states 31 Oct 2026 and the ROS 18 Nov 2026 date with the Revenue eBrief', () => {
    const src = read('app/contractor-calculator/ContractorCalculatorClient.tsx');
    expect(src).toContain('Saturday 31 October 2026');
    expect(src).toContain('Wednesday 18 November');
    expect(src).toContain('pay and file on ROS');
    expect(src).toContain('https://www.revenue.ie/en/tax-professionals/ebrief/2026/no-0342026.aspx');
  });
});

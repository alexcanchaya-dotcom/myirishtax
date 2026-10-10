import fs from 'fs';
import path from 'path';
import { pageMeta } from '../../lib/pageMeta';

// PM queue: "Share preview fix: og:title, og:url and og:description per page."
// Before: every page served the homepage's og tags from app/layout.tsx (e.g. /contractor-calculator shared as
// "Irish take-home pay | 2026 tax year").
const root = path.join(__dirname, '..', '..');
const read = (p: string) => fs.readFileSync(path.join(root, p), 'utf8');

const PAGES: Array<[string, string]> = [
  ['app/about/page.tsx', '/about'],
  ['app/auto-enrolment-calculator/page.tsx', '/auto-enrolment-calculator'],
  ['app/contractor-calculator/page.tsx', '/contractor-calculator'],
  ['app/cookies/page.tsx', '/cookies'],
  ['app/disclaimer/page.tsx', '/disclaimer'],
  ['app/exit-tax-ireland/page.tsx', '/exit-tax-ireland'],
  ['app/payslip-october-prsi/page.tsx', '/payslip-october-prsi'],
  ['app/privacy/page.tsx', '/privacy'],
  ['app/redundancy-calculator/page.tsx', '/redundancy-calculator'],
  ['app/rent-a-room-relief/page.tsx', '/rent-a-room-relief'],
  ['app/rent-tax-credit/page.tsx', '/rent-tax-credit'],
  ['app/rental-calculator/page.tsx', '/rental-calculator'],
  ['app/second-income-form-12/page.tsx', '/second-income-form-12'],
  ['app/small-benefit-exemption/page.tsx', '/small-benefit-exemption'],
  ['app/terms/page.tsx', '/terms'],
];

describe('share preview per page', () => {
  it('pageMeta sets og/twitter title, description and url from the page itself', () => {
    const m = pageMeta({ title: 'T', description: 'D', path: '/contractor-calculator' });
    expect(m.openGraph).toMatchObject({ title: 'T', description: 'D', url: 'https://myirishtax.com/contractor-calculator' });
    expect(m.twitter).toMatchObject({ title: 'T', description: 'D', card: 'summary_large_image' });
    expect(m.alternates).toEqual({ canonical: '/contractor-calculator' });
  });

  it.each(PAGES)('%s uses pageMeta with path %s', (file, p) => {
    const s = read(file);
    expect(s).toContain('export const metadata = pageMeta({');
    expect(s).toContain(`path: '${p}',`);
  });
});

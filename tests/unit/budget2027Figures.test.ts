import fs from 'fs';
import path from 'path';
import { renderToStaticMarkup } from 'react-dom/server';
import { BUDGET_2027 } from '../../lib/config/taxYear2027';
import { getTaxYearConfig, isTaxYearAvailable, listSupportedYears, toTaxYearConfig } from '../../lib/config/taxYearConfig';
import { calculateNetIncome } from '../../lib/taxEngine';
import Budget2027Page, { metadata } from '../../app/budget-2027/page';

const TPC =
  'https://assets.gov.ie/static/documents/c6792805/Budget_2027_-_Tax_Policy_Changes_-_Publication_Version.pdf';

// Every confirmed figure, as stated in Budget 2027 Tax Policy Changes (TPC). Page = TPC printed page number.
const CONFIRMED: Array<[string, unknown, unknown]> = [
  ['incomeTax.standardRate (TPC p.26 Table 10)', BUDGET_2027.incomeTax.standardRate, 0.2],
  ['incomeTax.higherRate (TPC p.26 Table 10)', BUDGET_2027.incomeTax.higherRate, 0.4],
  ['incomeTax.bandSingle (TPC p.4)', BUDGET_2027.incomeTax.bandSingle, 46500],
  ['incomeTax.bandMarriedOneEarner (TPC p.4)', BUDGET_2027.incomeTax.bandMarriedOneEarner, 55500],
  ['incomeTax.bandMarriedTwoEarners (TPC p.4)', BUDGET_2027.incomeTax.bandMarriedTwoEarners, 55500],
  ['incomeTax.twoEarnerMaxIncrease (TPC p.4)', BUDGET_2027.incomeTax.twoEarnerMaxIncrease, 37500],
  ['incomeTax.bandOneParent (TPC p.4)', BUDGET_2027.incomeTax.bandOneParent, 50500],
  ['credits.personalSingle (TPC p.4)', BUDGET_2027.credits.personalSingle, 2125],
  ['credits.employeePaye (TPC p.4)', BUDGET_2027.credits.employeePaye, 2125],
  ['credits.earnedIncome (TPC p.4)', BUDGET_2027.credits.earnedIncome, 2125],
  ['credits.homeCarer (TPC p.4)', BUDGET_2027.credits.homeCarer, 2050],
  ['credits.rentSingle (TPC p.6)', BUDGET_2027.credits.rentSingle, 1150],
  ['credits.rentCouple (TPC p.6)', BUDGET_2027.credits.rentCouple, 2300],
  ['usc.exemptionThreshold (TPC p.4)', BUDGET_2027.usc.exemptionThreshold, 13000],
  ['usc.bands[0].upTo (TPC p.4)', BUDGET_2027.usc.bands[0].upTo, 12012],
  ['usc.bands[0].rate (TPC p.4)', BUDGET_2027.usc.bands[0].rate, 0.005],
  ['usc.bands[1].upTo (TPC p.4)', BUDGET_2027.usc.bands[1].upTo, 30300],
  ['usc.bands[1].rate (TPC p.4)', BUDGET_2027.usc.bands[1].rate, 0.02],
  ['usc.bands[2].rate (TPC p.4)', BUDGET_2027.usc.bands[2].rate, 0.03],
  ['usc.bands[3].upTo (TPC p.4)', BUDGET_2027.usc.bands[3].upTo, 'balance'],
  ['usc.bands[3].rate (TPC p.4)', BUDGET_2027.usc.bands[3].rate, 0.08],
  ['minimumWage.hourly (TPC p.4)', BUDGET_2027.minimumWage.hourly, 14.94],
  ['minimumWage.startDate (TPC p.22)', BUDGET_2027.minimumWage.startDate, '1 January 2027'],
  ['startDate (TPC p.4)', BUDGET_2027.startDate, '1 January 2027'],
  ['sources.taxPolicyChanges', BUDGET_2027.sources.taxPolicyChanges, TPC],
  ['sources.minimumWage', BUDGET_2027.sources.minimumWage, TPC],
  [
    'sources.speech',
    BUDGET_2027.sources.speech,
    'https://www.gov.ie/en/department-of-finance/speeches/statement-by-minister-harris-on-budget-2027/',
  ],
  // Resolved 10 Oct 2026 (Finance Bill for Budget 2027 not published yet; Revenue charts still 2026):
  ['credits.personalMarried (TPC p.18 Table 3: €100k IT 20,475 = 28,900 − 2,125 − 2,050 − 4,250)', BUDGET_2027.credits.personalMarried, 4250],
  ['credits.singlePersonChildCarer (not among TPC §2.1.1 credit changes; Revenue 2026 €1,900)', BUDGET_2027.credits.singlePersonChildCarer, 1900],
  ['usc.bands[2].upTo (TPC Table 1 no change; Tables 2–5 and Example 8 only fit €70,044)', BUDGET_2027.usc.bands[2].upTo, 70044],
  ['prsi.rateFrom1Jan (SW(MP)A 2024 s.3; TPC note 2)', BUDGET_2027.prsi.rateFrom1Jan, 0.0435],
  ['prsi.changeMonth (SW(MP)A 2024 s.3(4): 1 October 2027)', BUDGET_2027.prsi.changeMonth, 10],
  ['prsi.rateAfterChange (SW(MP)A 2024 s.3: 4.5 per cent)', BUDGET_2027.prsi.rateAfterChange, 0.045],
  ['prsi.weeklyNilThreshold (unchanged, DSP Class A page)', BUDGET_2027.prsi.weeklyNilThreshold, 352],
  ['prsi.creditMaxWeekly (unchanged, DSP Class A page)', BUDGET_2027.prsi.creditMaxWeekly, 12],
  ['prsi.creditTopWeekly (unchanged, DSP Class A page)', BUDGET_2027.prsi.creditTopWeekly, 424],
  ['prsi.classSMinimum (unchanged, DSP PRSI page)', BUDGET_2027.prsi.classSMinimum, 650],
  ['sources.prsi', BUDGET_2027.sources.prsi, 'https://www.irishstatutebook.ie/eli/2024/act/24/section/3/enacted/en/html'],
  ['figuresCheckedOn', BUDGET_2027.figuresCheckedOn, '10 Oct 2026'],
  ['figuresCheckedOnIso', BUDGET_2027.figuresCheckedOnIso, '2026-10-10'],
  ['status', BUDGET_2027.status, 'confirmed'],
];

const STILL_NULL: Array<[string, unknown]> = [
  ['autoEnrolmentEmployeeRate (unchanged)', BUDGET_2027.autoEnrolmentEmployeeRate],
  ['sources.revenueSummary (Revenue PDF still says 2026)', BUDGET_2027.sources.revenueSummary],
];

const round = (n: number) => Math.round(n);

describe('Budget 2027 figures (confirmed)', () => {
  it.each(CONFIRMED)('%s matches the source', (_label, actual, expected) => {
    expect(actual).toBe(expected);
  });

  it.each(STILL_NULL)('%s is still null', (_label, actual) => {
    expect(actual).toBeNull();
  });

  it('what-changed extras match TPC', () => {
    expect(BUDGET_2027.otherChanges).toEqual([
      'The Rent-a-Room limit goes up from €14,000 to €16,000 from 1 January 2027.',
      'The tax-free limit for selling electricity you generate at home to the grid goes up from €400 to €600.',
      'Childminders can earn up to €20,000 tax-free under childminding relief (it was €15,000).',
    ]);
  });

  it('no source points at Revenue (its summary PDF still says Budget 2026)', () => {
    for (const url of Object.values(BUDGET_2027.sources)) {
      if (url) expect(url).not.toMatch(/revenue\.ie/i);
    }
  });

  it('2027 is offered in the calculators; USC exemption is "€13,000 or less"', () => {
    expect(isTaxYearAvailable(2027)).toBe(true);
    expect(listSupportedYears()).toContain(2027);
    const c = getTaxYearConfig(2027);
    expect(c.uscBands.map((b) => b.upTo)).toEqual([12012, 30300, 70044, null]);
    expect(c.prsiRateChanges).toEqual([{ fromMonth: 10, rate: 0.045 }]);
    expect(c.singlePersonChildCarer).toEqual({ credit: 1900, band: 50500 });
    expect(calculateNetIncome({ income: 13000, period: 'annual', maritalStatus: 'single', taxYear: 2027 }).uscTotal).toBe(0);
  });

  it('a blank figure still fails loudly', () => {
    const clone = JSON.parse(JSON.stringify(BUDGET_2027)) as typeof BUDGET_2027;
    clone.credits.personalMarried = null;
    expect(() => toTaxYearConfig(clone)).toThrow(/2027_PERSONAL_CREDIT_MARRIED/);
  });

  // Department of Finance, Budget 2027 Tax Policy Changes, p.18 Table 2 (single PAYE employee, Class A), "proposed" columns.
  it.each([
    [30000, 1750, 1316, 420],
    [50000, 6450, 2194, 1017],
    [75000, 16450, 3291, 2015],
    [100000, 26450, 4388, 4015],
  ])('TPC Table 2: single €%i → income tax €%i, PRSI €%i, USC €%i', (gross, it_, prsi, usc) => {
    const r = calculateNetIncome({ income: gross, period: 'annual', maritalStatus: 'single', taxYear: 2027 });
    expect(round(r.payeAfterCredits)).toBe(it_);
    expect(round(r.prsi)).toBe(prsi);
    expect(round(r.uscTotal)).toBe(usc);
  });
});

describe('/budget-2027 confirmed', () => {
  const html = renderToStaticMarkup(Budget2027Page());

  it('shows the headline, both years and the tables', () => {
    expect(html).toContain('Budget 2027: how much better off will I be?');
    expect(html).toMatch(/a week better off/);
    expect(html).toContain('Difference a week');
    expect(html).toMatch(/<table/);
    expect(html).toContain('Figures checked: 10 Oct 2026.');
    expect(html).not.toContain('The figures are coming');
    expect(html).toContain('4.5% from 1 October 2027');
    expect(html).toContain('€70,044');
    expect(html).toContain('Rent-a-Room limit goes up from €14,000 to €16,000');
    expect(html).toContain('Estimate only, not financial or tax advice');
    expect(html).not.toMatch(/accurate|precise|guaranteed|accountant|ACCA/i);
  });

  it('is indexable', () => {
    expect(metadata.robots).toBeUndefined();
  });

  it('is in the sitemap with the checked date', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const sitemap = require('../../app/sitemap').default as () => { url: string; lastModified?: string }[];
    const e = sitemap().find((x) => x.url.endsWith('/budget-2027'));
    expect(e?.lastModified).toBe('2026-10-10');
  });
});

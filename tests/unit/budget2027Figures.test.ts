import fs from 'fs';
import path from 'path';
import { renderToStaticMarkup } from 'react-dom/server';
import { BUDGET_2027 } from '../../lib/config/taxYear2027';
import { isTaxYearAvailable, listSupportedYears, toTaxYearConfig } from '../../lib/config/taxYearConfig';
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
];

// Left null on purpose: Al decides on Wed 7 Oct 2026 (see PR #39).
const STILL_NULL: Array<[string, unknown]> = [
  ['credits.personalMarried (not stated; TPC examples imply €4,250)', BUDGET_2027.credits.personalMarried],
  ['credits.singlePersonChildCarer (not stated)', BUDGET_2027.credits.singlePersonChildCarer],
  ['usc.bands[2].upTo (TPC p.4 €70,444 vs worked tables €70,044)', BUDGET_2027.usc.bands[2].upTo],
  ['prsi.rateFrom1Jan (TPC table notes only; no DSP notice)', BUDGET_2027.prsi.rateFrom1Jan],
  ['prsi.changeMonth', BUDGET_2027.prsi.changeMonth],
  ['prsi.rateAfterChange', BUDGET_2027.prsi.rateAfterChange],
  ['prsi.weeklyNilThreshold', BUDGET_2027.prsi.weeklyNilThreshold],
  ['prsi.creditMaxWeekly', BUDGET_2027.prsi.creditMaxWeekly],
  ['prsi.creditTopWeekly', BUDGET_2027.prsi.creditTopWeekly],
  ['autoEnrolmentEmployeeRate (unchanged)', BUDGET_2027.autoEnrolmentEmployeeRate],
  ['sources.revenueSummary (Revenue PDF still says 2026)', BUDGET_2027.sources.revenueSummary],
  ['sources.prsi (no DSP notice)', BUDGET_2027.sources.prsi],
  ['figuresCheckedOn (set when Al signs off)', BUDGET_2027.figuresCheckedOn],
];

describe('Budget 2027 figures (draft, pending)', () => {
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

  it('status is pending', () => {
    expect(BUDGET_2027.status).toBe('pending');
  });

  it('2027 is not offered in any calculator while pending', () => {
    expect(isTaxYearAvailable(2027)).toBe(false);
    expect(listSupportedYears()).not.toContain(2027);
  });

  it('marking it confirmed with today\'s nulls would fail loudly, naming the open blanks', () => {
    const clone = JSON.parse(JSON.stringify(BUDGET_2027)) as typeof BUDGET_2027;
    clone.status = 'confirmed';
    let message = '';
    try {
      toTaxYearConfig(clone);
    } catch (e) {
      message = (e as Error).message;
    }
    expect(message).toMatch(/2027_PERSONAL_CREDIT_MARRIED/);
    expect(message).toMatch(/2027_USC_BAND_3_TOP/);
    expect(message).toMatch(/2027_PRSI_RATE_FROM_1_JAN/);
    expect(message).not.toMatch(/2027_STANDARD_RATE[^_]/);
  });
});

describe('/budget-2027 while pending', () => {
  const html = renderToStaticMarkup(Budget2027Page());

  it('shows the H1 and the figures-coming line', () => {
    expect(html).toContain('Budget 2027: how much better off will I be?');
    expect(html).toContain('The figures are coming');
  });

  it('renders no figures', () => {
    expect(html).not.toMatch(/€/);
    expect(html).not.toMatch(/%/);
    expect(html).not.toMatch(/<table/);
    for (const n of ['46,500', '55,500', '37,500', '50,500', '2,125', '2,050', '1,150', '2,300', '30,300', '14.94', '16,000', '70,444', '70,044']) {
      expect(html).not.toContain(n);
    }
    expect(html).not.toContain('What changed');
    expect(html).not.toContain('year=2027');
  });

  it('is noindex', () => {
    expect(metadata.robots).toEqual({ index: false, follow: true });
  });

  it('is not in the sitemap', () => {
    const sitemap = fs.readFileSync(path.join(__dirname, '../../public/sitemap.xml'), 'utf8');
    expect(sitemap).not.toContain('budget-2027');
  });
});

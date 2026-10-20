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
  // Resolved 10 Oct 2026 before the Finance Bill was published (confirmed by Finance (No. 2) Bill 2026 s.3 on 20 Oct 2026; Revenue charts still 2026):
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
  ['figuresCheckedOn', BUDGET_2027.figuresCheckedOn, '20 Oct 2026'],
  ['figuresCheckedOnIso', BUDGET_2027.figuresCheckedOnIso, '2026-10-20'],
  ['sources.financeBill (Oireachtas, Bill No. 98 of 2026)', BUDGET_2027.sources.financeBill, 'https://www.oireachtas.ie/en/bills/bill/2026/98/'],
  ['singleOnly (off: Finance (No. 2) Bill 2026 s.3 confirms the couple and one-parent figures)', BUDGET_2027.singleOnly, false],
  ['status', BUDGET_2027.status, 'confirmed'],
];

// Finance (No. 2) Bill 2026 (Bill No. 98 of 2026, published 19 Oct 2026), section 3, for 2027 and later years.
// Each couple and one-parent figure checked against the Bill text on 20 Oct 2026.
const FINANCE_BILL_S3: Array<[string, unknown, unknown]> = [
  ['s.3(a)(i) TCA s.15(3)(i): two-earner increase €37,500 (was €35,000)', BUDGET_2027.incomeTax.twoEarnerMaxIncrease, 37500],
  ['s.3(a)(ii) TCA s.15 Table Part 1: single, first €46,500 at 20%', BUDGET_2027.incomeTax.bandSingle, 46500],
  ['s.3(a)(ii) TCA s.15 Table Part 2: single person child carer, first €50,500 at 20%', BUDGET_2027.incomeTax.bandOneParent, 50500],
  ['s.3(a)(ii) TCA s.15 Table Part 3: married / civil partners, first €55,500 at 20%', BUDGET_2027.incomeTax.bandMarriedOneEarner, 55500],
  ['s.3(a)(ii) Part 3 is also the two-earner base band', BUDGET_2027.incomeTax.bandMarriedTwoEarners, 55500],
  ['s.3(b)(i) TCA s.461(a): married / civil partner personal credit €4,250 (was €4,000)', BUDGET_2027.credits.personalMarried, 4250],
  ['s.3(b)(iii) TCA s.461(c): single personal credit €2,125 (was €2,000)', BUDGET_2027.credits.personalSingle, 2125],
  ['s.3(c) TCA s.466A(2): home carer credit €2,050 (was €1,950)', BUDGET_2027.credits.homeCarer, 2050],
  ['s.3(d) TCA s.472(4): employee credit €2,125 (was €2,000)', BUDGET_2027.credits.employeePaye, 2125],
  ['s.3(e) TCA s.472AB: earned income credit €2,125 (was €2,000)', BUDGET_2027.credits.earnedIncome, 2125],
  ['TCA s.462B not amended: Single Person Child Carer Credit stays €1,900', BUDGET_2027.credits.singlePersonChildCarer, 1900],
  ['s.4(1)(b) TCA s.473B(13): rent credit €1,150 single', BUDGET_2027.credits.rentSingle, 1150],
  ['s.4(1)(b) TCA s.473B(13): rent credit €2,300 couple', BUDGET_2027.credits.rentCouple, 2300],
  ['rates unchanged at 20% / 40% (s.3(a)(ii) Table)', [BUDGET_2027.incomeTax.standardRate, BUDGET_2027.incomeTax.higherRate], [0.2, 0.4]],
];

describe('Finance (No. 2) Bill 2026 s.3', () => {
  it.each(FINANCE_BILL_S3)('%s', (_label, actual, expected) => {
    expect(actual).toEqual(expected);
  });

  it('every couple and one-parent figure cites the Bill in the config', () => {
    const src = fs.readFileSync(path.join(__dirname, '..', '..', 'lib/config/taxYear2027.ts'), 'utf8');
    for (const [key, cite] of [
      ['bandMarriedOneEarner', 'Finance (No. 2) Bill 2026 s.3(a)(ii)'],
      ['bandMarriedTwoEarners', 'Finance (No. 2) Bill 2026 s.3(a)(ii)'],
      ['twoEarnerMaxIncrease', 'Finance (No. 2) Bill 2026 s.3(a)(i)'],
      ['bandOneParent', 'Finance (No. 2) Bill 2026 s.3(a)(ii)'],
      ['personalMarried', 'Finance (No. 2) Bill 2026 s.3(b)(i)'],
      ['homeCarer', 'Finance (No. 2) Bill 2026 s.3(c)'],
      ['singlePersonChildCarer', 'does not amend TCA s.462B'],
    ]) {
      const line = src.split('\n').find((l) => l.trim().startsWith(`${key}:`));
      expect(line).toContain(cite);
    }
  });
});

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

// TPC p.19 Table 3: married couple, one income, two children (home carer credit), PAYE, Class A — "proposed" columns.
// Couples are on for 2027 since the Finance (No. 2) Bill 2026 s.3 confirmed the figures (20 Oct 2026).
describe('TPC Table 3 (married, one income, home carer)', () => {
  it.each([
    [45000, 575, 1974, 867],
    [55000, 2575, 2413, 1167],
    [75000, 10475, 3291, 2015],
    [100000, 20475, 4388, 4015],
  ])('€%i → income tax €%i, PRSI €%i, USC €%i', (gross, it_, prsi, usc) => {
    const r = calculateNetIncome({ income: gross, period: 'annual', maritalStatus: 'married', homeCarer: true, taxYear: 2027 });
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
    expect(html).toContain('Figures checked: 20 Oct 2026.');
    expect(html).not.toContain('The figures are coming');
    expect(html).toContain('4.5% from 1 October 2027');
    expect(html).toContain('€70,044');
    expect(html).toContain('Rent-a-Room limit goes up from €14,000 to €16,000');
    expect(html).toContain('Estimate only, not financial or tax advice');
    expect(html).not.toMatch(/accurate|precise|guaranteed|accountant|ACCA/i);
  });

  it('covers couples and single parents (Finance (No. 2) Bill 2026), and the pending line is gone', () => {
    expect(html).not.toContain('Couples and single parents: added once the Finance Bill confirms the figures.');
    expect(html).not.toMatch(/added once the Finance Bill/i);
    expect(html).toContain('Single parent (Single Person Child Carer Credit)');
    expect(html).toContain('Couple: married or civil partners, one earner');
    expect(html).toContain('Couple: married or civil partners, both earning');
    expect(html).toContain('€55,500');
    expect(html).toContain('€37,500');
    expect(html).toContain('€50,500');
    expect(html).toContain('€4,250');
    expect(html).toContain('€2,050');
    expect(html).toContain('The Single Person Child Carer Credit stays at €1,900.');
    expect(html).toContain('€2,300');
    expect(html).toContain('€46,500');
    expect(html).toContain('€2,125');
    expect(html).toContain('€1,150');
    expect(html).toContain('€30,300');
    expect(html).toContain('Table 2');
    expect(html).toContain('Example 8');
    // Married one earner €60,000: 2027 take-home €49,526; single parent €60,000: €48,301 (both from calculateNetIncome).
    expect(html).toContain('€49,526');
    expect(html).toContain('€48,301');
    expect(String(metadata.description)).toMatch(/married/i);
    expect(String(metadata.description)).toMatch(/single parent/i);
  });

  it('lists the Finance Bill as a source', () => {
    expect(html).toContain('href="https://www.oireachtas.ie/en/bills/bill/2026/98/"');
    expect(html).toContain('Finance (No. 2) Bill 2026</a>');
  });

  it('the compare widget offers single, single parent and married', () => {
    expect(html).toContain('<option value="singleParent">A single parent</option>');
    expect(html).toContain('<option value="married">Married or civil partners</option>');
  });

  it('is indexable', () => {
    expect(metadata.robots).toBeUndefined();
  });

  it('is in the sitemap with the checked date', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const sitemap = require('../../app/sitemap').default as () => { url: string; lastModified?: string }[];
    const e = sitemap().find((x) => x.url.endsWith('/budget-2027'));
    expect(e?.lastModified).toBe('2026-10-20');
  });
});

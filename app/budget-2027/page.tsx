import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { TaxDisclaimer } from '@/components/TaxDisclaimer';
import { BUDGET_2027 } from '@/lib/config/taxYear2027';
import { buildBudgetTable, type BudgetTableRow } from '@/lib/budget/budgetTable';
import { headlineWeekly } from '@/lib/budget/compareYears';
import { Budget2027Compare } from '@/components/budget/Budget2027Compare';
import { TrustStrip } from '@/components/TrustStrip';

// Live once BUDGET_2027.status is 'confirmed' (Al, 10 Oct 2026). While pending, PendingPage reads no figures,
// so partial figures can never reach the page.
const confirmed = BUDGET_2027.status === 'confirmed';

const TITLE = 'Budget 2027 calculator: how much better off? | MyIrishTax';
const DESCRIPTION =
  'How Budget 2027 changes Irish take-home pay at €30k to €100k, single or married, plus the changes in plain English and a free 2027 calculator. Estimate; not advice.';
const OG_TITLE = 'Budget 2027: how much better off will I be?';
const OG_DESCRIPTION =
  'Take-home pay before and after Budget 2027 at €30k–€100k, single or married, in plain English. A free estimate from MyIrishTax. Not advice.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/budget-2027' },
  // Keep the pending placeholder out of search results.
  robots: confirmed ? undefined : { index: false, follow: true },
  openGraph: {
    title: OG_TITLE,
    description: OG_DESCRIPTION,
    url: 'https://myirishtax.com/budget-2027',
    images: ['/og-image.png'],
  },
  twitter: { card: 'summary_large_image', title: OG_TITLE, description: OG_DESCRIPTION },
};

const h2 = 'text-xl font-semibold text-ink';
const link = 'text-ink underline decoration-line underline-offset-2 hover:text-brand-700';

const euro = (n: number) => `€${Math.round(n).toLocaleString('en-IE')}`;
const pct = (r: number) => `${Number((r * 100).toFixed(3))}%`;
function signedEuro(n: number): string {
  if (Math.abs(n) < 1) return '€0';
  return `${n > 0 ? '+' : '−'}€${Math.round(Math.abs(n)).toLocaleString('en-IE')}`;
}
function signedEuro2(n: number): string {
  if (Math.abs(n) < 0.005) return '€0';
  return `${n > 0 ? '+' : '−'}€${Math.abs(n).toLocaleString('en-IE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** "goes up from X to Y" / "stays at X" helper. Returns null when the 2027 value is blank. */
function moved(before: number, after: number | null, fmt: (n: number) => string, goes: string, stays: string) {
  if (after === null) return null;
  return after === before
    ? stays.replace('{before}', fmt(before))
    : goes.replace('{before}', fmt(before)).replace('{after}', fmt(after));
}

function whatChangedLines(): string[] {
  const b = BUDGET_2027;
  const it = b.incomeTax;
  const cr = b.credits;
  const lines: (string | null)[] = [
    moved(44000, it.bandSingle, euro,
      "The point where you start paying 40% goes up from {before} to {after} if you're single.",
      "The point where you start paying 40% stays at {before} if you're single."),
    moved(53000, it.bandMarriedOneEarner, euro,
      'For a married couple or civil partners with one income, it goes up from {before} to {after}.',
      'For a married couple or civil partners with one income, it stays at {before}.'),
    it.bandMarriedTwoEarners !== null && it.twoEarnerMaxIncrease !== null
      ? `If you both earn, the 20% band can go up to ${euro(it.bandMarriedTwoEarners)} plus up to ${euro(it.twoEarnerMaxIncrease)} for the second earner (it was €53,000 plus up to €35,000).`
      : null,
    it.bandOneParent !== null
      ? `For a single parent getting the Single Person Child Carer Credit, the 40% point goes from €48,000 to ${euro(it.bandOneParent)}.`
      : null,
    it.standardRate !== null && it.higherRate !== null
      ? it.standardRate === 0.2 && it.higherRate === 0.4
        ? 'The income tax rates stay at 20% and 40%.'
        : `The income tax rates are ${pct(it.standardRate)} and ${pct(it.higherRate)} (20% and 40% in 2026).`
      : null,
    cr.personalSingle !== null && cr.personalMarried !== null
      ? cr.personalSingle === 2000 && cr.personalMarried === 4000
        ? 'The personal tax credit stays at €2,000 (€4,000 for a married couple).'
        : `The personal tax credit goes from €2,000 to ${euro(cr.personalSingle)} (€4,000 to ${euro(cr.personalMarried)} for a married couple).`
      : null,
    moved(2000, cr.employeePaye, euro,
      'The employee (PAYE) tax credit goes from {before} to {after}.',
      'The employee (PAYE) tax credit stays at {before}.'),
    moved(2000, cr.earnedIncome, euro,
      'The earned income credit goes from {before} to {after}.',
      'The earned income credit stays at {before}.'),
    moved(1950, cr.homeCarer, euro, 'The home carer credit goes from {before} to {after}.', 'The home carer credit stays at {before}.'),
    moved(1900, cr.singlePersonChildCarer, euro,
      'The Single Person Child Carer Credit goes from {before} to {after}.',
      'The Single Person Child Carer Credit stays at {before}.'),
    cr.rentSingle !== null && cr.rentCouple !== null
      ? cr.rentSingle === 1000 && cr.rentCouple === 2000
        ? 'The rent tax credit stays at €1,000 a year (€2,000 for a couple taxed jointly).'
        : `The rent tax credit goes from €1,000 to ${euro(cr.rentSingle)} a year (€2,000 to ${euro(cr.rentCouple)} for a couple taxed jointly).`
      : null,
    b.usc.bands[1].upTo !== null && b.usc.bands[1].upTo !== 'balance'
      ? moved(28700, b.usc.bands[1].upTo, euro,
          'The 2% USC band now ends at {after} (it was {before}).',
          'The 2% USC band still ends at {before}.')
      : null,
    b.usc.bands.every((x) => x.rate !== null)
      ? b.usc.bands.map((x) => x.rate).join(',') === '0.005,0.02,0.03,0.08'
        ? 'USC rates stay at 0.5%, 2%, 3% and 8%.'
        : `USC rates are ${b.usc.bands.map((x) => pct(x.rate as number)).join(', ').replace(/, ([^,]*)$/, ' and $1')} (0.5%, 2%, 3% and 8% in 2026).`
      : null,
    b.usc.bands[2].upTo !== null && b.usc.bands[2].upTo !== 'balance'
      ? moved(70044, b.usc.bands[2].upTo, euro,
          'You pay the top 8% USC rate above {after} (it was {before}).',
          'You still pay the top 8% USC rate above {before}.')
      : null,
    moved(13000, b.usc.exemptionThreshold, euro,
      'If your income is {after} or less, you pay no USC (it was {before}).',
      'If your income is {before} or less, you still pay no USC.'),
    b.prsi.rateFrom1Jan !== null
      ? `Employee PRSI is ${pct(b.prsi.rateFrom1Jan)} from 1 January 2027${
          b.prsi.rateAfterChange !== null && b.prsi.changeMonth !== null
            ? `, rising to ${pct(b.prsi.rateAfterChange)} on 1 ${MONTHS[b.prsi.changeMonth - 1]} 2027`
            : ''
        }. In 2026 it went from 4.2% to 4.35% on 1 October.`
      : null,
    b.minimumWage.hourly !== null && b.minimumWage.startDate !== null
      ? `The minimum wage goes from €14.15 to €${b.minimumWage.hourly.toFixed(2)} an hour from ${b.minimumWage.startDate}.`
      : null,
    b.autoEnrolmentEmployeeRate !== null
      ? `Auto-enrolment (MyFutureFund): the employee rate is ${pct(b.autoEnrolmentEmployeeRate)}.`
      : null,
    ...b.otherChanges,
  ];
  return lines.filter((l): l is string => Boolean(l));
}

function Table({ rows }: { rows: BudgetTableRow[] }) {
  return (
    <div className="mt-3 overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-line text-ink">
            <th className="py-2 pr-4 font-semibold">Gross pay a year</th>
            <th className="py-2 pr-4 font-semibold">Take-home 2026</th>
            <th className="py-2 pr-4 font-semibold">Take-home 2027</th>
            <th className="py-2 pr-4 font-semibold">Difference a week</th>
            <th className="py-2 pr-4 font-semibold">a month</th>
            <th className="py-2 font-semibold">a year</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.income} className="border-b border-line last:border-0">
              <td className="py-2 pr-4">{r.spouseIncome ? `${euro(r.income)} + ${euro(r.spouseIncome)}` : euro(r.income)}</td>
              <td className="py-2 pr-4">{euro(r.takeHomeBefore)}</td>
              <td className="py-2 pr-4">{euro(r.takeHomeAfter)}</td>
              <td className="py-2 pr-4 font-medium text-ink">{signedEuro2(r.diffWeek)}</td>
              <td className="py-2 pr-4">{signedEuro(r.diffMonth)}</td>
              <td className="py-2">{signedEuro(r.diffYear)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PendingPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <PageHeader title="Budget 2027: how much better off will I be?">
        <p>
          Budget 2027 was announced on Tuesday 6 October 2026. The figures are coming: we&apos;ll add them here once
          we&apos;ve checked them against the official documents.
        </p>
      </PageHeader>
      <p className="text-base text-ink-muted">
        <Link href="/" className={link}>
          Work out your take-home pay →
        </Link>
      </p>
      <TaxDisclaimer className="mt-8" />
    </main>
  );
}

export default function Budget2027Page() {
  if (!confirmed) return <PendingPage />;

  const b = BUDGET_2027;
  const table = buildBudgetTable(2026, 2027);
  const single45 = table.single.find((r) => r.income === 45000);
  const headline = single45 && headlineWeekly(single45.diffWeek);
  const lines = whatChangedLines();

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <PageHeader title="Budget 2027: how much better off will I be?">
        <p>
          Budget 2027 was announced on Tuesday 6 October 2026. Most changes start in January 2027. Here&apos;s an
          estimate of what it means for your take-home pay.
        </p>
        <TrustStrip />
      </PageHeader>

      <div className="space-y-10 text-base leading-relaxed text-ink-muted">
        <section className="space-y-2">
          <p>{`Figures checked: ${b.figuresCheckedOn ?? ''}.`}</p>
          <p>
            Source: Budget 2027 documents,{' '}
            {b.sources.taxPolicyChanges ? (
              <a href={b.sources.taxPolicyChanges} className={link} rel="noopener noreferrer">gov.ie</a>
            ) : 'gov.ie'}{' '}
            {b.sources.revenueSummary ? (
              <>
                /{' '}
                <a href={b.sources.revenueSummary} className={link} rel="noopener noreferrer">Revenue</a>
              </>
            ) : null}.{b.sources.speech || b.sources.prsi ? ' Also: ' : ''}
            {b.sources.speech ? (
              <a href={b.sources.speech} className={link} rel="noopener noreferrer">Budget speech</a>
            ) : null}
            {b.sources.speech && b.sources.prsi ? ', ' : ''}
            {b.sources.prsi ? (
              <a href={b.sources.prsi} className={link} rel="noopener noreferrer">PRSI</a>
            ) : null}
            {b.sources.speech || b.sources.prsi ? '.' : ''}
          </p>
          <p>These are the Budget day announcements. Most become law later, in the Finance Act.</p>
          {headline ? (
            <p className="text-ink">
              On €45,000 as a single person, you&apos;re {headline} in 2027 ({signedEuro(single45!.diffMonth)} a month,{' '}
              {signedEuro(single45!.diffYear)} a year).
            </p>
          ) : null}
        </section>

        <Budget2027Compare />

        <section>
          <h2 className={h2}>How much better off?</h2>
          <p className="mt-4 font-semibold text-ink">Single</p>
          <Table rows={table.single} />
          <p className="mt-6 font-semibold text-ink">Couple: married or civil partners, one earner</p>
          <Table rows={table.couple} />
          <p className="mt-6 font-semibold text-ink">Couple: married or civil partners, both earning</p>
          <Table rows={table.coupleTwoEarners} />
          <p className="mt-4">
            <strong className="text-ink">What &quot;Couple&quot; means here:</strong> you&apos;re married or in a civil
            partnership and taxed jointly. In the one-earner table, one of you earns the salary shown and the other has no
            income. In the both-earning table the figures are for the household, with the second-earner band increase
            and both Employee Tax Credits.
          </p>
          <p className="mt-4 font-semibold text-ink">How we worked it out:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>You&apos;re an employee paid through PAYE for the full year, on PRSI Class A.</li>
            <li>You get the personal tax credit and the employee (PAYE) tax credit only. No other credits or reliefs.</li>
            <li>No pension contributions, including auto-enrolment (MyFutureFund). No benefit-in-kind.</li>
            <li>Standard USC rates (not the reduced rate for medical card holders or people aged 70 and over).</li>
            <li>
              2026 PRSI is 4.2% for January to September and 4.35% from 1 October. 2027 PRSI is 4.35% for January to
              September and 4.5% from 1 October 2027 (already set in law by the Social Welfare (Miscellaneous
              Provisions) Act 2024).
            </li>
            <li>Figures are rounded to the nearest euro, so the differences may be €1 off the columns.</li>
            <li>
              The married couple&apos;s personal tax credit (€4,250) isn&apos;t printed in the Budget documents as a
              sentence; it is the figure the Department of Finance&apos;s own tables use. The 8% USC rate starts above
              €70,044, as in those tables (one list in the document prints €70,444, which none of its tables use).
            </li>
            <li>This is an estimate. Your payslip can differ.</li>
          </ul>
          <TaxDisclaimer className="mt-4" />
        </section>

        {lines.length > 0 ? (
          <section>
            <h2 className={h2}>What changed</h2>
            <p className="mt-3">
              In plain words, here&apos;s what Budget 2027 changes for employees.
              {b.startDate ? ` It starts on ${b.startDate}.` : ''}
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              {lines.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
            <p className="mt-3">
              See also the{' '}
              <Link href="/rent-tax-credit" className={link}>
                rent tax credit calculator
              </Link>{' '}
              and the{' '}
              <Link href="/auto-enrolment-calculator" className={link}>
                auto-enrolment calculator
              </Link>
              .
            </p>
          </section>
        ) : null}

        <section>
          <h2 className={h2}>Try your own numbers</h2>
          <p className="mt-3">
            <Link href="/?year=2027" className={link}>
              Work out your own 2027 take-home pay →
            </Link>
          </p>
          <p className="mt-1">The take-home calculator opens with 2027 already picked. You can switch back to 2026 to compare.</p>
          <p className="mt-3">
            Other tools:{' '}
            <Link href="/small-benefit-exemption" className={link}>
              Small benefit exemption: tax-free vouchers from your employer
            </Link>
            ,{' '}
            <Link href="/rent-tax-credit" className={link}>
              Rent tax credit: what you can claim back
            </Link>
            ,{' '}
            <Link href="/auto-enrolment-calculator" className={link}>auto-enrolment</Link>,{' '}
            <Link href="/redundancy-calculator" className={link}>redundancy</Link>.
          </p>
        </section>
      </div>
    </main>
  );
}

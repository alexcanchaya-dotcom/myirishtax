import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { TaxDisclaimer } from '@/components/TaxDisclaimer';
import { TrustStrip } from '@/components/TrustStrip';
import { RelatedCalculators } from '@/components/RelatedCalculators';
import { Budget2027Link } from '@/components/Budget2027Link';
import { pageMeta } from '@/lib/pageMeta';
import {
  MARGINAL_HEADLINE_INCOME,
  MARGINAL_TABLE_INCOMES,
  marginalOnRaise
} from '@/lib/marginalRate';

const headline = marginalOnRaise(MARGINAL_HEADLINE_INCOME);
const keptRounded = Math.round(headline.kept);

export const metadata = pageMeta({
  title: "Why a pay rise adds so little: Ireland's marginal tax rate | MyIrishTax",
  description: `On €${MARGINAL_HEADLINE_INCOME.toLocaleString('en-IE')} a year, a €1,000 pay rise adds about €${keptRounded} to take-home pay in 2026. See how 40% income tax, 8% USC and PRSI add up, with the marginal rate at €30k to €120k. Estimate only; not financial or tax advice.`,
  path: '/marginal-tax-rate-ireland',
});

const REVENUE_BANDS =
  'https://www.revenue.ie/en/personal-tax-credits-reliefs-and-exemptions/tax-relief-charts/index.aspx';
const REVENUE_USC =
  'https://www.revenue.ie/en/jobs-and-pensions/usc/standard-rates-thresholds.aspx';
const DSP_CLASS_A =
  'https://www.gov.ie/en/department-of-social-protection/publications/prsi-class-a-rates/';

const h2 = 'text-xl font-semibold text-ink';
const link =
  'text-ink underline decoration-line underline-offset-2 hover:text-brand-700';
const eur = (n: number, dp = 2) =>
  `€${n.toLocaleString('en-IE', { minimumFractionDigits: dp, maximumFractionDigits: dp })}`;
const pct = (r: number) =>
  `${(r * 100).toLocaleString('en-IE', { maximumFractionDigits: 2 })}%`;

export default function MarginalTaxRatePage() {
  const rows = MARGINAL_TABLE_INCOMES.map((i) => marginalOnRaise(i));
  return (
    <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
      <PageHeader
        title={`Why does a €1,000 pay rise only add about €${keptRounded}?`}
      >
        <TrustStrip
          kind="guide"
          sources={[
            { label: 'Revenue', href: REVENUE_BANDS },
            { label: 'gov.ie', href: DSP_CLASS_A }
          ]}
        />
        <p>
          For a single PAYE employee on {eur(MARGINAL_HEADLINE_INCOME, 0)} a
          year at 2026 rates, an extra €1,000 of pay adds about €{keptRounded}{' '}
          to take-home pay. Every extra euro above €70,044 pays 40% income tax,
          8% USC and PRSI, so a little over half of it goes in tax.
        </p>
      </PageHeader>

      <div className="space-y-10 text-base leading-relaxed text-ink-muted">
        <section>
          <h2 className={h2}>
            Worked example: €1,000 on top of {eur(MARGINAL_HEADLINE_INCOME, 0)}
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              Income tax at 40% (single people pay 20% on the first €44,000 and
              40% on the rest): {eur(headline.incomeTax)}
            </li>
            <li>
              USC at 8% (the rate above €70,044; it is 3% between €28,700 and
              €70,044): {eur(headline.usc)}
            </li>
            <li>
              PRSI: {eur(headline.prsi)}. Employee PRSI is 4.35% from 1 October
              2026 (it was 4.2% before), so this is the average over 2026. At
              4.35% alone it is €43.50.
            </li>
            <li>
              <strong className="text-ink">
                You keep {eur(headline.kept)}
              </strong>
              , a marginal rate of {pct(headline.rate)}.
            </li>
          </ul>
          <p className="mt-3">
            Your tax credits don&apos;t change with a pay rise, so none of them
            offset the extra tax.
          </p>
        </section>

        <section>
          <h2 className={h2}>Marginal rate at other salaries (single, 2026)</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-ink">
                  <th className="py-2 pr-3 font-semibold">Pay a year</th>
                  <th className="py-2 pr-3 font-semibold">Income tax</th>
                  <th className="py-2 pr-3 font-semibold">USC</th>
                  <th className="py-2 pr-3 font-semibold">PRSI</th>
                  <th className="py-2 pr-3 font-semibold">
                    You keep of €1,000
                  </th>
                  <th className="py-2 font-semibold">Marginal rate</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.income} className="border-b border-line">
                    <td className="py-2 pr-3">{eur(r.income, 0)}</td>
                    <td className="py-2 pr-3">{eur(r.incomeTax)}</td>
                    <td className="py-2 pr-3">{eur(r.usc)}</td>
                    <td className="py-2 pr-3">{eur(r.prsi)}</td>
                    <td className="py-2 pr-3">{eur(r.kept)}</td>
                    <td className="py-2">{pct(r.rate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm">
            Worked out by our take-home calculator for a single PAYE employee
            with the personal and PAYE credits only. Married couples, the
            self-employed and people with a medical card or over 70 pay
            different rates.
          </p>
        </section>

        <section>
          <h2 className={h2}>Why Budget gains look small for higher earners</h2>
          <p className="mt-3">
            Budgets usually raise tax credits or widen the bands by a fixed
            amount. A €100 bigger credit is worth €100 a year whether you earn
            €40,000 or €140,000, and a wider band saves at most the difference
            between the two rates on the extra amount. On a higher salary that
            fixed amount is a small share of your pay, and any pay rise on top
            is taxed at over 50%, so the change on your payslip can look like
            only a few euro a week.
          </p>
        </section>

        <section>
          <h2 className={h2}>Check your own figures</h2>
          <p className="mt-3">
            Try the{' '}
            <Link href="/" className={link}>
              Take-home pay calculator
            </Link>{' '}
            with your salary before and after a rise. If you&apos;re getting a
            lump sum, see{' '}
            <Link href="/redundancy-calculator" className={link}>
              How much of a redundancy package is tax-free?
            </Link>
            <Budget2027Link before=" To see what changes in 2027: " after="." />
          </p>
        </section>

        <TaxDisclaimer />

        <section>
          <h2 className={h2}>Sources (checked 10 Oct 2026)</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm">
            <li>
              <a
                href={REVENUE_BANDS}
                className={link}
                target="_blank"
                rel="noopener noreferrer"
              >
                Revenue: Tax rates, bands and reliefs
              </a>{' '}
              &quot;€44,000 @ 20%, balance @ 40%&quot; (single, 2026)
            </li>
            <li>
              <a
                href={REVENUE_USC}
                className={link}
                target="_blank"
                rel="noopener noreferrer"
              >
                Revenue: Standard rates and thresholds of USC
              </a>{' '}
              2026: &quot;Next €41,344 3%&quot;, &quot;Balance 8%&quot;
            </li>
            <li>
              <a
                href={DSP_CLASS_A}
                className={link}
                target="_blank"
                rel="noopener noreferrer"
              >
                gov.ie: PRSI Class A rates
              </a>{' '}
              (employee PRSI 4.2% to 30 September 2026, 4.35% from 1 October
              2026)
            </li>
          </ul>
        </section>
      </div>
      <RelatedCalculators current="marginal-rate" />
    </main>
  );
}

import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { TaxDisclaimer } from '@/components/TaxDisclaimer';
import { TrustStrip } from '@/components/TrustStrip';
import { OCTOBER_EXAMPLE_SALARIES, octoberPrsiExample } from '@/lib/payslipPrsi';

export const metadata = {
  title: 'Why is my October 2026 pay lower? Employee PRSI 4.2% to 4.35% | MyIrishTax',
  description:
    'From 1 October 2026 employee PRSI went up from 4.2% to 4.35%. What it means per week and per month, with worked examples. Estimate only; not financial or tax advice.',
  alternates: { canonical: '/payslip-october-prsi' },
};

const DSP_CLASS_A = 'https://www.gov.ie/en/department-of-social-protection/publications/prsi-class-a-rates/';
const h2 = 'text-xl font-semibold text-ink';
const link = 'text-ink underline decoration-line underline-offset-2 hover:text-brand-700';

const eur = (n: number, dp = 2) =>
  `€${n.toLocaleString('en-IE', { minimumFractionDigits: dp, maximumFractionDigits: dp })}`;
const pct = (r: number) => `${(r * 100).toLocaleString('en-IE', { maximumFractionDigits: 2 })}%`;

export default function PayslipOctoberPrsiPage() {
  const rows = OCTOBER_EXAMPLE_SALARIES.map(octoberPrsiExample);
  const sixty = octoberPrsiExample(60000);
  return (
    <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
      <PageHeader title="Why is my October pay lower?">
        <TrustStrip kind="guide" sources={[{ label: 'gov.ie', href: DSP_CLASS_A }]} />
        <p>
          From 1 October 2026, employee PRSI went up from {pct(sixty.before)} to {pct(sixty.after)} of your pay. Income
          tax and USC did not change in October, so most employees take home a little less from their first October
          payslip.
        </p>
      </PageHeader>

      <div className="space-y-10 text-base leading-relaxed text-ink-muted">
        <section>
          <h2 className={h2}>Worked example: €60,000 a year</h2>
          <p className="mt-3">
            €60,000 a year is {eur(sixty.weeklyPay)} a week. PRSI was {eur(sixty.weeklyBefore)} a week at{' '}
            {pct(sixty.before)}. From October it is {eur(sixty.weeklyAfter)} a week at {pct(sixty.after)}. That is{' '}
            {eur(sixty.weeklyMore)} more a week, or {eur(sixty.monthlyMore)} more a month ({eur(sixty.monthlyBefore)} to{' '}
            {eur(sixty.monthlyAfter)}).
          </p>
          <p className="mt-3">
            Over the whole of 2026 (9 months at {pct(sixty.before)} and 3 months at {pct(sixty.after)}) PRSI on €60,000
            comes to {eur(sixty.yearPrsi2026)}.
          </p>
        </section>

        <section>
          <h2 className={h2}>Other salaries</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-ink">
                  <th className="py-2 pr-3 font-semibold">Pay a year</th>
                  <th className="py-2 pr-3 font-semibold">PRSI a week to Sep</th>
                  <th className="py-2 pr-3 font-semibold">From 1 Oct</th>
                  <th className="py-2 font-semibold">More a month</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.annualPay} className="border-b border-line">
                    <td className="py-2 pr-3">{eur(r.annualPay, 0)}</td>
                    <td className="py-2 pr-3">{eur(r.weeklyBefore)}</td>
                    <td className="py-2 pr-3">{eur(r.weeklyAfter)}</td>
                    <td className="py-2">{eur(r.monthlyMore)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm">
            Worked from the same figures the take-home calculator uses, assuming the same pay every week. Your payslip
            can differ a little because of rounding and how often you are paid.
          </p>
        </section>

        <section>
          <h2 className={h2}>Who pays it</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>Weekly pay of €352 or less: no employee PRSI. That did not change.</li>
            <li>
              Weekly pay from €352.01 to €424: the {pct(sixty.after)} rate applies but a small PRSI credit (up to €12 a
              week) reduces it.
            </li>
            <li>Weekly pay over €424: {pct(sixty.after)} on all of your pay.</li>
          </ul>
        </section>

        <section>
          <h2 className={h2}>Check your own pay</h2>
          <p className="mt-3">
            The{' '}
            <Link href="/" className={link}>
              take-home pay calculator
            </Link>{' '}
            works out PRSI for the whole year with 9 months at {pct(sixty.before)} and 3 months at {pct(sixty.after)}, and
            shows your take-home per year, month and week.
          </p>
        </section>

        <TaxDisclaimer />

        <section>
          <h2 className={h2}>Source (checked 7 Oct 2026)</h2>
          <p className="mt-3 text-sm">
            Department of Social Protection,{' '}
            <a href={DSP_CLASS_A} className={link} target="_blank" rel="noopener noreferrer">
              PRSI Class A rates
            </a>
            : “Class A from 1 October 2026 … €424.01 - €552 | AL | All | 4.35”.
          </p>
        </section>
      </div>
    </main>
  );
}

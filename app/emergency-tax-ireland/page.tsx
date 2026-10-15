import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { TaxDisclaimer } from '@/components/TaxDisclaimer';
import { TrustStrip } from '@/components/TrustStrip';
import { RelatedCalculators } from '@/components/RelatedCalculators';
import { pageMeta } from '@/lib/pageMeta';

export const metadata = pageMeta({
  title: 'Emergency tax in Ireland: why it happens and how to fix it | MyIrishTax',
  description:
    'On emergency tax? Why your first payslip took 40% tax and 8% USC, how to get off it in Revenue myAccount, and how the overpaid tax comes back. Worked example from Revenue. Estimate only; not financial or tax advice.',
  path: '/emergency-tax-ireland',
});

const R_OVERVIEW = 'https://www.revenue.ie/en/jobs-and-pensions/emergency-tax/index.aspx';
const R_RULES = 'https://www.revenue.ie/en/jobs-and-pensions/emergency-tax/emergency-tax-rules.aspx';
const R_STOP = 'https://www.revenue.ie/en/jobs-and-pensions/emergency-tax/getting-off-emergency-tax.aspx';
const R_REFUND = 'https://www.revenue.ie/en/jobs-and-pensions/emergency-tax/get-refund-emergency-tax.aspx';
const R_CHARTS = 'https://www.revenue.ie/en/personal-tax-credits-reliefs-and-exemptions/tax-relief-charts/index.aspx';

const h2 = 'text-xl font-semibold text-ink';
const link = 'text-ink underline decoration-line underline-offset-2 hover:text-brand-700';

// Normal (non-emergency) basis for the same €900 a week, single, 2026: 20% up to €44,000 / 52,
// less the personal and employee credits (€2,000 + €2,000 a year) spread weekly. Our estimate, not Revenue's.
const WEEKLY_PAY = 900;
const NORMAL_TAX = Math.max(0, Math.min(WEEKLY_PAY, 44000 / 52) * 0.2 + Math.max(0, WEEKLY_PAY - 44000 / 52) * 0.4 - 4000 / 52);
const EMERGENCY_WEEK_1_4 = 190.77; // Revenue Example 2
const EMERGENCY_WEEK_5 = 360.0; // Revenue Example 2
const eur = (n: number) => `€${n.toLocaleString('en-IE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function EmergencyTaxPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
      <PageHeader title="Emergency tax in Ireland: why it happens and how to fix it">
        <TrustStrip kind="guide" sources={[{ label: 'Revenue', href: R_OVERVIEW }]} />
        <p>
          If your first payslip in a new job took far more tax than you expected, you are probably on emergency tax.
          It usually stops once your employer gets a Revenue Payroll Notification (RPN) for you, and the extra tax is
          normally refunded through your pay.
        </p>
      </PageHeader>

      <div className="space-y-10 text-base leading-relaxed text-ink-muted">
        <section>
          <h2 className={h2}>Why it happens</h2>
          <p className="mt-3">
            Your employer uses emergency tax when it cannot get an RPN for you. Revenue says that to avoid it, your
            employer must have your PPSN and your job must be registered with Revenue. If it&apos;s your first job in
            Ireland, you register it yourself in myAccount, under &quot;PAYE Services&quot;, &quot;Add Job or Pension
            Details&quot;.
          </p>
        </section>

        <section>
          <h2 className={h2}>How much it takes</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>No PPSN given to your employer: all your pay is taxed at 40%.</li>
            <li>
              PPSN given but job not registered: for the first four weeks you get the single person&apos;s 20% band for
              the week, with 40% on the rest. From week 5, all your pay is taxed at 40%.
            </li>
            <li>No tax credits are given while you are on emergency tax.</li>
            <li>USC is a flat 8% on all your pay (2026).</li>
          </ul>
        </section>

        <section>
          <h2 className={h2}>Worked example: €900 a week</h2>
          <p className="mt-3">
            This is Revenue&apos;s own example: John starts his first job in Ireland on €900 a week, has given his
            PPSN, but hasn&apos;t registered the job.
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-ink">
                  <th className="py-2 pr-4 font-semibold">Income tax a week</th>
                  <th className="py-2 pr-4 font-semibold">Weeks 1 to 4</th>
                  <th className="py-2 font-semibold">Week 5 onwards</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-line">
                  <td className="py-2 pr-4">Emergency tax (Revenue)</td>
                  <td className="py-2 pr-4">{eur(EMERGENCY_WEEK_1_4)}</td>
                  <td className="py-2">{eur(EMERGENCY_WEEK_5)}</td>
                </tr>
                <tr className="border-b border-line">
                  <td className="py-2 pr-4">Normal basis, single (our estimate)</td>
                  <td className="py-2 pr-4">{eur(NORMAL_TAX)}</td>
                  <td className="py-2">{eur(NORMAL_TAX)}</td>
                </tr>
                <tr className="font-medium text-ink">
                  <td className="py-2 pr-4">Extra taken each week</td>
                  <td className="py-2 pr-4">{eur(EMERGENCY_WEEK_1_4 - NORMAL_TAX)}</td>
                  <td className="py-2">{eur(EMERGENCY_WEEK_5 - NORMAL_TAX)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm">
            Normal basis: 20% on the weekly share of the €44,000 single band, less the personal and employee tax
            credits (€2,000 each a year in 2026) spread weekly. USC and PRSI are not included. Your own figures depend on
            your credits.{' '}
            <Link href="/" className={link}>
              Work out your normal take-home pay
            </Link>
            .
          </p>
        </section>

        <section>
          <h2 className={h2}>How to get off emergency tax</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5">
            <li>Give your employer your PPSN. If you don&apos;t have one, ask the Department of Social Protection.</li>
            <li>
              Register for Revenue myAccount. For a first job in Ireland, add the job under &quot;PAYE Services&quot;
              with your PPSN, your employer&apos;s tax registration number and your start date.
            </li>
            <li>
              For a second job, give the new employer your PPSN and split your tax credits and rate band between the
              jobs in myAccount.
            </li>
            <li>Your employer then gets an RPN and stops emergency tax.</li>
          </ol>
        </section>

        <section>
          <h2 className={h2}>Getting the extra tax back</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              Once your employer has a cumulative RPN, it works out the right tax since January and refunds any overpaid
              income tax and USC on your next pay day.
            </li>
            <li>
              On a Week 1 (non-cumulative) RPN, your employer can&apos;t refund it yet. You can ask Revenue why through
              MyEnquiries in myAccount.
            </li>
            <li>
              For an earlier year, file an Income Tax Return for that year in myAccount (&quot;Review your tax for the
              previous 4 years&quot;). It&apos;s free.
            </li>
          </ul>
          <p className="mt-3">
            Got a second job too? See{' '}
            <Link href="/second-income-form-12" className={link}>
              Second income: do I need a Form 12?
            </Link>
          </p>
        </section>

        <TaxDisclaimer />

        <section>
          <h2 className={h2}>Sources (checked 15 Oct 2026)</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm">
            <li>
              <a href={R_OVERVIEW} className={link} target="_blank" rel="noopener noreferrer">
                Revenue: Emergency Tax overview
              </a>{' '}
              &quot;your employer must have your Personal Public Service Number (PPSN) and your job must be registered
              with Revenue&quot;
            </li>
            <li>
              <a href={R_RULES} className={link} target="_blank" rel="noopener noreferrer">
                Revenue: Emergency Tax rules
              </a>{' '}
              (Example 2: €190.77 a week for weeks 1 to 4, €360.00 from week 5; &quot;The emergency rate of USC is a
              flat percentage rate (8% in 2026)&quot;)
            </li>
            <li>
              <a href={R_STOP} className={link} target="_blank" rel="noopener noreferrer">
                Revenue: How to stop paying Emergency Tax
              </a>
            </li>
            <li>
              <a href={R_REFUND} className={link} target="_blank" rel="noopener noreferrer">
                Revenue: How to get a refund of Emergency Tax
              </a>
            </li>
            <li>
              <a href={R_CHARTS} className={link} target="_blank" rel="noopener noreferrer">
                Revenue: Tax rates, bands and reliefs
              </a>{' '}
              (2026 single band €44,000; personal and employee credits €2,000 each)
            </li>
          </ul>
        </section>
      </div>

      <RelatedCalculators current="emergency-tax" />
    </main>
  );
}

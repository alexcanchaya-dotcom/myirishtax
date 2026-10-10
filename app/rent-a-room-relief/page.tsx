import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { TaxDisclaimer } from '@/components/TaxDisclaimer';
import { TrustStrip } from '@/components/TrustStrip';
import { RentARoomClient } from './RentARoomClient';
import { pageMeta } from '@/lib/pageMeta';

export const metadata = pageMeta({
  title: 'Rent-a-Room Relief checker: is your lodger income tax-free? | MyIrishTax',
  description:
    'Check whether income from letting a room in your home is tax-free under Rent-a-Room Relief: the €14,000 limit, what counts, who is excluded and how to claim. Estimate only; not financial or tax advice.',
  path: '/rent-a-room-relief',
});

const h2 = 'text-xl font-semibold text-ink';
const list = 'mt-3 list-disc space-y-2 pl-5';
const link = 'text-ink underline decoration-line underline-offset-2 hover:text-brand-700';
const OVERVIEW = 'https://www.revenue.ie/en/personal-tax-credits-reliefs-and-exemptions/land-and-property/rent-a-room-relief/index.aspx';
const CONDITIONS =
  'https://www.revenue.ie/en/personal-tax-credits-reliefs-and-exemptions/land-and-property/rent-a-room-relief/qualifying-conditions.aspx';
const HOW_TO_CLAIM =
  'https://www.revenue.ie/en/personal-tax-credits-reliefs-and-exemptions/land-and-property/rent-a-room-relief/how-is-relief-applied.aspx';

export default function RentARoomReliefPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <PageHeader title="Rent-a-Room Relief checker">
        <TrustStrip sources={[{ label: 'Revenue', href: CONDITIONS }]} />
        <TaxDisclaimer />
      </PageHeader>

      <RentARoomClient />

      <div className="mx-auto mt-12 max-w-2xl space-y-10 text-base leading-relaxed text-ink-muted">
        <section>
          <h2 className={h2}>How it works</h2>
          <ul className={list}>
            <li>
              If you let a room in your home and the gross income is <strong className="text-ink">€14,000 or less</strong> in
              the year, you pay no income tax, USC or PRSI on it.
            </li>
            <li>The limit is on gross income, before expenses, and includes charges for meals, laundry and the like.</li>
            <li>Go over the limit and the whole amount is taxed, not just the part over.</li>
            <li>It doesn&apos;t cover your child, your employer or short-term guests (lets of 28 days or less), but students, digs and respite care can qualify.</li>
            <li>If you are married or in a civil partnership and taxed jointly, you share one limit.</li>
            <li>If you claim the relief you can&apos;t deduct expenses for the room.</li>
          </ul>
        </section>

        <section>
          <h2 className={h2}>How to claim</h2>
          <p className="mt-3">
            You still declare the income. PAYE workers do it on the PAYE Income Tax Return in myAccount: PAYE Services →
            &apos;Review your tax for the previous 4 years&apos; → Request → Tax credits &amp; reliefs → You and your family
            → Rent-a-Room Relief. Self-employed people use Form 11 on ROS. You can claim back up to 4 years. See also{' '}
            <Link href="/second-income-form-12" className={link}>
              Second income / Form 12
            </Link>
            .
          </p>
        </section>

        <section>
          <h2 className={h2}>Budget 2027</h2>
          <p className="mt-3">
            Budget 2027 raises the limit from €14,000 to €16,000 from 1 January 2027 (Department of Finance, Budget
            2027 Tax Policy Changes, section 3.2). Pick 2027 above to check against it. It becomes law with the Finance
            Bill later this year.
          </p>
        </section>

        <section>
          <h2 className={h2}>Sources</h2>
          <ul className={list}>
            <li>
              <a href={CONDITIONS} className={link} target="_blank" rel="noopener noreferrer">
                Revenue: What conditions must be met?
              </a>{' '}
              &quot;The annual exemption limit for Rent-a-Room Relief is €14,000. This limit applies to the gross amount
              of income received for the room or rooms in your home, before you deduct expenses.&quot;
            </li>
            <li>
              <a href={OVERVIEW} className={link} target="_blank" rel="noopener noreferrer">
                Revenue: Rent-a-Room Relief
              </a>{' '}
              &quot;If it does, then you are taxed on the total amount.&quot;
            </li>
            <li>
              <a href={HOW_TO_CLAIM} className={link} target="_blank" rel="noopener noreferrer">
                Revenue: How is Rent-a-Room Relief claimed?
              </a>
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}

import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { TaxDisclaimer } from '@/components/TaxDisclaimer';
import { TrustStrip } from '@/components/TrustStrip';
import { RelatedCalculators } from '@/components/RelatedCalculators';
import { AffiliateRefundCTA } from '@/components/AffiliateRefundCTA';
import { pageMeta } from '@/lib/pageMeta';
import { refundYears } from '@/lib/refundYears';

export const metadata = pageMeta({
  title: 'PAYE refund check: claim tax back for the past 4 years | MyIrishTax',
  description:
    'PAYE workers can claim back overpaid income tax and USC for the previous 4 years in Revenue myAccount, for free. Which years you can still claim, how to do it, and what people often miss. Estimate only; not financial or tax advice.',
  path: '/paye-refund-check',
});

const R_PAYE_RETURN = 'https://www.revenue.ie/en/jobs-and-pensions/end-of-year-process/paye-income-tax-return.aspx';
const R_REVIEW =
  'https://www.revenue.ie/en/online-services/services/myaccount/help-guides/quick-steps-to-complete-an-online-review-of-your-taxes.aspx';

const h2 = 'text-xl font-semibold text-ink';
const list = 'mt-3 list-disc space-y-2 pl-5';
const link = 'text-ink underline decoration-line underline-offset-2 hover:text-brand-700';

export default function PayeRefundCheckPage() {
  const { first, last, expiring } = refundYears(new Date().getFullYear());
  return (
    <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
      <PageHeader title="PAYE refund check: the past 4 years">
        <TrustStrip kind="guide" sources={[{ label: 'Revenue', href: R_PAYE_RETURN }]} />
        <p>
          If you paid too much income tax or USC, you can claim it back from Revenue yourself, for free, for up to
          4 years. A return must be made within four years after the end of the tax year, so right now you can claim
          for {first} to {last}. {expiring} drops out at the end of this year.
        </p>
      </PageHeader>

      <div className="space-y-10 text-base leading-relaxed text-ink-muted">
        <section>
          <h2 className={h2}>How to check, step by step</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5">
            <li>Sign in to myAccount and complete the two-factor check.</li>
            <li>Under &quot;PAYE Services&quot;, click &quot;Review your tax for the previous 4 years&quot;.</li>
            <li>Select &quot;Request&quot; for a year and complete the PAYE Income Tax Return, adding any credits or reliefs you missed.</li>
            <li>Revenue sends your Statement of Liability for that year in about five working days. It shows if you are due a refund.</li>
          </ol>
        </section>

        <section>
          <h2 className={h2}>Things people often miss</h2>
          <ul className={list}>
            <li><Link href="/rent-tax-credit" className={link}>Rent tax credit</Link> for past years, if you rented privately.</li>
            <li>Emergency tax in a job you started or left. See <Link href="/emergency-tax-ireland" className={link}>emergency tax</Link>.</li>
            <li>A second job or extra income where credits weren&apos;t split. See <Link href="/second-income-form-12" className={link}>second income and Form 12</Link>.</li>
            <li>A year you left Ireland part way through. See <Link href="/tax-back-leaving-ireland" className={link}>tax back when leaving Ireland</Link>.</li>
          </ul>
          <p className="mt-3">
            The same return can also show you underpaid, in which case Revenue collects it. Check your figures before you
            submit. To see your normal take-home pay for this year, use the{' '}
            <Link href="/" className={link}>take-home pay calculator</Link>.
          </p>
        </section>

        <AffiliateRefundCTA page="paye-refund-check" />

        <TaxDisclaimer />

        <section>
          <h2 className={h2}>Sources (checked 23 Oct 2026)</h2>
          <ul className={`${list} text-sm`}>
            <li>
              <a href={R_PAYE_RETURN} className={link} target="_blank" rel="noopener noreferrer">Revenue: PAYE Income Tax Return</a>{' '}
              &quot;Income Tax Return submissions must be made within four years after the end of the tax year to which the
              return relates.&quot; It is used to &quot;claim refunds of any Income Tax or Universal Social Charge (USC) overpaid&quot;.
            </li>
            <li>
              <a href={R_REVIEW} className={link} target="_blank" rel="noopener noreferrer">Revenue: Reviewing your taxes in myAccount</a>
            </li>
          </ul>
        </section>
      </div>

      <RelatedCalculators current="paye-refund-check" />
    </main>
  );
}

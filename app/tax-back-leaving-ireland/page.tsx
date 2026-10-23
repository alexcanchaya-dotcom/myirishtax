import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { TaxDisclaimer } from '@/components/TaxDisclaimer';
import { TrustStrip } from '@/components/TrustStrip';
import { RelatedCalculators } from '@/components/RelatedCalculators';
import { AffiliateRefundCTA } from '@/components/AffiliateRefundCTA';
import { pageMeta } from '@/lib/pageMeta';

export const metadata = pageMeta({
  title: 'Tax back when leaving Ireland: how to claim your refund | MyIrishTax',
  description:
    'Leaving Ireland part way through the year? You may be due a tax refund. How to claim it in Revenue myAccount straight away, split-year treatment, and what to do before you go. Estimate only; not financial or tax advice.',
  path: '/tax-back-leaving-ireland',
});

const R_REFUND =
  'https://www.revenue.ie/en/life-events-and-personal-circumstances/moving-to-or-from-ireland/leaving-ireland/are-you-entitled-to-a-refund-of-tax.aspx';
const R_UNEMPLOYED =
  'https://www.revenue.ie/en/jobs-and-pensions/periods-of-unemployment/how-to-claim-a-tax-and-usc-refund-if-you-are-unemployed.aspx';
const R_SPLIT =
  'https://www.revenue.ie/en/life-events-and-personal-circumstances/moving-to-or-from-ireland/leaving-ireland/split-year-treatment-in-your-year-of-departure.aspx';
const R_LEAVING =
  'https://www.revenue.ie/en/life-events-and-personal-circumstances/moving-to-or-from-ireland/leaving-ireland/if-you-are-leaving-ireland-permanently.aspx';

const h2 = 'text-xl font-semibold text-ink';
const list = 'mt-3 list-disc space-y-2 pl-5';
const link = 'text-ink underline decoration-line underline-offset-2 hover:text-brand-700';

export default function TaxBackLeavingIrelandPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
      <PageHeader title="Tax back when leaving Ireland">
        <TrustStrip kind="guide" sources={[{ label: 'Revenue', href: R_REFUND }]} />
        <p>
          If you worked in Ireland for part of the year and then moved abroad, you may have paid too much tax. Your
          tax credits and rate band are spread across the whole year, so leaving early often means a refund. You can
          claim it yourself from Revenue, for free.
        </p>
      </PageHeader>

      <div className="space-y-10 text-base leading-relaxed text-ink-muted">
        <section>
          <h2 className={h2}>How to claim, step by step</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5">
            <li>Make sure your employer has ended your job with Revenue. If not, end it yourself in myAccount under &quot;PAYE Services&quot;, &quot;View/Cease your Job or Pension Details&quot;.</li>
            <li>Sign in to myAccount and, on the PAYE Services card, select &quot;Claim unemployment repayment&quot;.</li>
            <li>You don&apos;t have to wait: Revenue says you can claim immediately if you are leaving Ireland permanently.</li>
            <li>Update your address in myAccount (&quot;My Details&quot;, &quot;My address is not in the Republic of Ireland&quot;) so letters reach you.</li>
          </ol>
          <p className="mt-3">
            Not using myAccount? Send your Revenue office a Form P50, an Income Tax Return (Form 12 if you are on
            PAYE, Form 11 if self-employed), and a statement that you are going to live abroad permanently or won&apos;t
            be resident in Ireland for at least the following tax year.
          </p>
        </section>

        <section>
          <h2 className={h2}>Split-year treatment</h2>
          <p className="mt-3">
            If you are resident in Ireland in the year you leave and not resident the following year, you can claim
            split-year treatment on your employment income. Your pay up to the day you leave is taxed as normal, you
            generally keep a full year&apos;s tax credits, and pay you earn abroad after you leave is ignored for Irish
            tax. Apply through MyEnquiries in myAccount, or by filing an Income Tax Return.
          </p>
        </section>

        <section>
          <h2 className={h2}>Missed something in earlier years?</h2>
          <p className="mt-3">
            You can also claim back tax for the previous 4 years before you go, for example an unclaimed{' '}
            <Link href="/rent-tax-credit" className={link}>rent tax credit</Link>. See{' '}
            <Link href="/paye-refund-check" className={link}>PAYE refund check: the past 4 years</Link>. Were you on
            emergency tax in your last job? See{' '}
            <Link href="/emergency-tax-ireland" className={link}>emergency tax</Link>.
          </p>
        </section>

        <AffiliateRefundCTA page="leaving-ireland" />

        <TaxDisclaimer />

        <section>
          <h2 className={h2}>Sources (checked 23 Oct 2026)</h2>
          <ul className={`${list} text-sm`}>
            <li>
              <a href={R_REFUND} className={link} target="_blank" rel="noopener noreferrer">Revenue: Are you entitled to a refund of tax?</a>{' '}
              &quot;If you worked in Ireland for part of the year and you have now gone to live abroad, you may be due a refund of tax.&quot;
            </li>
            <li>
              <a href={R_UNEMPLOYED} className={link} target="_blank" rel="noopener noreferrer">Revenue: How to claim a tax and USC refund if you are unemployed</a>{' '}
              (a claim can be made &quot;immediately, if you are leaving Ireland permanently&quot;)
            </li>
            <li>
              <a href={R_SPLIT} className={link} target="_blank" rel="noopener noreferrer">Revenue: Split-year treatment in your year of departure</a>{' '}
              &quot;Generally, you will receive a full years&rsquo; tax credits in your year of departure.&quot;
            </li>
            <li>
              <a href={R_LEAVING} className={link} target="_blank" rel="noopener noreferrer">Revenue: If you are leaving Ireland</a>
            </li>
          </ul>
        </section>
      </div>

      <RelatedCalculators current="leaving-ireland" />
    </main>
  );
}

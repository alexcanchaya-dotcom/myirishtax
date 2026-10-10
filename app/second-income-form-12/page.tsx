import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { TaxDisclaimer } from '@/components/TaxDisclaimer';
import { TrustStrip } from '@/components/TrustStrip';
import { pageMeta } from '@/lib/pageMeta';

export const metadata = pageMeta({
  title: 'Second income in Ireland: do I need to file a Form 12 or Form 11? | MyIrishTax',
  description:
    'PAYE worker with rental, side-gig or share income? See when a Form 12 in myAccount is enough, when the €5,000 rule means Form 11, how to file, and the deadlines. Not advice.',
  path: '/second-income-form-12',
});

const h2 = 'text-xl font-semibold text-ink';
const list = 'mt-3 list-disc space-y-2 pl-5';
const steps = 'mt-3 list-decimal space-y-1 pl-5';
const link = 'text-ink underline decoration-line underline-offset-2 hover:text-brand-700';

const SOURCES = [
  {
    label:
      'Revenue – Do you need to submit a tax return? (why to file a PAYE return; Form 11 triggers; proprietary directors)',
    href: 'https://www.revenue.ie/en/jobs-and-pensions/end-of-year-process/need-to-submit-a-tax-return.aspx',
  },
  {
    label:
      'Revenue – Income Tax Return for the year 2025, Form 12 (chargeable person tests at €5,000 net / €30,000 gross; due 31 October 2026; Rent-a-Room panel; childcare income means Form 11)',
    href: 'https://www.revenue.ie/en/self-assessment-and-self-employment/documents/form12.pdf',
  },
  {
    label:
      'Revenue – Who should register for Income Tax self-assessment? (share options; coding; Form 12 online in myAccount)',
    href: 'https://www.revenue.ie/en/self-assessment-and-self-employment/guide-to-self-assessment/register-it-self-assessment.aspx',
  },
  {
    label: 'Revenue – Is your extra income taxable? (nixers, examples, myAccount steps)',
    href: 'https://www.revenue.ie/en/additional-incomes/is-your-extra-income-taxable/index.aspx',
  },
  {
    label: 'Revenue – How do you declare your rental income? (€5,000 rental rule, Airbnb)',
    href: 'https://www.revenue.ie/en/property/rental-income/irish-rental-income/how-do-you-declare-your-rental-income.aspx',
  },
  {
    label: 'Revenue – Rent-a-Room Relief (€14,000 limit, whole amount taxed if over)',
    href: 'https://www.revenue.ie/en/personal-tax-credits-reliefs-and-exemptions/land-and-property/rent-a-room-relief/index.aspx',
  },
  {
    label:
      'Revenue – Information reported in respect of sellers under DAC7/MRDP (platform reporting; tax on profit; personal items; handbag example)',
    href: 'https://www.revenue.ie/en/companies-and-charities/international-tax/aeoi/dac7/info-member-states.aspx',
  },
  {
    label:
      'Revenue – When and how do you pay and file CGT? (15 Dec / 31 Jan; return by 31 Oct; paper Form 12 or CG1, not eForm 12)',
    href: 'https://www.revenue.ie/en/gains-gifts-and-inheritance/transfering-an-asset/when-and-how-do-you-pay-and-file-cgt.aspx',
  },
  {
    label: 'Revenue – Filing your tax return (Form 11 2025 due 31 Oct 2026; ROS 18 Nov 2026)',
    href: 'https://www.revenue.ie/en/self-assessment-and-self-employment/filing-your-tax-return/index.aspx',
  },
  {
    label: 'Revenue – PAYE Income Tax Return (four-year limit; Statement of Liability in about five working days)',
    href: 'https://www.revenue.ie/en/jobs-and-pensions/end-of-year-process/paye-income-tax-return.aspx',
  },
  {
    label:
      'Revenue – Tax and Duty Manual Part 38-06-04, PAYE Services: Manage your Tax (declaring income in-year; coding)',
    href: 'https://www.revenue.ie/en/tax-professionals/tdm/income-tax-capital-gains-tax-corporation-tax/part-38/38-06-04.pdf',
  },
  {
    label: 'Revenue – Tax and Duty Manual Part 38-06-05, PAYE Services: Review your tax (other income via myEnquiries)',
    href: 'https://www.revenue.ie/en/tax-professionals/tdm/income-tax-capital-gains-tax-corporation-tax/part-38/38-06-05-20241118091819.pdf',
  },
  {
    label:
      'Citizens Information – Tax on income that is not from your employer (€5,000 / €30,000, coding in, Form 12 / 12S, Pay and File dates)',
    href: 'https://www.citizensinformation.ie/en/money-and-tax/tax/income-tax/tax-return-non-paye-income/',
  },
];

export default function SecondIncomeForm12Page() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
      <PageHeader title="Second income / Form 12: do I need to file?">
        <TrustStrip
          kind="guide"
          sources={[{ label: 'Revenue', href: 'https://www.revenue.ie/en/jobs-and-pensions/end-of-year-process/need-to-submit-a-tax-return.aspx' }]}
        />
        <TaxDisclaimer />
      </PageHeader>

      <div className="space-y-10 text-base leading-relaxed text-ink-muted">
        <section>
          <p className="text-ink">
            If you are a PAYE worker with any extra income, you must tell Revenue. You are a chargeable person and
            must file a Form 11 if your net assessable non-PAYE income is €5,000 or more, or if your total gross
            non-PAYE income is €30,000 or more. If your non-PAYE income is under those limits, you can usually
            declare it on a Form 12 through myAccount.
          </p>
        </section>

        <section>
          <h2 className={h2}>Who needs to file a Form 12?</h2>
          <p className="mt-3">
            The Form 12 is the Income Tax Return for PAYE workers, pensioners and non-proprietary directors.
            &quot;PAYE&quot; means your employer takes tax out of your pay.
          </p>
          <p className="mt-3">You complete one when you want to:</p>
          <ul className={list}>
            <li>declare extra income,</li>
            <li>claim extra tax credits, reliefs or expenses,</li>
            <li>get a refund of tax or USC you overpaid, or</li>
            <li>get a Statement of Liability (Revenue&apos;s end-of-year summary of your tax).</li>
          </ul>
        </section>

        <section>
          <h2 className={h2}>The €5,000 rule: Form 12 or Form 11?</h2>
          <p className="mt-3">
            &quot;Non-PAYE income&quot; means income that has no tax taken off at source by an employer. Examples:
            rent, side work, foreign income, some dividends.
          </p>
          <p className="mt-3 font-semibold text-ink">Form 12 is usually enough if your non-PAYE income is:</p>
          <ul className={list}>
            <li>under €5,000 net (after expenses, losses, capital allowances and other reliefs), and</li>
            <li>under €30,000 gross (before expenses), and</li>
            <li>&quot;coded in&quot; or fully taxed at source.</li>
          </ul>
          <p className="mt-3">
            &quot;Coded in&quot; means Revenue reduces your tax credits and rate band so the tax on your extra income
            comes out of your salary.
          </p>
          <p className="mt-3">
            You are a chargeable person and must file a Form 11 if your net assessable non-PAYE income is €5,000 or
            more, or if your total gross non-PAYE income is €30,000 or more.
          </p>
          <p className="mt-3">
            You also file a Form 11 if you are a proprietary director (you control the company), or if you get income
            from childcare services.
          </p>
          <p className="mt-3">
            A &quot;chargeable person&quot; is someone who must self-assess: you work out and pay your own tax, usually
            online through ROS (Revenue Online Service).
          </p>
        </section>

        <section>
          <h2 className={h2}>Common cases</h2>
          <div className="mt-3 space-y-4">
            <div>
              <p className="font-semibold text-ink">Renting out property.</p>
              <p>
                Net rental income under €5,000: declare it through your Income Tax Return in myAccount. Over €5,000:
                register for self-assessment and file a Form 11.
              </p>
            </div>
            <div>
              <p className="font-semibold text-ink">Renting a room in your home.</p>
              <p>
                Rent-a-Room Relief can make this income tax-free if it is €14,000 or less a year (
                <Link href="/rent-a-room-relief" className={link}>
                  check yours
                </Link>
                ). Go over and the whole
                amount is taxed, not just the excess. You still declare it, in the Rent-a-Room section of your return.
              </p>
            </div>
            <div>
              <p className="font-semibold text-ink">Airbnb.</p>
              <p>
                Net profit under €5,000 can go on your Form 12 under Non-PAYE income → Other income → Trading profit.
                Over €5,000, register and file a Form 11.
              </p>
            </div>
            <div>
              <p className="font-semibold text-ink">Side gigs and &quot;nixers&quot;.</p>
              <p>
                Revenue says nixers are after-hours or part-time work, like consulting, grinds or selling at a market.
                This income is taxable. Tax is on your profit, not your total takings. Selling your own unwanted items
                is unlikely to count as a trade. Online platforms now report seller details to Revenue each year.
              </p>
            </div>
            <div>
              <p className="font-semibold text-ink">Shares.</p>
              <ul className={list}>
                <li>Dividends go on your return.</li>
                <li>Profit on selling shares is Capital Gains Tax (CGT), a separate tax with its own dates.</li>
                <li>
                  For shares sold from 1 January to 30 November, pay CGT by 15 December that year. For shares sold in
                  December, pay by 31 January.
                </li>
                <li>File your CGT return by 31 October of the next year, even if no tax is due.</li>
                <li>
                  PAYE workers report CGT on the paper Form 12, or on Form CG1. You can&apos;t report CGT on the online
                  Form 12.
                </li>
                <li>
                  If you profited from share options or share incentives, Revenue lists this as a reason to register
                  for self-assessment.
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className={h2}>How to file a Form 12 in myAccount</h2>
          <p className="mt-3 font-semibold text-ink">For a past year:</p>
          <ol className={steps}>
            <li>Sign in to myAccount.</li>
            <li>Under &quot;PAYE Services&quot;, click &quot;Review your tax for the previous 4 years&quot;.</li>
            <li>Pick the year and request a Statement of Liability.</li>
            <li>Click &quot;Complete your Income Tax Return&quot;.</li>
            <li>In &quot;Non-PAYE income&quot;, add the income and the details.</li>
            <li>Click &quot;Next&quot;, then &quot;Sign and submit&quot;.</li>
          </ol>
          <p className="mt-3">Your Statement of Liability usually arrives in about five working days.</p>
          <p className="mt-3 font-semibold text-ink">For this year (2026):</p>
          <p className="mt-1">
            Go to &quot;PAYE Services&quot; → &quot;Manage your tax for the current year&quot; to declare extra income
            as it comes in. Revenue can then code it into your tax credits. Some income types can&apos;t be added
            there. For those, Revenue says to use myEnquiries.
          </p>
        </section>

        <section>
          <h2 className={h2}>Deadlines</h2>
          <ul className={list}>
            <li>
              <strong className="text-ink">Form 12 for 2025:</strong> by 31 October 2026.
            </li>
            <li>
              <strong className="text-ink">Form 11 for 2025:</strong> by 31 October 2026. If you pay and file through
              ROS, the deadline is 18 November 2026. Preliminary tax for 2026 is due at the same time.
            </li>
            <li>
              <strong className="text-ink">Refunds and extra credits:</strong> you have four years from the end of a
              tax year. So 2022 returns must be in by 31 December 2026.
            </li>
          </ul>
        </section>

        <section>
          <h2 className={h2}>FAQs</h2>
          <div className="mt-3 space-y-4">
            <div>
              <p className="font-semibold text-ink">My rental profit is €6,000. Can I use Form 12?</p>
              <p>No. Over €5,000 net, you must register for self-assessment and file a Form 11 through ROS.</p>
            </div>
            <div>
              <p className="font-semibold text-ink">I sold some old clothes online. Is that income?</p>
              <p>
                Selling personal items you no longer need is unlikely to be a trade. Revenue&apos;s example: a €500 bag
                sold for €400 made no profit, so there was nothing to declare.
              </p>
            </div>
            <div>
              <p className="font-semibold text-ink">I sold shares at a profit. Is Form 12 enough?</p>
              <p>
                You can report the gain on the paper Form 12 or Form CG1, not the online Form 12. Pay the CGT by the
                payment dates above.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className={h2}>Related pages</h2>
          <ul className={list}>
            <li>
              <Link href="/" className={link}>
                Irish take-home pay calculator
              </Link>{' '}
              – estimate your PAYE pay
            </li>
            <li>
              <Link href="/contractor-calculator" className={link}>
                Contractor calculator
              </Link>{' '}
              – estimate tax on self-employed income
            </li>
            <li>
              <Link href="/rent-tax-credit" className={link}>
                Rent tax credit
              </Link>{' '}
              – claimed on the same myAccount return
            </li>
            <li>
              <Link href="/small-benefit-exemption" className={link}>
                Small benefit exemption (2025–2029)
              </Link>
            </li>
          </ul>
        </section>

        <TaxDisclaimer />

        <section>
          <h2 className={h2}>Sources (checked Sun 4 Oct 2026)</h2>
          <ul className={`${list} text-sm`}>
            {SOURCES.map((s) => (
              <li key={s.href}>
                {s.label}:{' '}
                <a href={s.href} className={`${link} break-all`} rel="noopener noreferrer" target="_blank">
                  {s.href}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}

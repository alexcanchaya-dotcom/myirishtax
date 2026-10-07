import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { TaxDisclaimer } from '@/components/TaxDisclaimer';
import { TrustStrip } from '@/components/TrustStrip';

export const metadata = {
  title: 'Small benefit exemption (2025–2029): €1,500 and 5 vouchers explained | MyIrishTax',
  description:
    'How the Irish small benefit exemption works in 2026: up to 5 non-cash gifts or vouchers a year, worth up to €1,500 in total, tax-free. What counts and what happens if you go over. Not advice.',
  alternates: { canonical: '/small-benefit-exemption' },
};

const h2 = 'text-xl font-semibold text-ink';
const list = 'mt-3 list-disc space-y-2 pl-5';
const link = 'text-ink underline decoration-line underline-offset-2 hover:text-brand-700';

const SOURCES = [
  {
    label:
      'Revenue – Small Benefit Exemption (5 benefits, €1,500, non-cash, no carry-over, single benefit over €1,500 taxed in full, fees, reporting)',
    href: 'https://www.revenue.ie/en/employing-people/benefit-in-kind-for-employers/valuation-of-benefits/small-benefit-exemption.aspx',
  },
  {
    label:
      "Revenue – Tax and Duty Manual Part 05-01-01e (cumulative test, salary sacrifice, employer can't choose, IT/USC/PRSI via payroll, limits by year, runs to end of 2029, real-time reporting since 1 Jan 2024, examples incl. Joe, Mary, cash-machine gift card)",
    href: 'https://www.revenue.ie/en/tax-professionals/tdm/income-tax-capital-gains-tax-corporation-tax/part-05/05-01-01e.pdf',
  },
  {
    label: 'Revenue – Non-taxable employer benefits',
    href: 'https://www.revenue.ie/en/jobs-and-pensions/taxation-of-employer-benefits/non-taxable-employer-benefits.aspx',
  },
  {
    label:
      'Citizens Information – Taxation of benefits from employment (5 benefits up to €1,500 from 1 Jan 2025; 2 up to €1,000 for 2022–2024; cannot be exchanged for cash)',
    href: 'https://www.citizensinformation.ie/en/money-and-tax/tax/income-tax/taxation-of-benefits-from-employment/',
  },
];

export default function SmallBenefitExemptionPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
      <PageHeader title="Small benefit exemption (2025–2029)">
        <TrustStrip
          kind="guide"
          sources={[{ label: 'Revenue', href: 'https://www.revenue.ie/en/employing-people/benefit-in-kind-for-employers/valuation-of-benefits/small-benefit-exemption.aspx' }]}
        />
        <TaxDisclaimer />
      </PageHeader>

      <div className="space-y-10 text-base leading-relaxed text-ink-muted">
        <section>
          <p className="text-ink">
            In 2026 your employer can give you up to 5 non-cash gifts or vouchers a year, worth up to €1,500 in total,
            with no income tax, USC or PRSI. Vouchers must not be swappable for cash. Only the first 5 count. A gift
            that takes you over €1,500 is taxed in full through payroll.
          </p>
        </section>

        <section>
          <h2 className={h2}>What is the small benefit exemption?</h2>
          <p className="mt-3">
            It is a tax rule that lets an employer reward staff without the reward being taxed. Normally a voucher or
            gift from your employer is taxed like pay. Under this rule, qualifying gifts are tax-free for you.
          </p>
          <p className="mt-3">
            Revenue calls each gift a &quot;benefit&quot;. A benefit here means a voucher, or a physical item that is
            not cash.
          </p>
        </section>

        <section>
          <h2 className={h2}>The limits</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-ink">
                  <th className="py-2 pr-4 font-semibold">Years</th>
                  <th className="py-2 pr-4 font-semibold">Max benefits a year</th>
                  <th className="py-2 font-semibold">Total value limit</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-2 pr-4">1 Jan 2025 to 31 Dec 2029</td>
                  <td className="py-2 pr-4">5</td>
                  <td className="py-2">€1,500</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3">
            Budget 2027 (6 October 2026) did not change these limits: still up to 5 benefits worth up to €1,500 in total
            a year, to the end of 2029. The only related change is for employers. From 1 January 2027 they can report
            small benefits to Revenue (Enhanced Reporting Requirements) by the 14th of the following month, instead of
            on or before the day they give them. Source:{' '}
            <a
              href="https://assets.gov.ie/static/documents/c6792805/Budget_2027_-_Tax_Policy_Changes_-_Publication_Version.pdf"
              className="underline decoration-line underline-offset-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              Budget 2027 Tax Policy Changes, section 6.11
            </a>
            .
          </p>
          <p className="mt-3">
            The limit is per tax year (January to December). Any unused amount does not carry over to next year.
          </p>
        </section>

        <section>
          <h2 className={h2}>The rules, one by one</h2>
          <div className="mt-3 space-y-4">
            <div>
              <p className="font-semibold text-ink">1. Up to 5 benefits a year.</p>
              <p>Only the first 5 benefits in a tax year can be tax-free. A sixth is taxed, even if you are still under €1,500.</p>
            </div>
            <div>
              <p className="font-semibold text-ink">2. €1,500 in total.</p>
              <p>The first 5 benefits added together cannot be more than €1,500. One single benefit of up to €1,500 is fine.</p>
            </div>
            <div>
              <p className="font-semibold text-ink">3. Not cash.</p>
              <p>
                A voucher must only buy goods or services. If it can be turned into cash, even in part, it does not
                qualify. This applies even if you never take cash out. For example, a gift card that works in a cash
                machine does not qualify.
              </p>
            </div>
            <div>
              <p className="font-semibold text-ink">4. Not instead of salary.</p>
              <p>
                It cannot be part of a &quot;salary sacrifice&quot;, where you give up some pay and get a voucher
                instead. That voucher is taxed.
              </p>
            </div>
            <div>
              <p className="font-semibold text-ink">5. The employer can&apos;t pick and choose.</p>
              <p>
                The first 5 benefits are the ones that count. An employer cannot choose to tax an early small gift to
                save the exemption for a bigger one later.
              </p>
            </div>
            <div>
              <p className="font-semibold text-ink">6. Small fees don&apos;t count.</p>
              <p>
                Minor fees or postage paid by your employer to buy the voucher are not added to its value for the
                €1,500 test.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className={h2}>What happens if the limit is exceeded?</h2>
          <ul className={list}>
            <li>
              <strong className="text-ink">One benefit worth more than €1,500:</strong> the full value is taxed, not
              just the part above €1,500.
            </li>
            <li>
              <strong className="text-ink">A benefit that takes the running total over €1,500:</strong> that benefit
              does not qualify and is taxed in full.
            </li>
            <li>
              <strong className="text-ink">A sixth (or later) benefit:</strong> it does not qualify and is taxed.
            </li>
          </ul>
          <p className="mt-3">
            &quot;Taxed&quot; here means your employer runs income tax, USC and PRSI on it through payroll. You see it
            on your payslip. Where the rules aren&apos;t met, the small fees above are also counted in the taxed value.
          </p>
        </section>

        <section>
          <h2 className={h2}>Two examples from Revenue</h2>
          <p className="mt-3">
            <strong className="text-ink">Joe, 2025:</strong> a €250 voucher, a €75 Easter egg, a €400 holiday voucher,
            a €600 voucher, and a €150 team meal. That is 5 benefits, €1,475 in total. All 5 are tax-free.
          </p>
          <p className="mt-3">
            <strong className="text-ink">Mary, 2025:</strong> six vouchers of €200 each. The first 5 (€1,000) are
            tax-free. The sixth is taxed, because only 5 benefits a year can qualify.
          </p>
        </section>

        <section>
          <h2 className={h2}>Does my employer have to tell Revenue?</h2>
          <p className="mt-3">
            Yes. Since 1 January 2024, employers must report the date and value of each tax-free small benefit to
            Revenue, on or before the day they give it. This is part of Revenue&apos;s &quot;enhanced reporting
            requirements&quot;.
          </p>
          <p className="mt-3">For a benefit that meets all the rules, no tax is due when you receive it.</p>
        </section>

        <section>
          <h2 className={h2}>FAQs</h2>
          <div className="mt-3 space-y-4">
            <div>
              <p className="font-semibold text-ink">Is the small benefit exemption €1,500 in 2026?</p>
              <p>Yes. Up to 5 benefits, worth up to €1,500 in total.</p>
            </div>
            <div>
              <p className="font-semibold text-ink">Can my employer give me €1,500 in cash tax-free?</p>
              <p>No. Cash, or a voucher that can be turned into cash, does not qualify.</p>
            </div>
            <div>
              <p className="font-semibold text-ink">I got 3 vouchers worth €600 each. Are they all tax-free?</p>
              <p>
                No. The first two total €1,200, which is under €1,500. The third takes the total to €1,800, so the
                third is taxed in full.
              </p>
            </div>
            <div>
              <p className="font-semibold text-ink">Does a Christmas party or team meal count?</p>
              <p>It can. In Revenue&apos;s example, a €150 team meal was counted as one of Joe&apos;s 5 benefits.</p>
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
              – see how a taxed bonus changes your pay (estimate)
            </li>
            <li>
              <Link href="/second-income-form-12" className={link}>
                Second income / Form 12: do I need to file?
              </Link>
            </li>
            <li>
              <Link href="/rent-tax-credit" className={link}>
                Rent tax credit
              </Link>
            </li>
            <li>
              <Link href="/auto-enrolment-calculator" className={link}>
                Auto-enrolment pension calculator
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

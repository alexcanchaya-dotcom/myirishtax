import Link from 'next/link';
import { TaxDisclaimer } from '@/components/TaxDisclaimer';

const h3 = 'mt-8 text-lg font-semibold text-ink';
const list = 'mt-3 list-disc space-y-1 pl-5';
const link = 'text-ink underline decoration-line underline-offset-2 hover:text-brand-700';

const SOURCES = [
  {
    label: 'Revenue – Lump sum payments (overview, PILON, contract lump sums)',
    href: 'https://www.revenue.ie/en/personal-tax-credits-reliefs-and-exemptions/lump-sum-payments/index.aspx',
  },
  {
    label: 'Revenue – Basic exemption (€10,160 + €765, career breaks, €200,000 lifetime limit, John example)',
    href: 'https://www.revenue.ie/en/personal-tax-credits-reliefs-and-exemptions/lump-sum-payments/basic-exemption.aspx',
  },
  {
    label: 'Revenue – Increased exemption (€10,000, 10-year rule, pension lump sum offset)',
    href: 'https://www.revenue.ie/en/personal-tax-credits-reliefs-and-exemptions/lump-sum-payments/increased-exemption.aspx',
  },
  {
    label: 'Revenue – Standard Capital Superannuation Benefit (formula, Eileen example)',
    href: 'https://www.revenue.ie/en/personal-tax-credits-reliefs-and-exemptions/lump-sum-payments/standard-capital-superannuation-benefit.aspx',
  },
  {
    label: 'Revenue – Other tax-exempt termination payments (statutory redundancy exempt)',
    href: 'https://www.revenue.ie/en/personal-tax-credits-reliefs-and-exemptions/lump-sum-payments/tax-exempt.aspx',
  },
  {
    label:
      'Revenue – Tax and Duty Manual Part 05-05-19 (statutory redundancy exempt from IT, USC and PRSI; para 3.8 lifetime cap of €200,000 across basic, increased and SCSB; taxable excess liable to IT and USC)',
    href: 'https://www.revenue.ie/en/tax-professionals/tdm/income-tax-capital-gains-tax-corporation-tax/part-05/05-05-19.pdf',
  },
  {
    label:
      "Citizens Information – How much redundancy pay will I get? (2 weeks per year + 1 week, €600 weekly cap, 104 weeks' service)",
    href: 'https://www.citizensinformation.ie/en/employment/unemployment-and-redundancy/redundancy/redundancy-payments/',
  },
  {
    label:
      'Citizens Information – Taxation of lump sum payments (taxable part not subject to PRSI but USC may apply; claim via myEnquiries; declare on return)',
    href: 'https://www.citizensinformation.ie/en/employment/retirement/income-tax-in-retirement/retirement-lump-sum-taxation/',
  },
];

export function TaxFreeSection() {
  return (
    <section id="tax-free" className="card text-base leading-relaxed text-ink">
      <h2 className="font-serif text-2xl font-semibold tracking-tight text-ink">How much of my redundancy is tax-free?</h2>
      <p className="mt-3">
        Statutory redundancy is fully tax-free. On top of that, part of any extra payment from your employer can be
        tax-free too. The tax-free amount is the highest of three options: the basic exemption, the increased
        exemption, or SCSB. There is a lifetime cap of €200,000.
      </p>

      <h3 className={h3}>Statutory redundancy: always tax-free</h3>
      <p className="mt-3">Statutory redundancy is the legal minimum. You get it after 2 years (104 weeks) in the job.</p>
      <ul className={list}>
        <li>It is 2 weeks&apos; pay for every year of service, plus 1 extra week.</li>
        <li>The weekly pay used is capped at €600 a week (€31,200 a year).</li>
        <li>It is free of income tax, USC and PRSI.</li>
        <li>It does not use up any of the other exemptions below.</li>
      </ul>

      <h3 className={h3}>Extra payments: three ways to be tax-free</h3>
      <p className="mt-3">
        Many employers pay more than the statutory amount. This extra is called an &quot;ex-gratia&quot; payment (a
        voluntary payment on top of what the law requires). Part of it can be tax-free. You get whichever of these
        three gives the biggest number.
      </p>

      <p className="mt-5 font-semibold">1. Basic exemption</p>
      <p className="mt-1">€10,160, plus €765 for each full year you worked for that employer.</p>
      <p className="mt-1">Example from Revenue: 20 full years gives €10,160 + (€765 × 20) = €25,460 tax-free.</p>
      <p className="mt-1">Part-time and job-share years count as full years. A career break does not count.</p>

      <p className="mt-5 font-semibold">2. Increased exemption</p>
      <p className="mt-1">Up to €10,000 more on top of the basic exemption. You can get it if:</p>
      <ul className={list}>
        <li>you have not had more than the basic exemption tax-free in the last 10 years, and</li>
        <li>you are not in a work pension scheme, or you give up the right to a tax-free lump sum from it.</li>
      </ul>
      <p className="mt-3">
        If your work pension will pay you a tax-free lump sum, that lump sum is taken off the €10,000. If the pension
        lump sum is more than €10,000, you get no increase. You can only get the increased exemption once in any
        10-year period.
      </p>

      <p className="mt-5 font-semibold">3. SCSB (Standard Capital Superannuation Benefit)</p>
      <p className="mt-1">SCSB is a formula that tends to help people with high pay and long service.</p>
      <ul className={list}>
        <li>Take your average yearly pay over your last 36 months.</li>
        <li>Divide by 15.</li>
        <li>Multiply by your full years of service.</li>
        <li>Take away any tax-free lump sum you got, or will get, from your work pension.</li>
      </ul>
      <p className="mt-3">
        Example from Revenue: 18 years&apos; service, €95,000 total pay over the last 3 years, and an €11,000 pension
        lump sum. SCSB = €27,000. That beats her basic exemption of €23,930, so €27,000 of her €60,000 payment is
        tax-free and €33,000 is taxed.
      </p>

      <h3 className={h3}>The lifetime cap</h3>
      <p className="mt-3">
        There is a lifetime cap of €200,000 on the basic exemption, the increased exemption and SCSB added together.
        It counts relief you got on earlier redundancy payments too, from any employer.
      </p>

      <h3 className={h3}>What is taxed, and how</h3>
      <ul className={list}>
        <li>The part above your tax-free amount is added to your income for that year.</li>
        <li>It is taxed through income tax and USC. It is not charged PRSI.</li>
        <li>Pay in lieu of notice that is in your contract is taxed as normal pay. The exemptions do not apply to it.</li>
        <li>Any lump sum you are entitled to under your contract is taxed in full.</li>
      </ul>
      <p className="mt-3">
        If too much tax was taken, you can claim the exemption through myEnquiries in Revenue myAccount. You also need
        to declare the lump sum on your tax return for that year.
      </p>
      <p className="mt-3">
        Our calculator above gives an estimate. Your employer&apos;s payroll and Revenue make the final figure.
      </p>

      <h3 className={h3}>FAQs</h3>
      <div className="mt-3 space-y-4">
        <div>
          <p className="font-semibold">Is statutory redundancy taxed in Ireland?</p>
          <p>No. Statutory redundancy is free of income tax, USC and PRSI.</p>
        </div>
        <div>
          <p className="font-semibold">Can I get the basic exemption more than once?</p>
          <p>
            Yes, if the payments come from different employers that are not connected, and you stay under the
            €200,000 lifetime cap.
          </p>
        </div>
        <div>
          <p className="font-semibold">Does my pension lump sum reduce my tax-free redundancy?</p>
          <p>
            It can. A tax-free pension lump sum is taken off the increased exemption and off SCSB. It does not reduce
            the basic exemption.
          </p>
        </div>
        <div>
          <p className="font-semibold">Is pay in lieu of notice tax-free?</p>
          <p>Not if your contract provides for it. Then it is taxed as normal pay.</p>
        </div>
      </div>

      <h3 className={h3}>Related pages</h3>
      <ul className={list}>
        <li>
          <Link href="/" className={link}>
            Irish take-home pay calculator
          </Link>{' '}
          – see your pay after tax, USC and PRSI
        </li>
        <li>
          <Link href="/auto-enrolment-calculator" className={link}>
            Auto-enrolment pension calculator
          </Link>
        </li>
        <li>
          <Link href="/rent-tax-credit" className={link}>
            Rent tax credit
          </Link>
        </li>
        <li>
          <Link href="/contractor-calculator" className={link}>
            Contractor calculator
          </Link>{' '}
          – if you plan to go self-employed after redundancy
        </li>
      </ul>

      <div className="mt-8">
        <TaxDisclaimer />
        <p className="mt-1 text-sm">
          <Link href="/disclaimer" className={link}>
            Disclaimer
          </Link>
        </p>
      </div>

      <h3 className={h3}>Sources (checked Sun 4 Oct 2026)</h3>
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
  );
}

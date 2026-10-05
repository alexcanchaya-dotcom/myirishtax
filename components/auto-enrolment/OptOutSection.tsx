import Link from 'next/link';
import { TaxDisclaimer } from '@/components/TaxDisclaimer';

const h3 = 'mt-8 text-lg font-semibold text-ink';
const list = 'mt-3 list-disc space-y-1 pl-5';
const link = 'text-ink underline decoration-line underline-offset-2 hover:text-brand-700';

const RATES = [
  { year: 'Years 1 to 3', you: '1.5%', employer: '1.5%', state: '0.5%' },
  { year: 'Years 4 to 6', you: '3%', employer: '3%', state: '1%' },
  { year: 'Years 7 to 9', you: '4.5%', employer: '4.5%', state: '1.5%' },
  { year: 'Year 10 on', you: '6%', employer: '6%', state: '2%' },
];

const SOURCES = [
  {
    label:
      'gov.ie (Department of Social Protection) – Auto-enrolment retirement savings system for employees (eligibility, rates by year, €80,000, opt-out windows, refunds, suspension, re-enrolment, retirement at 66, pot value not promised by the State, other pensions)',
    href: 'https://www.gov.ie/en/department-of-social-protection/publications/auto-enrolment-retirement-savings-system-for-employees/',
  },
  {
    label:
      'gov.ie (Department of Social Protection) – Auto-enrolment: Your questions answered (start date 1 Jan 2026, €80,000 calendar-year rule, staying in below €20,000, no penalties for opting out, fees, tax treatment being legislated, excluded schemes)',
    href: 'https://www.gov.ie/en/department-of-social-protection/publications/auto-enrolment-your-questions-answered/',
  },
  {
    label:
      'Citizens Information – Auto-enrolment pension – MyFutureFund (opt-out via portal or paper form, 48-hour cancel, July/August example, 12-month wait after suspending, opt-in age 18 to 66, tax relief comparison)',
    href: 'https://www.citizensinformation.ie/en/money-and-tax/personal-finance/pensions/auto-enrolment/',
  },
  {
    label: 'MyFutureFund – Participant guide (scheme-year contribution examples; tax treatment legislated like a PRSA, including up to 25% tax-free lump sum)',
    href: 'https://myfuturefund.ie/participant-guide',
  },
];

export function OptOutSection() {
  return (
    <section id="opt-out" className="card text-base leading-relaxed text-ink">
      <h2 className="font-serif text-2xl font-semibold tracking-tight text-ink">
        Should I opt out of auto-enrolment? Things to weigh
      </h2>
      <p className="mt-3">
        You can opt out only in months 7 and 8 after you are enrolled. If you do, you get back what you paid in. Your
        employer&apos;s and the State&apos;s money stays in your pot until age 66. If you are still eligible, you are
        put back in after 2 years. Whether to stay in depends on your own situation. Below are the facts to weigh.
      </p>

      <h3 className={h3}>How auto-enrolment works</h3>
      <p className="mt-3">
        Auto-enrolment started on 1 January 2026. The scheme is called MyFutureFund. You are enrolled automatically if
        you:
      </p>
      <ul className={list}>
        <li>are an employee aged 23 to 60,</li>
        <li>earn €20,000 or more a year across all your jobs, and</li>
        <li>do not pay into a pension through payroll in that job.</li>
      </ul>
      <p className="mt-3">For every €3 you pay in, your employer pays €3 and the State adds €1.</p>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line">
              <th className="py-2 pr-4 font-semibold">Scheme year</th>
              <th className="py-2 pr-4 font-semibold">You pay</th>
              <th className="py-2 pr-4 font-semibold">Employer pays</th>
              <th className="py-2 font-semibold">State pays</th>
            </tr>
          </thead>
          <tbody>
            {RATES.map((r) => (
              <tr key={r.year} className="border-b border-line last:border-0">
                <td className="py-2 pr-4">{r.year}</td>
                <td className="py-2 pr-4">{r.you}</td>
                <td className="py-2 pr-4">{r.employer}</td>
                <td className="py-2">{r.state}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3">
        Contributions are a % of your gross pay. They are not charged on pay above €80,000 in a calendar year. You
        cannot pay more or less than the set rate.
      </p>
      <p className="mt-3">Scheme years map to calendar years like this:</p>
      <ul className={list}>
        <li>
          Years 1–3: 2026, 2027 and 2028 — you and your employer each pay 1.5%, the State adds 0.5%.
        </li>
        <li>Years 4–6: 2029, 2030 and 2031 — 3% each, State 1%.</li>
        <li>Years 7–9: 2032–2034 — 4.5% each, State 1.5%.</li>
        <li>Year 10 onwards: from 2035 — 6% each, State 2%.</li>
      </ul>

      <h3 className={h3}>When you can opt out</h3>
      <ul className={list}>
        <li>You must stay in for the first 6 months.</li>
        <li>
          You can then opt out in months 7 and 8 only. Enrolled on 1 January 2026? Your window was July and August
          2026.
        </li>
        <li>You can also opt out in months 7 and 8 after each rate rise, during the first 10 years.</li>
        <li>
          You opt out on the MyFutureFund portal (log in with a verified MyGovID), or ask NAERSA (the State body that
          runs the scheme) for a paper form.
        </li>
        <li>You can cancel an opt-out within 48 hours.</li>
        <li>There is no penalty for opting out, even more than once.</li>
      </ul>

      <h3 className={h3}>What you get back</h3>
      <ul className={list}>
        <li>Opt out after enrolling: your own payments are refunded.</li>
        <li>Opt out after a rate rise: you get back only the extra you paid because of the rise.</li>
        <li>
          Your employer&apos;s and the State&apos;s payments are not refunded to you. They stay in your pot, stay
          invested, and are paid to you at age 66.
        </li>
      </ul>

      <h3 className={h3}>Pausing instead of leaving</h3>
      <p className="mt-3">
        After the first 6 months you can pause (suspend) your payments at any time, for 1 to 2 years. You get no
        refund. Your employer&apos;s and the State&apos;s payments pause too. Once paused, you must wait at least 12
        months before restarting.
      </p>

      <h3 className={h3}>Re-enrolment after 2 years</h3>
      <p className="mt-3">
        If you opt out or pause and still meet the rules, you are put back in automatically after 2 years. You will not
        be put back in for a job where you pay into another pension through payroll.
      </p>

      <h3 className={h3}>Who is outside auto-enrolment</h3>
      <ul className={list}>
        <li>People who already pay into a work pension, PRSA, RAC or PEPP through payroll, for that job.</li>
        <li>Self-employed people. They cannot opt in.</li>
        <li>
          Employees under 23 or over 60, or earning under €20,000. They are not enrolled automatically, but can choose
          to opt in.
        </li>
      </ul>
      <p className="mt-3">If you earn under €20,000 after you are enrolled, you stay in.</p>

      <h3 className={h3}>Things to weigh</h3>
      <p className="mt-3">None of these is a recommendation. They are points gov.ie and Citizens Information raise.</p>
      <ul className={list}>
        <li>
          <strong>Employer money.</strong> While you pay in, your employer must match you. If you opt out, your
          employer stops paying in too.
        </li>
        <li>
          <strong>State top-up vs tax relief.</strong> There is no tax relief on what you pay into MyFutureFund.
          Instead the State adds €1 for every €3, which gov.ie says is worth the same as 25% tax relief. Personal and
          work pensions get tax relief at your top rate: 20% or 40%.
        </li>
        <li>
          <strong>Your take-home pay now.</strong> Your payment comes out of each pay packet, and the rate rises in
          years 4, 7 and 10.
        </li>
        <li>
          <strong>Locked until 66.</strong> You cannot take the money out before State Pension age, which is currently
          66. Ill-health retirement is the exception.
        </li>
        <li>
          <strong>Tax at retirement.</strong> At retirement (State Pension age, currently 66), MyFutureFund drawdowns
          are set up like a PRSA: up to 25% of the fund as a tax-free lump sum, with the rest taxed as income. Small
          funds may get Revenue&apos;s &apos;trivial pensions&apos; treatment. The exact tax rules that apply when you
          retire will be the ones in force then.
        </li>
        <li>
          <strong>Value can fall.</strong> The State does not promise the value of your pot. It is invested, so it can
          go up or down.
        </li>
        <li>
          <strong>Fees.</strong> 55 cent a week (capped at €28.60 a year) plus 0.03833% of your savings a year. No
          admin fee while you have opted out or paused.
        </li>
        <li>
          <strong>Other pensions.</strong> If you pay into a pension outside payroll, you can stay in MyFutureFund too.
          If you join a work pension through payroll later, auto-enrolment stops for that job and overlapping payments
          are refunded.
        </li>
      </ul>
      <p className="mt-3">Use the calculator above for an estimate of your own payments and pot.</p>

      <h3 className={h3}>FAQs</h3>
      <div className="mt-3 space-y-4">
        <div>
          <p className="font-semibold">Do I get my money back if I opt out?</p>
          <p>
            You get back what you paid in. Your employer&apos;s and the State&apos;s payments stay in your pot until
            66.
          </p>
        </div>
        <div>
          <p className="font-semibold">I missed my opt-out window. What now?</p>
          <p>
            You can pause your payments at any time after the first 6 months. You also get a new opt-out window 6
            months after each rate rise.
          </p>
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
          <Link href="/rent-tax-credit" className={link}>
            Rent tax credit
          </Link>
        </li>
        <li>
          <Link href="/redundancy-calculator" className={link}>
            Redundancy calculator
          </Link>
        </li>
        <li>
          <Link href="/contractor-calculator" className={link}>
            Contractor calculator
          </Link>{' '}
          – the self-employed are outside auto-enrolment
        </li>
      </ul>

      <TaxDisclaimer className="mt-8" />

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

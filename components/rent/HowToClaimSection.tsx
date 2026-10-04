import Link from 'next/link';
import { TaxDisclaimer } from '@/components/TaxDisclaimer';

const h3 = 'mt-8 text-lg font-semibold text-ink';
const list = 'mt-3 list-disc space-y-1 pl-5';
const steps = 'mt-3 list-decimal space-y-1 pl-5';
const link = 'text-ink underline decoration-line underline-offset-2 hover:text-brand-700';

const SOURCES = [
  {
    label:
      'Revenue – Rent Tax Credit overview (2022–2028, amounts, what rent means, qualifying property types)',
    href: 'https://www.revenue.ie/en/personal-tax-credits-reliefs-and-exemptions/land-and-property/rent-credit/index.aspx',
  },
  {
    label: 'Revenue – How much can you claim? (20%, caps, no relief against USC/PRSI, limited to income tax paid)',
    href: 'https://www.revenue.ie/en/personal-tax-credits-reliefs-and-exemptions/land-and-property/rent-credit/how-much-claim.aspx',
  },
  {
    label: 'Revenue – Qualifying conditions for all claimants (RTB, digs, supported tenants, AHB landlords)',
    href: 'https://www.revenue.ie/en/personal-tax-credits-reliefs-and-exemptions/land-and-property/rent-credit/qualifying-conditions.aspx',
  },
  {
    label: 'Revenue – How to claim (myAccount steps for past years and 2026, ROS steps, RTB number)',
    href: 'https://www.revenue.ie/en/personal-tax-credits-reliefs-and-exemptions/land-and-property/rent-credit/how-to-claim.aspx',
  },
  {
    label:
      'Revenue – Tax and Duty Manual Part 15-01-11A (rent paid by either spouse counts when jointly assessed; in-year claim split between payroll refund and higher credits)',
    href: 'https://www.revenue.ie/en/tax-professionals/tdm/income-tax-capital-gains-tax-corporation-tax/part-15/15-01-11A.pdf',
  },
  {
    label: 'Revenue – PAYE Income Tax Return (four-year time limit)',
    href: 'https://www.revenue.ie/en/jobs-and-pensions/end-of-year-process/paye-income-tax-return.aspx',
  },
  {
    label:
      "Citizens Information – Rent Tax Credit (landlord can't be parent or child, details needed, each tenant or couple claims for rent they pay, student child rules)",
    href: 'https://www.citizensinformation.ie/en/money-and-tax/tax/housing-taxes-and-reliefs/rent-tax-credit/',
  },
];

export function HowToClaimSection() {
  return (
    <section id="how-to-claim" className="card mt-10 text-base leading-relaxed text-ink">
      <h2 className="font-serif text-2xl font-semibold tracking-tight text-ink">How to claim the rent tax credit</h2>
      <p className="mt-3">
        You claim it online in Revenue myAccount. For rent paid in 2026, use &quot;Manage your tax for the current
        year&quot;. For 2022 to 2025, file an Income Tax Return for each year under &quot;Review your tax for the
        previous 4 years&quot;. The credit is 20% of your rent, up to €1,000 a year, or €2,000 for a jointly assessed
        couple.
      </p>

      <h3 className={h3}>How much is it?</h3>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line">
              <th className="py-2 pr-4 font-semibold">Tax year</th>
              <th className="py-2 pr-4 font-semibold">Single / all other cases</th>
              <th className="py-2 font-semibold">Jointly assessed couple</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-line">
              <td className="py-2 pr-4">2022 and 2023</td>
              <td className="py-2 pr-4">up to €500</td>
              <td className="py-2">up to €1,000</td>
            </tr>
            <tr className="border-b border-line">
              <td className="py-2 pr-4">2024 and 2025</td>
              <td className="py-2 pr-4">up to €1,000</td>
              <td className="py-2">up to €2,000</td>
            </tr>
            <tr>
              <td className="py-2 pr-4">2026</td>
              <td className="py-2 pr-4">up to €1,000</td>
              <td className="py-2">up to €2,000</td>
            </tr>
          </tbody>
        </table>
      </div>
      <ul className={list}>
        <li>The credit is 20% of the rent you paid in the year, up to the limit above.</li>
        <li>It only reduces income tax. It does not reduce USC or PRSI.</li>
        <li>If you pay less income tax than the credit, you get only as much as the tax you paid.</li>
        <li>Rent does not include a deposit, repairs, or extras like bills, board or laundry.</li>
      </ul>
      <p className="mt-3">The credit runs for the tax years 2022 to 2028.</p>

      <h3 className={h3}>Can I claim? A quick check</h3>
      <p className="mt-3">You may be able to claim if you pay rent for:</p>
      <ul className={list}>
        <li>your own home,</li>
        <li>a second home in Ireland you use to get to work or college, or</li>
        <li>your child&apos;s place while they attend an approved course (rules on age and course apply).</li>
      </ul>
      <p className="mt-3">You cannot claim if:</p>
      <ul className={list}>
        <li>you get HAP, Rent Supplement or RAS for that home, even if you pay a top-up;</li>
        <li>your landlord is a housing association or approved housing body;</li>
        <li>your landlord is your parent or your child;</li>
        <li>your tenancy has to be registered with the RTB (Residential Tenancies Board) and it isn&apos;t.</li>
      </ul>
      <p className="mt-3">
        Rent-a-room or &quot;digs&quot; in the owner&apos;s home does not need RTB registration. But it does not
        qualify if you and the landlord are related.
      </p>

      <h3 className={h3}>What to have ready</h3>
      <ul className={list}>
        <li>
          Your RTB tenancy number, if your tenancy is registered. You can still claim without it, but Revenue may ask
          for it later and can take the credit back if you can&apos;t give it.
        </li>
        <li>Your landlord&apos;s name and address.</li>
        <li>Your landlord&apos;s PPS number or tax reference number.</li>
        <li>The property&apos;s Local Property Tax (LPT) number.</li>
        <li>The total rent you paid in the year.</li>
      </ul>
      <p className="mt-3">
        Your landlord can give their details to Revenue directly through myEnquiries if they prefer. Keep your rent
        records in case Revenue asks.
      </p>

      <h3 className={h3}>Claim for this year (2026), step by step</h3>
      <p className="mt-3">For PAYE workers:</p>
      <ol className={steps}>
        <li>Sign in to myAccount.</li>
        <li>Go to &quot;PAYE Services&quot;.</li>
        <li>Click &quot;Manage your tax for the current year&quot;.</li>
        <li>Click &quot;Add new credits&quot;.</li>
        <li>Under &quot;You and your family&quot;, claim the Rent Tax Credit.</li>
      </ol>
      <p className="mt-3">
        What happens next: the part of the credit for the months already passed can come back as a refund through
        your payroll. The rest is added to your tax credits, so less tax comes off your pay for the rest of the year.
      </p>
      <p className="mt-3">You can also wait and claim 2026 on your 2026 Income Tax Return in 2027.</p>

      <h3 className={h3}>Claim for past years (2022 to 2025), step by step</h3>
      <p className="mt-3">For PAYE workers:</p>
      <ol className={steps}>
        <li>Sign in to myAccount.</li>
        <li>Under &quot;PAYE Services&quot;, click &quot;Review your tax for the previous 4 years&quot;.</li>
        <li>Request a &quot;Statement of Liability&quot; for the year.</li>
        <li>Click &quot;Complete your Income Tax Return&quot;.</li>
        <li>On the &quot;Tax Credits &amp; Reliefs&quot; page, select &quot;You and your family&quot;, then &quot;Rent Tax Credit&quot;.</li>
        <li>Work through the claim.</li>
        <li>Submit the return.</li>
      </ol>
      <p className="mt-3">File one return for each year.</p>
      <p className="mt-3">
        <strong>Deadline:</strong> you have four years from the end of a tax year to file the return. So the last day
        for a 2022 claim is 31 December 2026.
      </p>

      <h3 className={h3}>If you are self-assessed</h3>
      <p className="mt-3">
        File your yearly Form 11 in ROS (Revenue Online Service): My Services → File Return → Income Tax → pick the
        year → fill in the &quot;Rent Tax Credit&quot; section. If you are self-assessed and also have PAYE income, you
        can claim for 2026 in-year through &quot;Manage Your Tax 2026&quot; in myAccount in ROS.
      </p>

      <h3 className={h3}>Couples and people sharing</h3>
      <ul className={list}>
        <li>
          <strong>Married or civil partners, jointly assessed:</strong> up to €2,000 a year between you. Rent paid by
          either of you counts.
        </li>
        <li>
          <strong>Everyone else, including unmarried couples:</strong> each person claims for the rent they pay, up to
          €1,000 each, as long as each has income tax to set it against.
        </li>
        <li>
          <strong>House shares:</strong> each tenant, or each couple, claims for the rent they pay.
        </li>
      </ul>

      <h3 className={h3}>FAQs</h3>
      <div className="mt-3 space-y-4">
        <div>
          <p className="font-semibold">Can I claim the rent tax credit for previous years?</p>
          <p>
            Yes. Right now you can claim 2022, 2023, 2024 and 2025 through &quot;Review your tax for the previous 4
            years&quot; in myAccount. The 2022 window closes on 31 December 2026.
          </p>
        </div>
        <div>
          <p className="font-semibold">I pay rent for my student child. Can I claim?</p>
          <p>
            Possibly, if they attend an approved course, they meet the age rule, and the landlord is not related to
            you or your child.
          </p>
        </div>
        <div>
          <p className="font-semibold">Will I get the full €1,000?</p>
          <p>
            Only if your rent is at least €5,000 in the year and you pay at least €1,000 in income tax. Our calculator
            above gives an estimate.
          </p>
        </div>
      </div>

      <h3 className={h3}>Related pages</h3>
      <ul className={list}>
        <li>
          <Link href="/" className={link}>
            Irish take-home pay calculator
          </Link>{' '}
          – see your tax before and after credits
        </li>
        <li>
          <Link href="/auto-enrolment-calculator" className={link}>
            Auto-enrolment pension calculator
          </Link>
        </li>
        <li>
          <Link href="/redundancy-calculator" className={link}>
            Redundancy calculator
          </Link>
        </li>
        <li>
          <Link href="/second-income-form-12" className={link}>
            Second income / Form 12: do I need to file?
          </Link>
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

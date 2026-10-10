import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { TaxDisclaimer } from '@/components/TaxDisclaimer';
import { TrustStrip } from '@/components/TrustStrip';
import { EXIT_TAX, deemedDisposalExample, exitTaxExampleRows } from '@/lib/exitTax';
import { pageMeta } from '@/lib/pageMeta';

export const metadata = pageMeta({
  title: 'Exit tax in Ireland: 38% now, 35% announced in Budget 2027 | MyIrishTax',
  description:
    'Exit tax on Irish funds, ETFs and life assurance policies is 38%. Budget 2027 announced a cut to 35%, due in 2027; the start date will be set in the Finance Bill. Deemed disposal is unchanged. Worked examples. Not advice.',
  path: '/exit-tax-ireland',
});

const h2 = 'text-xl font-semibold text-ink';
const list = 'mt-3 list-disc space-y-2 pl-5';
const link = 'text-ink underline decoration-line underline-offset-2 hover:text-brand-700';

const EBRIEF_016 = 'https://www.revenue.ie/en/tax-professionals/ebrief/2026/no-0162026.aspx';
const TPC = 'https://assets.gov.ie/static/documents/c6792805/Budget_2027_-_Tax_Policy_Changes_-_Publication_Version.pdf';
const PQ_DEEMED = 'https://www.oireachtas.ie/en/debates/question/2026-02-11/68/';
const TDM_27_01A_02 =
  'https://www.revenue.ie/en/tax-professionals/tdm/income-tax-capital-gains-tax-corporation-tax/part-27/27-01a-02-20210906132652.pdf';

const euro = (n: number) => `€${Math.round(n).toLocaleString('en-IE')}`;
const pct = (r: number) => `${Math.round(r * 100)}%`;

export default function ExitTaxIrelandPage() {
  const rows = exitTaxExampleRows();
  const now = pct(EXIT_TAX.current.rate);
  const next = pct(EXIT_TAX.announced.rate);
  const dd = deemedDisposalExample(20000, 30000, EXIT_TAX.current.rate);
  const ddNext = deemedDisposalExample(20000, 30000, EXIT_TAX.announced.rate);
  return (
    <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
      <PageHeader title="Exit tax in Ireland: 38% now, 35% announced">
        <TrustStrip
          kind="guide"
          sources={[
            { label: 'Revenue', href: EBRIEF_016 },
            { label: 'gov.ie', href: TPC },
          ]}
        />
        <TaxDisclaimer />
      </PageHeader>

      <div className="space-y-10 text-base leading-relaxed text-ink-muted">
        <section>
          <p className="text-ink">
            Exit tax is the tax on gains from Irish funds, life assurance policies taken out since 2001, and similar funds
            in the EU, EEA or OECD, including many ETFs. For individuals the rate is {now} (since{' '}
            {EXIT_TAX.current.from}).
          </p>
          <div className="mt-4 rounded-xl border border-line bg-white p-4 text-ink" data-testid="budget-2027-exit-tax">
            <p>
              <strong>Budget 2027 announced a cut to {next}, due in 2027; the start date will be set in the Finance Bill.</strong>
            </p>
            <p className="mt-2">Deemed disposal (the 8-year rule) is unchanged.</p>
          </div>
        </section>

        <section>
          <h2 className={h2}>Worked example: tax on a gain</h2>
          <p className="mt-3">
            You sell units in an Irish-domiciled fund or an EU ETF for a {euro(10000)} gain. At {now} the exit tax is{' '}
            {euro(rows[2].now)}. Once the {next} rate is in force it would be {euro(rows[2].announced)}, which is{' '}
            {euro(rows[2].saving)} less.
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-ink">
                  <th className="py-2 pr-4 font-semibold">Gain</th>
                  <th className="py-2 pr-4 font-semibold">Tax at {now} (now)</th>
                  <th className="py-2 pr-4 font-semibold">Tax at {next} (once in force)</th>
                  <th className="py-2 font-semibold">Difference</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.gain} className="border-b border-line">
                    <td className="py-2 pr-4">{euro(r.gain)}</td>
                    <td className="py-2 pr-4">{euro(r.now)}</td>
                    <td className="py-2 pr-4">{euro(r.announced)}</td>
                    <td className="py-2">{euro(r.saving)} less</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className={h2}>Deemed disposal: the 8-year rule</h2>
          <p className="mt-3">
            Every {EXIT_TAX.deemedDisposalYears} years after you buy, you are taxed as if you had sold, even if you
            haven&apos;t. Budget 2027 did not change this.
          </p>
          <p className="mt-3">
            Example: you invest {euro(20000)} and it is worth {euro(30000)} on the 8th anniversary. The deemed gain is{' '}
            {euro(dd.gain)}, so exit tax is {euro(dd.tax)} at {now}, or {euro(ddNext.tax)} once {next} is in force. Your
            cost for the next 8 years becomes {euro(dd.newBase)}, and tax paid on a deemed disposal is credited when you
            finally sell.
          </p>
          <p className="mt-3">
            Funds outside Ireland can&apos;t deduct Irish exit tax for you, so for EU, EEA and OECD funds and ETFs you
            report and pay it yourself through your tax return (Form 11).
          </p>
        </section>

        <section>
          <h2 className={h2}>Who the cut covers</h2>
          <ul className={list}>
            <li>Irish funds (ICAVs, investment companies and unit trusts): {now} → {next}.</li>
            <li>Life assurance policies with Irish life companies since 2001: {now} → {next}.</li>
            <li>Equivalent EU, EEA and OECD funds, including ETFs taxed under that regime: {now} → {next}.</li>
            <li>Certain foreign life assurance policies: {now} → {next}.</li>
            <li>Not covered: personal portfolio funds and policies (PPIU / PPLAP), and companies.</li>
          </ul>
          <p className="mt-3">
            Shares and other assets taxed under capital gains tax are separate. You can track those in the{' '}
            <Link href="/portfolio" className={link}>
              CGT portfolio tool
            </Link>
            .
          </p>
        </section>

        <section>
          <h2 className={h2}>Sources</h2>
          <ul className={list}>
            <li>
              <a href={EBRIEF_016} className={link} target="_blank" rel="noopener noreferrer">
                Revenue eBrief 016/26
              </a>
              : &quot;Finance Act 2025 amendments which reduced the rate of tax for individuals from 41 percent to 38
              percent. The reduced rate applies from 1 January 2026&quot;.
            </li>
            <li>
              <a href={TPC} className={link} target="_blank" rel="noopener noreferrer">
                Budget 2027 Tax Policy Changes, section 2.2 (page 5)
              </a>
              : the rates are &quot;being reduced from 38% to 35%&quot;, listed in Table 1, &quot;Tax measures for
              introduction in 2027&quot;. No start date is given.
            </li>
            <li>
              <a href={PQ_DEEMED} className={link} target="_blank" rel="noopener noreferrer">
                Parliamentary question, 11 Feb 2026 (Revenue&apos;s advice)
              </a>
              : &quot;A deemed disposal occurs eight years following inception of a policy of life assurance or
              acquisition of a fund and then every eight years thereafter.&quot;
            </li>
            <li>
              <a href={TDM_27_01A_02} className={link} target="_blank" rel="noopener noreferrer">
                Revenue Tax and Duty Manual Part 27-01a-02 (Investment Undertakings)
              </a>
              , section 4.4.5: &quot;Exit tax already paid in connection with the ending of an 8-year period may be
              offset against exit tax due on a subsequent chargeable event.&quot;
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}

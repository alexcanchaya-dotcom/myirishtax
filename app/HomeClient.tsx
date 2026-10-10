'use client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { CalculatorInput } from '../components/CalculatorInput';
import { SelectField } from '../components/SelectField';
import { BreakdownTable } from '../components/BreakdownTable';
import { TaxSummaryCard } from '../components/TaxSummaryCard';
import { buildSummaryRows } from '../lib/summaryRows';
import { CopyEstimateLink } from '../components/CopyEstimateLink';
import { fromSearch, toSearch, type HomeUrlState } from '../lib/homeUrlState';
import { OwedTaxBack } from '../components/OwedTaxBack';
import { ComparisonView } from '../components/ComparisonView';
import { TaxBreakdown, calculateNetIncome, compareScenarios } from '../lib/taxEngine';
import { formatTaxYearLabel, getDefaultTaxYear, isTaxYearAvailable, listSupportedYears } from '../lib/config/taxYearConfig';
import { BUDGET_2027 } from '../lib/config/taxYear2027';
import Link from 'next/link';
import { PageHeader } from '../components/PageHeader';
import { FireHandoff } from '../components/FireHandoff';
import { RelatedCalculators } from '../components/RelatedCalculators';
import { TaxDisclaimer } from '../components/TaxDisclaimer';
import { PENSION_AGE_HINT, PENSION_AGE_OPTIONS } from '../lib/pensionAgeOptions';
import { TrustStrip } from '@/components/TrustStrip';
import { Faq, WebAppJsonLd } from '@/components/Faq';
import { TAKE_HOME_FAQ } from '@/lib/faq/calculatorFaqs';

const years = listSupportedYears();

function formatEuro(n: number): string {
  return `€${Math.round(n).toLocaleString('en-IE')}`;
}

const URL_DEFAULTS: HomeUrlState = {
  income: 60000,
  period: 'annual',
  maritalStatus: 'single',
  spouseIncome: 0,
  singleParent: false,
  homeCarer: false,
  over65: false,
  reducedUsc: false,
  pension: 0,
  pensionAge: '',
  credits: 0,
  taxYear: getDefaultTaxYear(),
};

const MARRIED_HINT =
  'Married or civil partners are taxed together (joint assessment). Add your spouse or partner’s pay, or leave it at 0 if only you earn.';
const SPOUSE_HINT = 'We assume you are both PAYE employees and share the tax band and credits in the way that saves most tax.';
const SINGLE_PARENT_HINT =
  'Tick if a child lives with you for most of the year and you are not married or living with a partner. Adds the Single Person Child Carer Credit (€1,900 in 2026) and €4,000 more taxed at 20%. Only one parent can claim it.';
const HOME_CARER_HINT =
  'Tick if your spouse or partner works in the home caring for a child you get Child Benefit for, someone aged 65 or over, or someone permanently incapacitated. Home Carer Tax Credit up to €1,950 in 2026, reduced if their own pay is over €7,200. We use it only if it saves more than the second-earner band.';
const OVER_65_HINT =
  'Adds the Age Tax Credit (€245, or €490 for a couple). If total income is €18,000 or less (€36,000 for a couple) there is no income tax, and just above that marginal relief can lower it. USC and PRSI are not changed in this estimate.';
const REDUCED_USC_HINT =
  'Reduced USC: 0.5% on the first €12,012 and 2% on the rest, if your own income is €60,000 or less. Not for a GP visit card. Medical card holders need to ask Revenue to apply it.';
const CREDITS_HINT =
  'Only credits not already counted, e.g. rent tax credit (up to €1,000 in 2026, €2,000 for a couple) or dependent relative credit (€305). Your personal and Employee (PAYE) credits are already included.';

export default function HomePage() {
  const { data: session } = useSession();
  const [income, setIncome] = useState(60000);
  const [period, setPeriod] = useState<'annual' | 'monthly' | 'weekly'>('annual');
  const [maritalStatus, setMaritalStatus] = useState<'single' | 'married'>('single');
  const [pension, setPension] = useState(0);
  const [pensionAge, setPensionAge] = useState('');
  const [credits, setCredits] = useState(0);
  const [spouseIncome, setSpouseIncome] = useState(0);
  const [singleParent, setSingleParent] = useState(false);
  const [homeCarer, setHomeCarer] = useState(false);
  const [over65, setOver65] = useState(false);
  const [reducedUsc, setReducedUsc] = useState(false);
  const [urlLoaded, setUrlLoaded] = useState(false);
  const [taxYear, setTaxYear] = useState<number>(getDefaultTaxYear());
  const [result, setResult] = useState<TaxBreakdown | null>(null);
  const [resultKey, setResultKey] = useState<string | null>(null);
  const [scenarioBIncome, setScenarioBIncome] = useState(65000);
  const [showCompare, setShowCompare] = useState(false);

  const input = useMemo(
    () => ({
      income,
      period,
      maritalStatus,
      pensionContribution: pension,
      ...(pensionAge !== '' ? { age: Number(pensionAge) } : {}),
      additionalCredits: credits,
      ...(maritalStatus === 'married' && spouseIncome > 0 ? { spouseIncome } : {}),
      ...(maritalStatus === 'single' && singleParent ? { singleParent: true } : {}),
      ...(maritalStatus === 'married' && homeCarer ? { homeCarer: true } : {}),
      ...(over65 ? { over65: true } : {}),
      ...(reducedUsc ? { reducedUsc: true } : {}),
      taxYear,
    }),
    [credits, homeCarer, income, over65, reducedUsc, maritalStatus, pension, pensionAge, period, singleParent, spouseIncome, taxYear],
  );
  // Inputs live in the URL (?income=…&year=…) so an estimate can be reloaded or shared.
  useEffect(() => {
    const s = fromSearch(window.location.search, URL_DEFAULTS);
    setIncome(s.income);
    setPeriod(s.period);
    setMaritalStatus(s.maritalStatus);
    setSpouseIncome(s.spouseIncome);
    setSingleParent(s.singleParent);
    setHomeCarer(s.homeCarer);
    setOver65(s.over65);
    setReducedUsc(s.reducedUsc);
    setPension(s.pension);
    setPensionAge(s.pensionAge);
    setCredits(s.credits);
    setTaxYear(s.taxYear);
    setUrlLoaded(true);
  }, []);

  useEffect(() => {
    if (!urlLoaded) return;
    const search = toSearch(
      { income, period, maritalStatus, spouseIncome, singleParent, homeCarer, over65, reducedUsc, pension, pensionAge, credits, taxYear },
      URL_DEFAULTS,
    );
    if (search !== window.location.search) {
      window.history.replaceState(window.history.state, '', `${window.location.pathname}${search}${window.location.hash}`);
    }
  }, [credits, homeCarer, income, over65, reducedUsc, maritalStatus, pension, pensionAge, period, singleParent, spouseIncome, taxYear, urlLoaded]);

  const inputKey = JSON.stringify(input);
  const isCurrent = result !== null && resultKey === inputKey;

  const calculate = useCallback(() => {
    setResult(calculateNetIncome(input));
    setResultKey(JSON.stringify(input));
  }, [input]);

  // Recalc as soon as figures change (not on blur). Calculate still commits the same maths.
  useEffect(() => {
    calculate();
  }, [calculate]);

  const comparison = useMemo(() => {
    if (!result || !showCompare) return null;
    return compareScenarios(input, {
      ...input,
      income: scenarioBIncome,
    });
  }, [input, result, scenarioBIncome, showCompare]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    calculate();
    document.getElementById('take-home-result')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <PageHeader title="Irish take-home pay">
        <p className="font-medium text-brand-700">{formatTaxYearLabel(taxYear)}</p>
        <p>
          Estimate PAYE, USC and PRSI from published bands. The {formatTaxYearLabel(getDefaultTaxYear())}{' '}
          is the default; 2025 is still available
          {isTaxYearAvailable(2027)
            ? `, and 2027 uses the Budget 2027 figures, checked ${BUDGET_2027.figuresCheckedOn ?? ''}`
            : ''}
          . Free to use — no account needed.
        </p>
        {BUDGET_2027.status === 'confirmed' ? (
          <p>
            <Link href="/budget-2027" className="font-semibold text-brand-700 underline decoration-line underline-offset-2">
              New: Budget 2027 — how much better off per week?
            </Link>
          </p>
        ) : null}
        <TrustStrip />
      </PageHeader>

      {result && (
        <div className="mb-6 rounded-2xl border border-line bg-white px-5 py-4 lg:hidden" data-testid="mobile-result">
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-sm text-ink-muted">
              {result.household ? 'Household take-home' : 'Take-home'}
              <span className="mt-0.5 block text-xs font-medium text-ink-muted">
                {formatTaxYearLabel(taxYear)}
                {isCurrent ? ' · current estimate' : ' · out of date — click Calculate'}
              </span>
            </span>
            <span
              className={`text-right font-serif text-2xl text-brand-700 ${isCurrent ? '' : 'opacity-50'}`}
              aria-live="polite"
            >
              {formatEuro(buildSummaryRows(result).takeHome)}
              <span className="block font-sans text-xs text-ink-muted">a year</span>
            </span>
          </div>
          <dl className={`mt-3 grid grid-cols-2 gap-3 border-t border-line pt-3 ${isCurrent ? '' : 'opacity-50'}`}>
            <div>
              <dt className="text-xs text-ink-muted">Per week</dt>
              <dd className="text-lg font-semibold text-ink">{formatEuro(result.netWeekly)}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-muted">Per month</dt>
              <dd className="text-lg font-semibold text-ink">{formatEuro(result.netMonthly)}</dd>
            </div>
          </dl>
        </div>
      )}

      <section className="grid gap-8 lg:grid-cols-12">
        <form className="card lg:col-span-7" onSubmit={handleSubmit}>
          <h2 className="text-lg font-semibold">Your figures</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <CalculatorInput label="Income" value={income} onChange={setIncome} prefix="€" />
            <SelectField
              label="Period"
              value={period}
              onChange={(v) => setPeriod(v as 'annual' | 'monthly' | 'weekly')}
              options={[
                { label: 'Annual', value: 'annual' },
                { label: 'Monthly', value: 'monthly' },
                { label: 'Weekly', value: 'weekly' },
              ]}
            />
            <div className="grid gap-5 sm:col-span-2 sm:grid-cols-2">
              <SelectField
                label="Single or married?"
                value={maritalStatus}
                onChange={(v) => setMaritalStatus(v as 'single' | 'married')}
                options={[
                  { label: 'Single', value: 'single' },
                  { label: 'Married or civil partners', value: 'married' },
                ]}
                describedBy="married-one-income-hint"
              />
              <p
                id="married-one-income-hint"
                className="scroll-mb-[calc(var(--site-footer-offset)+5.75rem)] text-xs font-normal leading-snug text-ink-muted sm:order-last sm:col-span-2"
              >
                {MARRIED_HINT}
              </p>
              {maritalStatus === 'single' && (
                <div className="flex flex-col gap-1">
                  <label className="flex min-h-11 items-center gap-3 text-sm font-medium text-ink">
                    <input
                      type="checkbox"
                      className="h-5 w-5"
                      checked={singleParent}
                      onChange={(e) => setSingleParent(e.target.checked)}
                      aria-describedby="single-parent-hint"
                    />
                    I’m a single parent
                  </label>
                  <p id="single-parent-hint" className="text-xs font-normal leading-snug text-ink-muted">
                    {SINGLE_PARENT_HINT}
                  </p>
                </div>
              )}
              {maritalStatus === 'married' && (
                <CalculatorInput
                  label="Spouse or partner’s pay (per year)"
                  value={spouseIncome}
                  onChange={setSpouseIncome}
                  prefix="€"
                  hint={SPOUSE_HINT}
                />
              )}
              {maritalStatus === 'married' && (
                <div className="flex flex-col gap-1">
                  <label className="flex min-h-11 items-center gap-3 text-sm font-medium text-ink">
                    <input
                      type="checkbox"
                      className="h-5 w-5"
                      checked={homeCarer}
                      onChange={(e) => setHomeCarer(e.target.checked)}
                      aria-describedby="home-carer-hint"
                    />
                    My spouse or partner is a home carer
                  </label>
                  <p id="home-carer-hint" className="text-xs font-normal leading-snug text-ink-muted">
                    {HOME_CARER_HINT}
                  </p>
                </div>
              )}
              <SelectField
                label="Tax year"
                value={taxYear}
                onChange={(v) => setTaxYear(Number(v))}
                options={years.map((y) => ({ label: formatTaxYearLabel(y), value: y }))}
              />
            </div>
            <CalculatorInput label="Pension contributions (per year)" value={pension} onChange={setPension} prefix="€" />
            <SelectField
              label="Your age"
              value={pensionAge}
              onChange={setPensionAge}
              options={PENSION_AGE_OPTIONS}
              hint={PENSION_AGE_HINT}
            />
            {result && pension > 0 && result.pension.overLimit > 0 && (
              <p role="alert" className="text-xs font-normal leading-snug text-amber-800 sm:col-span-2">
                Over the limit: income tax relief is capped at {Math.round(result.pension.agePct * 100)}% of
                earnings (earnings capped at €115,000), so €{Math.round(result.pension.limit).toLocaleString('en-IE')} this
                year. The other €{Math.round(result.pension.overLimit).toLocaleString('en-IE')} gets no relief in this
                estimate.
                {!result.pension.ageGiven && ' Choose your age to check the limit for your age.'}
              </p>
            )}
            {pension > 0 && (
              <p className="text-xs font-normal leading-snug text-ink-muted sm:col-span-2">
                Pension contributions reduce income tax only. USC and PRSI are still charged on your full pay.
              </p>
            )}
            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className="flex min-h-11 items-center gap-3 text-sm font-medium text-ink">
                <input
                  type="checkbox"
                  className="h-5 w-5"
                  checked={over65}
                  onChange={(e) => setOver65(e.target.checked)}
                  aria-describedby="over-65-hint"
                />
                {maritalStatus === 'married' ? 'Either of us is 65 or over this year' : 'I’m 65 or over this year'}
              </label>
              <p id="over-65-hint" className="text-xs font-normal leading-snug text-ink-muted">
                {OVER_65_HINT}
              </p>
            </div>
            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className="flex min-h-11 items-center gap-3 text-sm font-medium text-ink">
                <input
                  type="checkbox"
                  className="h-5 w-5"
                  checked={reducedUsc}
                  onChange={(e) => setReducedUsc(e.target.checked)}
                  aria-describedby="reduced-usc-hint"
                />
                I have a full medical card, or I’m 70 or over
              </label>
              <p id="reduced-usc-hint" className="text-xs font-normal leading-snug text-ink-muted">
                {REDUCED_USC_HINT}
              </p>
            </div>
            <CalculatorInput
              label="Other tax credits (per year)"
              value={credits}
              onChange={setCredits}
              prefix="€"
              hint={CREDITS_HINT}
            />
          </div>
          <div className="sticky bottom-[calc(var(--site-footer-offset)+0.5rem)] z-10 mt-6 -mx-6 border-t border-line bg-white/95 px-6 py-2.5 backdrop-blur lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:px-0 lg:py-0 lg:backdrop-blur-none">
            <div className="flex items-center gap-3">
              <button type="submit" className="btn-primary shrink-0">
                Calculate take-home
              </button>
              <p className="min-w-0 text-xs leading-snug text-ink-muted" aria-live="polite">
                {isCurrent
                  ? 'Take-home matches the figures above.'
                  : 'Figures changed — click Calculate to update.'}
              </p>
            </div>
          </div>
          <p className="mt-4 text-xs text-ink-muted">
            The estimate is worked out in your browser as you change a figure, or when you click
            Calculate.{' '}
            <Link href="/privacy" className="underline decoration-line underline-offset-2 hover:text-ink">
              Privacy
            </Link>
          </p>
        </form>

        <div id="take-home-result" className="space-y-6 lg:col-span-5">
          {result && <TaxSummaryCard data={result} isCurrent={isCurrent} taxYear={taxYear} />}
          {result && <CopyEstimateLink />}
          {result && <OwedTaxBack />}
          {result && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
              <BreakdownTable title="Income tax (before credits)" rows={result.paye} />
              <BreakdownTable title="USC" rows={result.usc} />
            </div>
          )}
          {result && <FireHandoff />}
        </div>
      </section>

      <details className="mt-8" open={showCompare} onToggle={(e) => setShowCompare((e.target as HTMLDetailsElement).open)}>
        <summary className="cursor-pointer text-sm text-ink-muted hover:text-ink">Compare another income</summary>
        <div className="mt-4 max-w-sm">
          <CalculatorInput label="Other income" value={scenarioBIncome} onChange={setScenarioBIncome} prefix="€" />
        </div>
        {comparison && (
          <div className="mt-4">
            <ComparisonView comparison={comparison} />
          </div>
        )}
      </details>

      {session?.user && (
        <p className="mt-6 text-sm text-ink-muted">
          Signed in as {session.user.email}. Saving and PDF export stay optional.
        </p>
      )}

      <section className="mt-16 border-t border-line pt-10">
        <h2 className="text-xl font-semibold">How the estimate is built</h2>
        <div className="mt-6 grid gap-8 text-sm leading-relaxed text-ink-muted md:grid-cols-3">
          <div>
            <h3 className="mb-2 text-base font-semibold text-ink">PAYE</h3>
            <p>
              20% up to €44,000 if you are single, or €53,000 if married with one income (2025 and
              2026). If you both earn, the 20% band goes up by the lower of €35,000 or the lower
              earner&apos;s pay, and each of you gets the €2,000 Employee Tax Credit. USC and PRSI are
              worked out on each person&apos;s own pay. Income above the band is 40%. Credits reduce
              income tax only. Pension contributions reduce income tax only, up to
              Revenue&apos;s age limit (15% of earnings under 30, rising to 40% at 60 or over, on
              earnings up to €115,000). They do not reduce USC or PRSI.
            </p>
          </div>
          <div>
            <h3 className="mb-2 text-base font-semibold text-ink">USC</h3>
            <p>
              No USC if your total income for the year is €13,000 or less. Above that, USC applies
              to all of it. 2025: 0.5% to €12,012, 2% to €27,382, 3% to €70,044, then 8%. 2026
              raises the 2% ceiling to €28,700. Credits do not reduce USC.
            </p>
          </div>
          <div>
            <h3 className="mb-2 text-base font-semibold text-ink">PRSI</h3>
            <p>
              Class A employee rate: 4.1% to 30 September 2025, then 4.2%, rising to 4.35% from
              1 October 2026. The estimate weights the rate by month. No PRSI if you earn €352 a
              week or less. Between €352.01 and €424 a week, a PRSI credit of up to €12 a week
              reduces it.
              {BUDGET_2027.status === 'confirmed' && BUDGET_2027.prsi.rateFrom1Jan !== null
                ? ` 2027: ${Number((BUDGET_2027.prsi.rateFrom1Jan * 100).toFixed(3))}% from January${
                    BUDGET_2027.prsi.rateAfterChange !== null && BUDGET_2027.prsi.changeMonth !== null
                      ? `, ${Number((BUDGET_2027.prsi.rateAfterChange * 100).toFixed(3))}% from 1 ${new Date(2027, BUDGET_2027.prsi.changeMonth - 1, 1).toLocaleString('en-IE', { month: 'long' })}`
                      : ''
                  } (Budget 2027).`
                : ''}{' '}
              Tax credits do not reduce PRSI.
            </p>
          </div>
        </div>
        <TaxDisclaimer className="mt-8" />
      </section>

      <Faq items={TAKE_HOME_FAQ} />
      <WebAppJsonLd
        name="Irish take-home pay calculator"
        path="/"
        description="Estimate PAYE, USC and PRSI from published bands. Free to use, no account needed."
      />
      <RelatedCalculators current="take-home" />

      <p className="mt-12 text-sm text-ink-muted">
        Other tools:{' '}
        <Link href="/contractor-calculator" className="text-ink underline decoration-line underline-offset-2 hover:text-brand-700">
          contractor
        </Link>
        ,{' '}
        <Link href="/rent-tax-credit" className="text-ink underline decoration-line underline-offset-2 hover:text-brand-700">
          rent tax credit
        </Link>
        ,{' '}
        <Link href="/redundancy-calculator" className="text-ink underline decoration-line underline-offset-2 hover:text-brand-700">
          redundancy
        </Link>
        ,{' '}
        <Link href="/auto-enrolment-calculator" className="text-ink underline decoration-line underline-offset-2 hover:text-brand-700">
          auto-enrolment
        </Link>
        .
      </p>
    </main>
  );
}

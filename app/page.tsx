'use client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { CalculatorInput } from '../components/CalculatorInput';
import { SelectField } from '../components/SelectField';
import { BreakdownTable } from '../components/BreakdownTable';
import { TaxSummaryCard } from '../components/TaxSummaryCard';
import { ComparisonView } from '../components/ComparisonView';
import { TaxBreakdown, calculateNetIncome, compareScenarios } from '../lib/taxEngine';
import { listSupportedYears } from '../lib/config/taxYearConfig';
import Link from 'next/link';
import { PageHeader } from '../components/PageHeader';

const years = listSupportedYears();

function formatEuro(n: number): string {
  return `€${Math.round(n).toLocaleString('en-IE')}`;
}

const MARRIED_HINT =
  'Married uses the one-income standard-rate band and married personal credit on this person’s pay only. Enter one salary — not a combined couple figure. We do not add a second income.';

export default function HomePage() {
  const { data: session } = useSession();
  const [income, setIncome] = useState(60000);
  const [period, setPeriod] = useState<'annual' | 'monthly' | 'weekly'>('annual');
  const [maritalStatus, setMaritalStatus] = useState<'single' | 'married'>('single');
  const [pension, setPension] = useState(0);
  const [credits, setCredits] = useState(0);
  const [taxYear, setTaxYear] = useState<number>(years[years.length - 1]);
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
      additionalCredits: credits,
      taxYear,
    }),
    [credits, income, maritalStatus, pension, period, taxYear],
  );
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
        <p>Estimate PAYE, USC and PRSI from published 2025 and 2026 bands. Free to use — no account needed.</p>
      </PageHeader>

      {result && (
        <div className="mb-6 flex items-baseline justify-between gap-4 rounded-2xl border border-line bg-white px-5 py-4 lg:hidden">
          <span className="text-sm text-ink-muted">
            Take-home
            <span className="mt-0.5 block text-xs font-medium text-ink-muted">
              {isCurrent ? 'Current estimate' : 'Out of date — click Calculate'}
            </span>
          </span>
          <span
            className={`font-serif text-2xl text-brand-700 ${isCurrent ? '' : 'opacity-50'}`}
            aria-live="polite"
          >
            {formatEuro(result.netAnnual)}
          </span>
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
            <SelectField
              label="Marital status"
              value={maritalStatus}
              onChange={(v) => setMaritalStatus(v as 'single' | 'married')}
              options={[
                { label: 'Single', value: 'single' },
                { label: 'Married — one income only', value: 'married' },
              ]}
              hint={MARRIED_HINT}
            />
            <SelectField
              label="Tax year"
              value={taxYear}
              onChange={(v) => setTaxYear(Number(v))}
              options={years.map((y) => ({ label: y.toString(), value: y }))}
            />
            <CalculatorInput label="Pension contributions" value={pension} onChange={setPension} prefix="€" />
            <CalculatorInput
              label="Extra credits"
              value={credits}
              onChange={setCredits}
              prefix="€"
            />
          </div>
          <div className="sticky bottom-[calc(var(--site-footer-offset)+0.5rem)] z-10 mt-6 -mx-6 border-t border-line bg-white/95 px-6 py-3 backdrop-blur lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:px-0 lg:py-0 lg:backdrop-blur-none">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button type="submit" className="btn-primary">
                Calculate take-home
              </button>
              <p className="text-xs text-ink-muted" aria-live="polite">
                {isCurrent
                  ? 'Take-home matches the figures above.'
                  : 'Figures changed — click Calculate to update.'}
              </p>
            </div>
          </div>
          <p className="mt-4 text-xs text-ink-muted">
            Extra credits sit on top of the standard personal and PAYE credits for your status.
            The estimate is worked out in your browser as you change a figure, or when you click
            Calculate.{' '}
            <Link href="/privacy" className="underline decoration-line underline-offset-2 hover:text-ink">
              Privacy
            </Link>
          </p>
        </form>

        <div id="take-home-result" className="space-y-6 lg:col-span-5">
          {result && <TaxSummaryCard data={result} isCurrent={isCurrent} />}
          {result && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
              <BreakdownTable title="PAYE" rows={result.paye} />
              <BreakdownTable title="USC" rows={result.usc} />
            </div>
          )}
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
              2026). Income above that is 40%. Credits reduce income tax only. Married here is one
              salary, not a two-income couple.
            </p>
          </div>
          <div>
            <h3 className="mb-2 text-base font-semibold text-ink">USC</h3>
            <p>
              2025: 0.5% to €12,012, 2% to €27,382, 3% to €70,044, then 8%. 2026 raises the 2%
              ceiling to €28,700. Credits do not reduce USC.
            </p>
          </div>
          <div>
            <h3 className="mb-2 text-base font-semibold text-ink">PRSI</h3>
            <p>
              Class A employee rate in the year book: 4% in 2025 and 4.2% in 2026. Credits do not
              reduce PRSI.
            </p>
          </div>
        </div>
      </section>

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

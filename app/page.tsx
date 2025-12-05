'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { CalculatorInput } from '../components/CalculatorInput';
import { SelectField } from '../components/SelectField';
import { ToggleSwitch } from '../components/ToggleSwitch';
import { BreakdownTable } from '../components/BreakdownTable';
import { TaxSummaryCard } from '../components/TaxSummaryCard';
import { ComparisonView } from '../components/ComparisonView';
import { FloatingAIChat } from '../components/FloatingAIChat';
import { TaxBreakdown, compareScenarios } from '../lib/taxEngine';
import { listSupportedYears } from '../lib/config/taxYearConfig';

const years = listSupportedYears();

export default function HomePage() {
  const [income, setIncome] = useState(60000);
  const [period, setPeriod] = useState<'annual' | 'monthly' | 'weekly'>('annual');
  const [maritalStatus, setMaritalStatus] = useState<'single' | 'married'>('single');
  const [pension, setPension] = useState(0);
  const [credits, setCredits] = useState(0);
  const [taxYear, setTaxYear] = useState<number>(years[years.length - 1]);
  const [result, setResult] = useState<TaxBreakdown | null>(null);
  const [scenarioBIncome, setScenarioBIncome] = useState(65000);

  useEffect(() => {
    const run = async () => {
      const response = await fetch('/api/calc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ income, period, maritalStatus, pensionContribution: pension, additionalCredits: credits, taxYear }),
      });
      const data = await response.json();
      setResult(data.breakdown);
    };
    run();
  }, [income, period, maritalStatus, pension, credits, taxYear]);

  const comparison = useMemo(() => {
    if (!result) return null;
    return compareScenarios(
      { income, period, maritalStatus, pensionContribution: pension, additionalCredits: credits, taxYear },
      { income: scenarioBIncome, period, maritalStatus, pensionContribution: pension, additionalCredits: credits, taxYear }
    );
  }, [credits, income, maritalStatus, pension, period, result, scenarioBIncome, taxYear]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <header className="flex flex-col gap-4 rounded-3xl bg-gradient-to-r from-brand-600 to-brand-500 p-8 text-white">
        <h1 className="text-4xl font-bold">MyIrishTax</h1>
        <p className="max-w-2xl text-lg">The most advanced PAYE/USC/PRSI calculator. Update any field and see live results instantly.</p>
      </header>

      <section className="mt-6 grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="grid gap-4 md:grid-cols-2">
              <CalculatorInput label="Income" value={income} onChange={setIncome} prefix="€" />
              <SelectField
                label="Period"
                value={period}
                onChange={(v) => setPeriod(v as any)}
                options={[
                  { label: 'Annual', value: 'annual' },
                  { label: 'Monthly', value: 'monthly' },
                  { label: 'Weekly', value: 'weekly' },
                ]}
              />
              <SelectField
                label="Marital status"
                value={maritalStatus}
                onChange={(v) => setMaritalStatus(v as any)}
                options={[
                  { label: 'Single', value: 'single' },
                  { label: 'Married', value: 'married' },
                ]}
              />
              <SelectField label="Tax year" value={taxYear} onChange={(v) => setTaxYear(Number(v))} options={years.map((y) => ({ label: y.toString(), value: y }))} />
              <CalculatorInput label="Pension contributions" value={pension} onChange={setPension} prefix="€" />
              <CalculatorInput label="Additional credits" value={credits} onChange={setCredits} prefix="€" />
            </div>
          </div>

          {result && (
            <div className="grid gap-4 md:grid-cols-3">
              <BreakdownTable title="PAYE" rows={result.paye} />
              <BreakdownTable title="USC" rows={result.usc} />
              <TaxSummaryCard data={result} />
            </div>
          )}

          {comparison && <ComparisonView comparison={comparison} />}
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-800">Scenario B income</h3>
            <CalculatorInput label="Compare" value={scenarioBIncome} onChange={setScenarioBIncome} prefix="€" />
            <p className="mt-2 text-xs text-gray-500">Scenario B shares all other settings with Scenario A.</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-800">Advanced options</h3>
            <ToggleSwitch enabled label="Real-time calculations" onChange={() => {}} />
            <p className="text-xs text-gray-500">PDF export, premium checks, and CSV uploads available via APIs.</p>
          </div>
        </div>
      </section>
      <FloatingAIChat />
    </main>
  );
}

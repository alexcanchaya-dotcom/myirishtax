'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { CalculatorInput } from '../components/CalculatorInput';
import { SelectField } from '../components/SelectField';
import { ToggleSwitch } from '../components/ToggleSwitch';
import { BreakdownTable } from '../components/BreakdownTable';
import { TaxSummaryCard } from '../components/TaxSummaryCard';
import { ComparisonView } from '../components/ComparisonView';
import { FloatingAIChat } from '../components/FloatingAIChat';
import { TaxBreakdown, compareScenarios } from '../lib/taxEngine';
import { listSupportedYears } from '../lib/config/taxYearConfig';
import { Download, Save } from 'lucide-react';
import Link from 'next/link';

const years = listSupportedYears();

export default function HomePage() {
  const { data: session } = useSession();
  const [income, setIncome] = useState(60000);
  const [period, setPeriod] = useState<'annual' | 'monthly' | 'weekly'>('annual');
  const [maritalStatus, setMaritalStatus] = useState<'single' | 'married'>('single');
  const [pension, setPension] = useState(0);
  const [credits, setCredits] = useState(0);
  const [taxYear, setTaxYear] = useState<number>(years[years.length - 1]);
  const [result, setResult] = useState<TaxBreakdown | null>(null);
  const [scenarioBIncome, setScenarioBIncome] = useState(65000);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // All tax years available — no paywall filtering
  const availableYears = years;

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

  const handleSaveCalculation = async () => {
    if (!session?.user) {
      window.location.href = '/auth/login';
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/calculations/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `PAYE Calculation - €${income.toLocaleString()}`,
          type: 'PAYE',
          data: { income, period, maritalStatus, pension, credits, taxYear, result },
        }),
      });

      if (response.ok) {
        alert('Calculation saved successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save calculation');
      }
    } catch (error) {
      alert('Failed to save calculation');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportPDF = async () => {
    if (!session?.user) {
      window.location.href = '/auth/login';
      return;
    }

    setIsExporting(true);
    try {
      const response = await fetch('/api/pdf/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ result }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `myirishtax-${taxYear}-${Date.now()}.pdf`;
        a.click();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to export PDF');
      }
    } catch (error) {
      alert('Failed to export PDF');
    } finally {
      setIsExporting(false);
    }
  };

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
              <SelectField
                label="Tax year"
                value={taxYear}
                onChange={(v) => setTaxYear(Number(v))}
                options={availableYears.map((y) => ({ label: y.toString(), value: y }))}
              />
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
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Actions</h3>
            <div className="space-y-2">
              {session?.user && (
                <>
                  <button
                    onClick={handleSaveCalculation}
                    disabled={isSaving || !result}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    <Save className="h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Save Calculation'}
                  </button>

                  <button
                    onClick={handleExportPDF}
                    disabled={isExporting || !result}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    <Download className="h-4 w-4" />
                    {isExporting ? 'Exporting...' : 'Export PDF'}
                  </button>
                </>
              )}
              {!session?.user && (
                <p className="text-xs text-gray-500 text-center">
                  <Link href="/auth/login" className="text-brand-600 hover:underline font-medium">Sign in</Link> to save calculations and export PDFs.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Cross-links to other calculators */}
      <section className="mt-12 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">More Irish Tax Calculators</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/contractor-calculator"
            className="flex flex-col gap-1 rounded-lg border border-gray-100 bg-gray-50 p-4 hover:border-brand-200 hover:bg-brand-50 transition-colors"
          >
            <span className="text-sm font-semibold text-gray-900">Contractor Tax Calculator</span>
            <span className="text-xs text-gray-500">Calculate self-employed income tax, USC, and Class S PRSI</span>
          </Link>
          <Link
            href="/rental-calculator"
            className="flex flex-col gap-1 rounded-lg border border-gray-100 bg-gray-50 p-4 hover:border-brand-200 hover:bg-brand-50 transition-colors"
          >
            <span className="text-sm font-semibold text-gray-900">Rental Income Calculator</span>
            <span className="text-xs text-gray-500">Work out tax on rental income and allowable expenses</span>
          </Link>
          <Link
            href="/auto-enrolment-calculator"
            className="flex flex-col gap-1 rounded-lg border border-gray-100 bg-gray-50 p-4 hover:border-brand-200 hover:bg-brand-50 transition-colors"
          >
            <span className="text-sm font-semibold text-gray-900">Auto-Enrolment Calculator</span>
            <span className="text-xs text-gray-500">See your My Future Fund pension projections for 2026</span>
          </Link>
          <Link
            href="/rent-tax-credit"
            className="flex flex-col gap-1 rounded-lg border border-gray-100 bg-gray-50 p-4 hover:border-brand-200 hover:bg-brand-50 transition-colors"
          >
            <span className="text-sm font-semibold text-gray-900">Rent Tax Credit Calculator</span>
            <span className="text-xs text-gray-500">Check how much rent credit you can claim (up to €1,000)</span>
          </Link>
          <Link
            href="/redundancy-calculator"
            className="flex flex-col gap-1 rounded-lg border border-gray-100 bg-gray-50 p-4 hover:border-brand-200 hover:bg-brand-50 transition-colors"
          >
            <span className="text-sm font-semibold text-gray-900">Redundancy Calculator</span>
            <span className="text-xs text-gray-500">Calculate your statutory redundancy entitlements</span>
          </Link>
        </div>
      </section>

      {/* SEO text section */}
      <section className="mt-8 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Understanding Your Irish Tax: PAYE, USC, and PRSI</h2>
        <div className="grid gap-6 md:grid-cols-3 text-sm text-gray-600 leading-relaxed">
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">PAYE – Pay As You Earn</h3>
            <p>
              PAYE is Ireland's income tax system for employees. Tax is deducted at source by your employer before you receive your pay. In 2026, the standard rate is 20% on income up to the standard rate cut-off point (€44,000 for a single person), with the higher rate of 40% applying to income above that threshold. Tax credits reduce the amount of tax you owe — the personal credit and PAYE credit together are worth €3,700 for 2026.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">USC – Universal Social Charge</h3>
            <p>
              The Universal Social Charge (USC) is a tax on gross income that applies to all earners over €13,000 per year. It is charged in addition to income tax and operates on a banded system: 0.5% on the first €12,012, 2% on the next €13,748, and 4% on income above €25,760 (with a higher 8% rate applying to non-PAYE income over €100,000). USC was introduced in 2011 to help consolidate Ireland's public finances.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">PRSI – Pay Related Social Insurance</h3>
            <p>
              PRSI funds Ireland's social welfare entitlements including the State Pension, Jobseeker's Benefit, and illness payments. Most employees pay Class A PRSI at 4% on gross earnings over €352 per week (no upper limit). Your employer also contributes — typically at 11.05%. Self-employed individuals pay Class S PRSI at 4% on all income over €5,000, but do not have access to the same benefits as employed workers.
            </p>
          </div>
        </div>
      </section>

      <FloatingAIChat />
    </main>
  );
}

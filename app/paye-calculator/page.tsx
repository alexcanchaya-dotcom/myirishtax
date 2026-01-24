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
import { FeatureGate } from '../components/paywall/FeatureGate';
import { useSubscription } from '../lib/hooks/useSubscription';
import { TaxBreakdown, compareScenarios } from '../lib/taxEngine';
import { listSupportedYears } from '../lib/config/taxYearConfig';
import { Download, Save, Lock, Crown, Sparkles } from 'lucide-react';
import Link from 'next/link';

const years = listSupportedYears();
const currentYear = new Date().getFullYear();

export default function HomePage() {
  const { data: session } = useSession();
  const { features, tier } = useSubscription();
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

  // Filter available years based on subscription
  const availableYears = features.canAccessAllYears
    ? years
    : years.filter(y => y === currentYear);

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

          {!features.canAccessAllYears && (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <div className="flex items-start gap-3">
                <Lock className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-900 text-sm">Historical Tax Years Locked</h4>
                  <p className="text-yellow-800 text-sm mt-1">
                    Upgrade to Premium to access tax calculations for 2023, 2024, and 2025.
                  </p>
                  <Link
                    href="/dashboard/subscription"
                    className="inline-block mt-2 text-sm font-medium text-yellow-900 hover:text-yellow-800 underline"
                  >
                    Unlock all years →
                  </Link>
                </div>
              </div>
            </div>
          )}

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
              <FeatureGate feature="saveCalculations">
                <button
                  onClick={handleSaveCalculation}
                  disabled={isSaving || !result}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? 'Saving...' : 'Save Calculation'}
                </button>
              </FeatureGate>

              <FeatureGate feature="exportPDF">
                <button
                  onClick={handleExportPDF}
                  disabled={isExporting || !result}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  <Download className="h-4 w-4" />
                  {isExporting ? 'Exporting...' : 'Export PDF'}
                </button>
              </FeatureGate>
            </div>
          </div>

          {tier === 'FREE' && (
            <div className="rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-bold text-gray-900">Unlock Premium</h3>
              </div>
              <ul className="space-y-2 mb-4 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">✓</span>
                  <span>Access all tax years (2023-2026)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">✓</span>
                  <span>Save unlimited calculations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">✓</span>
                  <span>Export professional PDFs</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">✓</span>
                  <span>Redundancy calculator</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">✓</span>
                  <span>Rental income calculator</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">✓</span>
                  <span>Contractor calculator</span>
                </li>
              </ul>
              <Link
                href="/dashboard/subscription"
                className="block w-full text-center px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 font-semibold text-sm"
              >
                Upgrade from €9.99/month
              </Link>
              <p className="text-xs text-gray-600 text-center mt-2">
                7-day money-back guarantee
              </p>
            </div>
          )}

          {tier === 'PREMIUM' && (
            <div className="rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Crown className="h-5 w-5 text-purple-600" />
                <h3 className="text-lg font-bold text-gray-900">Go Professional</h3>
              </div>
              <ul className="space-y-2 mb-4 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-0.5">✓</span>
                  <span>AI Tax Assistant (ChatGPT-powered)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-0.5">✓</span>
                  <span>CSV transaction imports</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-0.5">✓</span>
                  <span>Full tax return computation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-0.5">✓</span>
                  <span>Unlimited saved calculations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-0.5">✓</span>
                  <span>Priority support</span>
                </li>
              </ul>
              <Link
                href="/dashboard/subscription"
                className="block w-full text-center px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 font-semibold text-sm"
              >
                Upgrade to Professional
              </Link>
            </div>
          )}
        </div>
      </section>
      <FloatingAIChat />
    </main>
  );
}

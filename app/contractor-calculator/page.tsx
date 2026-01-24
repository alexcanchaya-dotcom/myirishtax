"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { CalculatorInput } from "@/components/CalculatorInput";
import { SelectField } from "@/components/SelectField";
import { FeatureGate } from "@/components/paywall/FeatureGate";
import { ContractorBreakdown, COMMON_EXPENSE_CATEGORIES } from "@/lib/taxEngine/contractorCalculator";
import { listSupportedYears } from "@/lib/config/taxYearConfig";
import {
  Calculator,
  TrendingUp,
  Wallet,
  Calendar,
  Info,
  Plus,
  X,
  Download,
  Save,
} from "lucide-react";
import Link from "next/link";

const years = listSupportedYears();

interface Expense {
  id: string;
  category: string;
  amount: number;
}

export default function ContractorCalculatorPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [grossIncome, setGrossIncome] = useState(80000);
  const [expenses, setExpenses] = useState<Expense[]>([
    { id: "1", category: "Office Rent", amount: 12000 },
    { id: "2", category: "Equipment & Software", amount: 3000 },
  ]);
  const [pensionContribution, setPensionContribution] = useState(0);
  const [maritalStatus, setMaritalStatus] = useState<"single" | "married">("single");
  const [taxYear, setTaxYear] = useState<number>(years[years.length - 1]);
  const [previousYearTax, setPreviousYearTax] = useState<number>(0);
  const [includePreliminaryTax, setIncludePreliminaryTax] = useState(false);
  const [result, setResult] = useState<ContractorBreakdown | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  useEffect(() => {
    const calculate = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/calc/contractor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            grossIncome,
            expenses: totalExpenses,
            pensionContribution,
            maritalStatus,
            taxYear,
            previousYearTax: includePreliminaryTax ? previousYearTax : undefined,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setResult(data.breakdown);
        } else {
          const error = await response.json();
          if (error.error === 'Authentication required') {
            router.push('/auth/login');
          } else if (error.error === 'Premium subscription required for contractor calculator') {
            router.push('/dashboard/subscription');
          }
        }
      } catch (error) {
        console.error("Calculation error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    calculate();
  }, [grossIncome, totalExpenses, pensionContribution, maritalStatus, taxYear, previousYearTax, includePreliminaryTax, router]);

  const addExpense = () => {
    setExpenses([
      ...expenses,
      { id: Date.now().toString(), category: "Other", amount: 0 },
    ]);
  };

  const removeExpense = (id: string) => {
    setExpenses(expenses.filter((exp) => exp.id !== id));
  };

  const updateExpense = (id: string, field: "category" | "amount", value: string | number) => {
    setExpenses(
      expenses.map((exp) =>
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    );
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <FeatureGate feature="contractor">
      <main className="mx-auto max-w-7xl px-4 py-10">
        <header className="flex flex-col gap-4 rounded-3xl bg-gradient-to-r from-purple-600 to-pink-600 p-8 text-white mb-8">
          <div className="flex items-center gap-3">
            <Calculator className="h-10 w-10" />
            <div>
              <h1 className="text-4xl font-bold">Contractor Tax Calculator</h1>
              <p className="text-lg mt-2">
                Calculate your self-employed income tax, USC, and Class S PRSI
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/10 rounded-lg px-4 py-2 text-sm">
            <Info className="h-4 w-4" />
            <span>
              For contractors, freelancers, and self-employed individuals in Ireland
            </span>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Inputs */}
          <div className="lg:col-span-2 space-y-6">
            {/* Income Section */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                Income & Deductions
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                <CalculatorInput
                  label="Gross Income"
                  value={grossIncome}
                  onChange={setGrossIncome}
                  prefix="€"
                />
                <CalculatorInput
                  label="Pension Contributions"
                  value={pensionContribution}
                  onChange={setPensionContribution}
                  prefix="€"
                />
                <SelectField
                  label="Marital Status"
                  value={maritalStatus}
                  onChange={(v) => setMaritalStatus(v as any)}
                  options={[
                    { label: "Single", value: "single" },
                    { label: "Married", value: "married" },
                  ]}
                />
                <SelectField
                  label="Tax Year"
                  value={taxYear}
                  onChange={(v) => setTaxYear(Number(v))}
                  options={years.map((y) => ({ label: y.toString(), value: y }))}
                />
              </div>
            </div>

            {/* Expenses Section */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-purple-600" />
                  Business Expenses
                </h2>
                <button
                  onClick={addExpense}
                  className="flex items-center gap-1 text-sm font-medium text-purple-600 hover:text-purple-700"
                >
                  <Plus className="h-4 w-4" />
                  Add Expense
                </button>
              </div>

              <div className="space-y-3">
                {expenses.map((expense) => (
                  <div key={expense.id} className="flex items-center gap-2">
                    <div className="flex-1">
                      <SelectField
                        label=""
                        value={expense.category}
                        onChange={(v) => updateExpense(expense.id, "category", v)}
                        options={COMMON_EXPENSE_CATEGORIES.map((cat) => ({
                          label: cat,
                          value: cat,
                        }))}
                      />
                    </div>
                    <div className="w-40">
                      <CalculatorInput
                        label=""
                        value={expense.amount}
                        onChange={(v) => updateExpense(expense.id, "amount", v)}
                        prefix="€"
                      />
                    </div>
                    <button
                      onClick={() => removeExpense(expense.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}

                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between items-center text-sm font-semibold">
                    <span>Total Expenses:</span>
                    <span className="text-lg text-purple-600">
                      €{totalExpenses.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Preliminary Tax Section */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  Preliminary Tax (Optional)
                </h2>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={includePreliminaryTax}
                    onChange={(e) => setIncludePreliminaryTax(e.target.checked)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Calculate</span>
                </label>
              </div>

              {includePreliminaryTax && (
                <div>
                  <CalculatorInput
                    label="Previous Year Tax Paid"
                    value={previousYearTax}
                    onChange={setPreviousYearTax}
                    prefix="€"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Preliminary tax is due by October 31. You must pay 90% of current
                    year's tax OR 100% of previous year's tax (whichever is lower).
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6">
            {isLoading && (
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            )}

            {result && !isLoading && (
              <>
                {/* Net Income Summary */}
                <div className="rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-6 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">
                    NET INCOME
                  </h3>
                  <div className="text-4xl font-bold text-gray-900 mb-4">
                    €{result.netIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <div className="text-gray-600">Monthly</div>
                      <div className="font-semibold">
                        €{result.monthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600">Weekly</div>
                      <div className="font-semibold">
                        €{result.weekly.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600">Daily</div>
                      <div className="font-semibold">
                        €{result.daily.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tax Breakdown */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-4">Tax Breakdown</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gross Income</span>
                      <span className="font-semibold">
                        €{result.grossIncome.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Business Expenses</span>
                      <span className="font-semibold text-green-600">
                        -€{result.totalExpenses.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-gray-600">Taxable Income</span>
                      <span className="font-semibold">
                        €{result.taxableIncome.toLocaleString()}
                      </span>
                    </div>

                    <div className="border-t pt-3 mt-3 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Income Tax</span>
                        <span className="font-semibold text-red-600">
                          €{result.incomeTax.total.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">USC</span>
                        <span className="font-semibold text-red-600">
                          €{result.usc.total.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">PRSI (Class S)</span>
                        <span className="font-semibold text-red-600">
                          €{result.prsi.amount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tax Credits</span>
                        <span className="font-semibold text-green-600">
                          -€{result.credits.total.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="border-t pt-3 mt-3">
                      <div className="flex justify-between text-base font-bold">
                        <span>Total Tax & PRSI</span>
                        <span className="text-red-600">
                          €{result.totalTaxAndPrsi.toLocaleString()}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Effective rate: {result.effectiveTaxRate.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preliminary Tax */}
                {result.preliminaryTax && (
                  <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-6 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Preliminary Tax Due
                    </h3>
                    <div className="text-2xl font-bold text-yellow-900 mb-2">
                      €{result.preliminaryTax.amount.toLocaleString()}
                    </div>
                    <p className="text-sm text-yellow-800">
                      Due: {result.preliminaryTax.dueDate}
                    </p>
                    <p className="text-xs text-yellow-700 mt-2">
                      Based on {result.preliminaryTax.method === 'current_year' ? '90% of current year' : '100% of previous year'}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm space-y-2">
                  <FeatureGate feature="saveCalculations">
                    <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 text-sm font-medium">
                      <Save className="h-4 w-4" />
                      Save Calculation
                    </button>
                  </FeatureGate>
                  <FeatureGate feature="exportPDF">
                    <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 text-sm font-medium">
                      <Download className="h-4 w-4" />
                      Export PDF
                    </button>
                  </FeatureGate>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 rounded-xl border border-blue-200 bg-blue-50 p-6">
          <h3 className="font-semibold text-blue-900 mb-3">
            Contractor Tax Information
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-semibold mb-1">Income Tax</h4>
              <p>
                Calculated on profits (income minus expenses) using standard Irish tax
                bands: 20% and 40%
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Class S PRSI</h4>
              <p>
                Self-employed PRSI at 4% on income over €5,000. Does not provide
                unemployment benefits.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Tax Credits</h4>
              <p>
                Self-employed individuals get the Personal Tax Credit but not the PAYE
                credit.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Preliminary Tax</h4>
              <p>
                Must be paid by October 31. Pay 90% of current year OR 100% of previous
                year (lower amount).
              </p>
            </div>
          </div>
        </div>
      </main>
    </FeatureGate>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { CalculatorInput } from "@/components/CalculatorInput";
import { SelectField } from "@/components/SelectField";
import { FeatureGate } from "@/components/paywall/FeatureGate";
import { RentalBreakdown } from "@/lib/taxEngine/rentalCalculator";
import { listSupportedYears } from "@/lib/config/taxYearConfig";
import {
  Home,
  TrendingUp,
  Wallet,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Download,
  Save,
  Info,
} from "lucide-react";

const years = listSupportedYears();

export default function RentalCalculatorPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [grossRentalIncome, setGrossRentalIncome] = useState(24000);
  const [mortgageInterest, setMortgageInterest] = useState(8000);
  const [insurancePremiums, setInsurancePremiums] = useState(800);
  const [repairs, setRepairs] = useState(1500);
  const [managementFees, setManagementFees] = useState(2400);
  const [accountingFees, setAccountingFees] = useState(500);
  const [legalFees, setLegalFees] = useState(0);
  const [advertisingCosts, setAdvertisingCosts] = useState(200);
  const [lptPropertyTax, setLptPropertyTax] = useState(300);
  const [otherExpenses, setOtherExpenses] = useState(500);
  const [preLettingExpenses, setPreLettingExpenses] = useState(0);
  const [otherIncome, setOtherIncome] = useState(0);
  const [maritalStatus, setMaritalStatus] = useState<"single" | "married">("single");
  const [taxYear, setTaxYear] = useState<number>(years[years.length - 1]);
  const [result, setResult] = useState<RentalBreakdown | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const calculate = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/calc/rental", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            grossRentalIncome,
            mortgageInterest,
            insurancePremiums,
            repairs,
            managementFees,
            accountingFees,
            legalFees,
            advertisingCosts,
            lptPropertyTax,
            otherExpenses,
            preLettingExpenses,
            otherIncome,
            maritalStatus,
            taxYear,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setResult(data.breakdown);
        } else {
          const error = await response.json();
          if (error.error === 'Authentication required') {
            router.push('/auth/login');
          } else if (error.error === 'Premium subscription required for rental calculator') {
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
  }, [
    grossRentalIncome,
    mortgageInterest,
    insurancePremiums,
    repairs,
    managementFees,
    accountingFees,
    legalFees,
    advertisingCosts,
    lptPropertyTax,
    otherExpenses,
    preLettingExpenses,
    otherIncome,
    maritalStatus,
    taxYear,
    router,
  ]);

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
    <FeatureGate feature="rental">
      <main className="mx-auto max-w-7xl px-4 py-10">
        <header className="flex flex-col gap-4 rounded-3xl bg-gradient-to-r from-green-600 to-emerald-600 p-8 text-white mb-8">
          <div className="flex items-center gap-3">
            <Home className="h-10 w-10" />
            <div>
              <h1 className="text-4xl font-bold">Rental Income Tax Calculator</h1>
              <p className="text-lg mt-2">
                Calculate tax on your rental income with deductible expenses
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/10 rounded-lg px-4 py-2 text-sm">
            <Info className="h-4 w-4" />
            <span>
              For Irish landlords - includes Rental Tax Credit and expense deductions
            </span>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Inputs */}
          <div className="lg:col-span-2 space-y-6">
            {/* Income Section */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Rental Income
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <CalculatorInput
                    label="Gross Annual Rental Income"
                    value={grossRentalIncome}
                    onChange={setGrossRentalIncome}
                    prefix="€"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Total rent received from tenants per year
                  </p>
                </div>
                <CalculatorInput
                  label="Other Income (Optional)"
                  value={otherIncome}
                  onChange={setOtherIncome}
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
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Wallet className="h-5 w-5 text-green-600" />
                Deductible Expenses
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <CalculatorInput
                    label="Mortgage Interest"
                    value={mortgageInterest}
                    onChange={setMortgageInterest}
                    prefix="€"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    75% of this is deductible
                  </p>
                </div>
                <CalculatorInput
                  label="Property Insurance"
                  value={insurancePremiums}
                  onChange={setInsurancePremiums}
                  prefix="€"
                />
                <CalculatorInput
                  label="Repairs & Maintenance"
                  value={repairs}
                  onChange={setRepairs}
                  prefix="€"
                />
                <CalculatorInput
                  label="Management Fees"
                  value={managementFees}
                  onChange={setManagementFees}
                  prefix="€"
                />
                <CalculatorInput
                  label="Accounting Fees"
                  value={accountingFees}
                  onChange={setAccountingFees}
                  prefix="€"
                />
                <CalculatorInput
                  label="Legal Fees"
                  value={legalFees}
                  onChange={setLegalFees}
                  prefix="€"
                />
                <CalculatorInput
                  label="Advertising Costs"
                  value={advertisingCosts}
                  onChange={setAdvertisingCosts}
                  prefix="€"
                />
                <CalculatorInput
                  label="Pre-letting Expenses"
                  value={preLettingExpenses}
                  onChange={setPreLettingExpenses}
                  prefix="€"
                />
                <CalculatorInput
                  label="Other Expenses"
                  value={otherExpenses}
                  onChange={setOtherExpenses}
                  prefix="€"
                />
              </div>
            </div>

            {/* Non-Deductible Expenses */}
            <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                Non-Deductible (But Payable)
              </h2>
              <div>
                <CalculatorInput
                  label="Local Property Tax (LPT)"
                  value={lptPropertyTax}
                  onChange={setLptPropertyTax}
                  prefix="€"
                />
                <p className="text-xs text-yellow-700 mt-1">
                  LPT is not tax deductible but must be paid
                </p>
              </div>
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
                <div className={`rounded-xl border-2 p-6 shadow-sm ${
                  result.isLoss
                    ? 'border-red-200 bg-gradient-to-br from-red-50 to-pink-50'
                    : 'border-green-200 bg-gradient-to-br from-green-50 to-emerald-50'
                }`}>
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">
                    {result.isLoss ? 'ANNUAL LOSS' : 'NET INCOME (After Tax)'}
                  </h3>
                  <div className={`text-4xl font-bold mb-4 ${
                    result.isLoss ? 'text-red-600' : 'text-gray-900'
                  }`}>
                    {result.isLoss && '-'}€{Math.abs(result.netIncomeAfterTax).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </div>
                  {!result.isLoss && (
                    <div className="text-sm">
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-600">Monthly</span>
                        <span className="font-semibold">
                          €{result.monthly.netIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        Effective tax rate: {result.effectiveTaxRate.toFixed(1)}%
                      </div>
                    </div>
                  )}
                  {result.isLoss && (
                    <p className="text-sm text-red-700">
                      Rental loss can be carried forward to future years
                    </p>
                  )}
                </div>

                {/* Profit/Loss Calculation */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-4">Calculation</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gross Rental Income</span>
                      <span className="font-semibold">
                        €{result.grossRentalIncome.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Deductible Expenses</span>
                      <span className="font-semibold text-red-600">
                        -€{result.totalDeductibleExpenses.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-gray-600 font-semibold">Net Rental Profit</span>
                      <span className={`font-bold ${
                        result.isLoss ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {result.isLoss && '-'}€{Math.abs(result.netRentalProfit).toLocaleString()}
                      </span>
                    </div>

                    {!result.isLoss && (
                      <>
                        <div className="border-t pt-3 mt-3 space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tax on Rental @ {(result.marginalRate * 100)}%</span>
                            <span className="font-semibold text-red-600">
                              €{result.taxOnRental.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Rental Tax Credit</span>
                            <span className="font-semibold text-green-600">
                              -€{result.rentalTaxCredit.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between font-bold border-t pt-2">
                            <span>Tax Due</span>
                            <span className="text-red-600">
                              €{result.taxAfterCredit.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div className="border-t pt-3 mt-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Non-deductible Expenses</span>
                            <span className="font-semibold text-red-600">
                              €{result.totalNonDeductibleExpenses.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Expense Breakdown */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Expense Breakdown
                  </h3>
                  <div className="space-y-2 text-sm">
                    {result.deductibleExpenses.map((expense, idx) => (
                      <div key={idx} className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-1 flex-1">
                          <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <div className="text-gray-700">{expense.category}</div>
                            {expense.notes && (
                              <div className="text-xs text-gray-500">{expense.notes}</div>
                            )}
                          </div>
                        </div>
                        <span className="font-semibold text-gray-900">
                          €{expense.amount.toLocaleString()}
                        </span>
                      </div>
                    ))}

                    {result.nonDeductibleExpenses.length > 0 && (
                      <>
                        <div className="border-t pt-2 mt-2"></div>
                        {result.nonDeductibleExpenses.map((expense, idx) => (
                          <div key={idx} className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-1 flex-1">
                              <XCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <div className="text-gray-700">{expense.category}</div>
                                {expense.notes && (
                                  <div className="text-xs text-gray-500">{expense.notes}</div>
                                )}
                              </div>
                            </div>
                            <span className="font-semibold text-gray-900">
                              €{expense.amount.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>

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
        <div className="mt-8 rounded-xl border border-green-200 bg-green-50 p-6">
          <h3 className="font-semibold text-green-900 mb-3">
            Rental Income Tax Information
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-green-800">
            <div>
              <h4 className="font-semibold mb-1">Tax Rate</h4>
              <p>
                Rental income is taxed at your marginal rate (20% or 40%) based on your total income.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Rental Tax Credit</h4>
              <p>
                Landlords qualify for a €600 tax credit against rental income tax.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Mortgage Interest</h4>
              <p>
                Only 75% of mortgage interest is deductible since 2019. The remaining 25% is not deductible.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Rental Losses</h4>
              <p>
                Losses can be carried forward to offset future rental profits but cannot be offset against other income.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Deductible Expenses</h4>
              <p>
                Repairs (not improvements), insurance, management fees, accounting fees, and pre-letting expenses are fully deductible.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Local Property Tax</h4>
              <p>
                LPT is NOT tax deductible but must still be paid annually to the Local Authority.
              </p>
            </div>
          </div>
        </div>
      </main>
    </FeatureGate>
  );
}

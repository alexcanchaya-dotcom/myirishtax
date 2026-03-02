"use client";

import { useState, useMemo } from "react";
import { CalculatorInput } from "@/components/CalculatorInput";
import { SelectField } from "@/components/SelectField";
import {
  Shield,
  TrendingUp,
  Info,
  CheckCircle,
  AlertCircle,
  PiggyBank,
  Calendar,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  calculateAutoEnrolment,
  AutoEnrolmentBreakdown,
} from "@/lib/taxEngine/autoEnrolmentCalculator";

// Retirement age options: 60–70
const retirementAgeOptions = Array.from({ length: 11 }, (_, i) => ({
  label: `${60 + i} years old`,
  value: 60 + i,
}));

// Investment return options
const investmentReturnOptions = [
  { label: "3% — Conservative", value: 3 },
  { label: "5% — Moderate (default)", value: 5 },
  { label: "7% — Growth", value: 7 },
];

// Milestone years to show in the summary table
const MILESTONE_YEARS = [5, 10, 15, 20, 25, 30, 35, 40];

function fmt(n: number, decimals = 0): string {
  return n.toLocaleString("en-IE", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function fmtEuro(n: number, decimals = 0): string {
  return `€${fmt(n, decimals)}`;
}

export default function AutoEnrolmentCalculatorPage() {
  const [annualSalary, setAnnualSalary] = useState(50000);
  const [age, setAge] = useState(30);
  const [retirementAge, setRetirementAge] = useState(66);
  const [existingPensionPot, setExistingPensionPot] = useState(0);
  const [investmentReturnRate, setInvestmentReturnRate] = useState(5);
  const [showFullTable, setShowFullTable] = useState(false);

  const result: AutoEnrolmentBreakdown = useMemo(
    () =>
      calculateAutoEnrolment({
        annualSalary,
        age,
        currentYear: 2026,
        retirementAge,
        existingPensionPot,
        investmentReturnRate,
      }),
    [annualSalary, age, retirementAge, existingPensionPot, investmentReturnRate]
  );

  // Milestone rows — pick the closest year to each milestone from yearlyBreakdown
  const milestoneRows = useMemo(() => {
    if (!result.yearlyBreakdown.length) return [];
    return MILESTONE_YEARS.flatMap((offset) => {
      const target = 2026 + offset - 1;
      const row = result.yearlyBreakdown.find((r) => r.year === target);
      return row ? [row] : [];
    });
  }, [result.yearlyBreakdown]);

  const yearsToRetirement = Math.max(0, retirementAge - age);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      {/* ── Header ── */}
      <header className="flex flex-col gap-4 rounded-3xl bg-gradient-to-r from-green-600 to-emerald-600 p-8 text-white mb-8">
        <div className="flex items-center gap-3">
          <Shield className="h-10 w-10 flex-shrink-0" />
          <div>
            <h1 className="text-4xl font-bold">Auto-Enrolment Pension Calculator</h1>
            <p className="text-lg mt-2">
              My Future Fund — Ireland's new workplace pension scheme, launched January 2026
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white/10 rounded-lg px-4 py-2 text-sm">
          <Info className="h-4 w-4 flex-shrink-0" />
          <span>
            Free to use · For every €3 you save, your employer adds €3 and the State adds €1 — €7
            total for every €3 of your own money
          </span>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ── Left Column — Inputs ── */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              Your Details
            </h2>
            <div className="space-y-4">
              <CalculatorInput
                label="Annual Salary (€)"
                value={annualSalary}
                onChange={setAnnualSalary}
                prefix="€"
              />
              <CalculatorInput
                label="Your Age"
                value={age}
                onChange={setAge}
              />
              <SelectField
                label="Retirement Age"
                value={retirementAge}
                onChange={(v) => setRetirementAge(Number(v))}
                options={retirementAgeOptions}
              />
              <CalculatorInput
                label="Existing Pension Savings (€)"
                value={existingPensionPot}
                onChange={setExistingPensionPot}
                prefix="€"
              />
              <SelectField
                label="Expected Investment Return"
                value={investmentReturnRate}
                onChange={(v) => setInvestmentReturnRate(Number(v))}
                options={investmentReturnOptions}
              />
            </div>
          </div>

          {/* Eligibility status */}
          <div
            className={`rounded-xl border p-5 shadow-sm ${
              result.isEligible
                ? "border-emerald-200 bg-emerald-50"
                : "border-amber-200 bg-amber-50"
            }`}
          >
            <div className="flex items-start gap-3">
              {result.isEligible ? (
                <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <h3
                  className={`font-semibold text-sm ${
                    result.isEligible ? "text-emerald-900" : "text-amber-900"
                  }`}
                >
                  {result.isEligible ? "Eligible for Auto-Enrolment" : "Not Eligible"}
                </h3>
                {result.eligibilityReason && (
                  <p
                    className={`text-sm mt-1 ${
                      result.isEligible ? "text-emerald-800" : "text-amber-800"
                    }`}
                  >
                    {result.eligibilityReason}
                  </p>
                )}
                {result.isEligible && (
                  <p className="text-sm mt-1 text-emerald-800">
                    You meet the eligibility criteria: age 23–60, earning ≥ €20,000/year.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* The 3-for-7 card */}
          <div className="rounded-xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <PiggyBank className="h-5 w-5 text-emerald-600" />
              <h3 className="font-bold text-gray-900">For every €3 you save, you get €7</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-700">You contribute</span>
                <span className="font-semibold text-gray-900">
                  {fmtEuro(result.employeeContribution)}/yr
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Employer adds</span>
                <span className="font-semibold text-emerald-700">
                  +{fmtEuro(result.employerContribution)}/yr
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">State adds</span>
                <span className="font-semibold text-emerald-700">
                  +{fmtEuro(result.stateContribution)}/yr
                </span>
              </div>
              <div className="flex justify-between border-t pt-2 mt-2">
                <span className="font-semibold text-gray-900">Total going in</span>
                <span className="font-bold text-emerald-700 text-base">
                  {fmtEuro(result.totalAnnualContribution)}/yr
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                After €28.60/yr admin fee. Based on {investmentReturnRate}% annual return,{" "}
                {yearsToRetirement} years to retirement.
              </p>
            </div>
          </div>
        </div>

        {/* ── Right Column — Results ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero: projected monthly pension */}
          <div className="rounded-xl border-2 border-emerald-300 bg-gradient-to-br from-green-50 to-emerald-100 p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-600 mb-1 uppercase tracking-wide">
              Projected Monthly Pension at Retirement (Age {retirementAge})
            </h3>
            <div className="text-5xl font-bold text-emerald-700 mb-4">
              {fmtEuro(result.projectedMonthlyPension)}
              <span className="text-2xl text-emerald-600 font-medium">/mo</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-gray-500">Annual pension</div>
                <div className="font-semibold text-gray-900">
                  {fmtEuro(result.projectedAnnualPension)}
                </div>
              </div>
              <div>
                <div className="text-gray-500">Pension pot</div>
                <div className="font-semibold text-gray-900">
                  {fmtEuro(result.projectedPot)}
                </div>
              </div>
              <div>
                <div className="text-gray-500">Years investing</div>
                <div className="font-semibold text-gray-900">{yearsToRetirement} yrs</div>
              </div>
              <div>
                <div className="text-gray-500">Return rate</div>
                <div className="font-semibold text-gray-900">{investmentReturnRate}% p.a.</div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Based on the 4% safe withdrawal rate. Projection assumes salary, contribution rates,
              and investment returns remain constant. This is an estimate, not a guarantee.
            </p>
          </div>

          {/* Contribution breakdown card */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-emerald-600" />
              Current Year Contribution Breakdown (2026)
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Your salary (capped at €80,000)</span>
                  <span className="font-semibold">{fmtEuro(result.cappedSalary)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-600">Employee (you) — 1.5%</span>
                  <span className="font-semibold">{fmtEuro(result.employeeContribution)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-600">Employer match — 1.5%</span>
                  <span className="font-semibold text-emerald-600">
                    {fmtEuro(result.employerContribution)}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-600">State top-up — 0.5%</span>
                  <span className="font-semibold text-emerald-600">
                    {fmtEuro(result.stateContribution)}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-600">Admin fee (55c/week)</span>
                  <span className="font-semibold text-red-500">−€28.60</span>
                </div>
                <div className="flex justify-between py-2 border-t border-gray-200 font-semibold">
                  <span>Net total into your fund</span>
                  <span className="text-emerald-700 text-base">
                    {fmtEuro(result.totalAnnualContribution)}
                  </span>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Your monthly cost</span>
                  <span className="font-semibold">{fmtEuro(result.employeeMonthly)}/mo</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-600">Your weekly cost</span>
                  <span className="font-semibold">{fmtEuro(result.employeeWeekly, 2)}/wk</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-600">Take-home reduction/year</span>
                  <span className="font-semibold text-red-500">
                    −{fmtEuro(result.currentNetReduction)}
                  </span>
                </div>
                <div className="mt-4 rounded-lg bg-emerald-50 border border-emerald-100 p-3 text-xs text-emerald-800">
                  <strong>Good news:</strong> Employee contributions to Auto-Enrolment do not
                  qualify for income tax relief (unlike private pensions), but your employer and
                  the State add an extra {fmtEuro(result.employerContribution + result.stateContribution)} per year at no extra cost to you.
                </div>
              </div>
            </div>
          </div>

          {/* Total contributions summary */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">
              Projected Pot Breakdown at Retirement
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="rounded-lg bg-blue-50 border border-blue-100 p-3 text-center">
                <div className="text-xs text-blue-600 mb-1 font-medium">Your Contributions</div>
                <div className="font-bold text-blue-800 text-lg">
                  {fmtEuro(result.totalEmployeeContributions)}
                </div>
              </div>
              <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-3 text-center">
                <div className="text-xs text-emerald-600 mb-1 font-medium">Employer Total</div>
                <div className="font-bold text-emerald-800 text-lg">
                  {fmtEuro(result.totalEmployerContributions)}
                </div>
              </div>
              <div className="rounded-lg bg-green-50 border border-green-100 p-3 text-center">
                <div className="text-xs text-green-600 mb-1 font-medium">State Total</div>
                <div className="font-bold text-green-800 text-lg">
                  {fmtEuro(result.totalStateContributions)}
                </div>
              </div>
              <div className="rounded-lg bg-purple-50 border border-purple-100 p-3 text-center">
                <div className="text-xs text-purple-600 mb-1 font-medium">Investment Growth</div>
                <div className="font-bold text-purple-800 text-lg">
                  {fmtEuro(result.totalInvestmentGrowth)}
                </div>
              </div>
            </div>
          </div>

          {/* Pension pot over time — milestone table */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              Your Pension Pot Over Time
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Key milestone years based on {investmentReturnRate}% annual return
            </p>
            {result.yearlyBreakdown.length === 0 ? (
              <p className="text-sm text-gray-500 italic">
                Adjust your age and retirement age to see projections.
              </p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 text-gray-600 font-medium">Year</th>
                        <th className="text-left py-2 text-gray-600 font-medium">Age</th>
                        <th className="text-left py-2 text-gray-600 font-medium">
                          Emp / Emplr / State
                        </th>
                        <th className="text-right py-2 text-gray-600 font-medium">Annual In</th>
                        <th className="text-right py-2 text-gray-600 font-medium">Pot Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(showFullTable ? result.yearlyBreakdown : milestoneRows).map((row) => (
                        <tr
                          key={row.year}
                          className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-2 font-medium text-gray-900">{row.year}</td>
                          <td className="py-2 text-gray-700">{row.age}</td>
                          <td className="py-2 text-gray-600 text-xs">
                            {row.employeeRate} / {row.employerRate} / {row.stateRate}
                          </td>
                          <td className="py-2 text-right font-medium">
                            {fmtEuro(row.totalContribution)}
                          </td>
                          <td className="py-2 text-right font-bold text-emerald-700">
                            {fmtEuro(row.cumulativePot)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {result.yearlyBreakdown.length > milestoneRows.length && (
                  <button
                    onClick={() => setShowFullTable((v) => !v)}
                    className="mt-3 flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    {showFullTable ? (
                      <>
                        <ChevronUp className="h-4 w-4" /> Show milestones only
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" /> Show all{" "}
                        {result.yearlyBreakdown.length} years
                      </>
                    )}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── SEO / Info Section ── */}
      <section className="mt-10 space-y-6">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6">
          <h2 className="text-xl font-bold text-emerald-900 mb-2">
            What is My Future Fund? Ireland's Auto-Enrolment Explained
          </h2>
          <p className="text-emerald-800 text-sm leading-relaxed">
            My Future Fund is Ireland's mandatory workplace pension scheme that launched on{" "}
            <strong>1 January 2026</strong>. It automatically enrols eligible employees who don't
            already have a workplace pension, covering an estimated{" "}
            <strong>760,000–800,000 workers</strong>. For the first time, private-sector employees
            who were previously saving nothing for retirement are now being helped to build a
            pension pot — with contributions matched by their employer and topped up by the State.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-3">Who is Eligible?</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Aged <strong>23 to 60</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Earning <strong>€20,000 or more</strong> per year</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Not already enrolled in a qualifying workplace pension</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Self-employed are not included</strong> — this scheme is for PAYE
                  employees only
                </span>
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-3">Opt-Out Rules</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <span>
                  You must remain enrolled for <strong>at least 6 months</strong>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <span>
                  You can opt out during <strong>months 7 and 8</strong> after enrolment
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <span>
                  If you opt out, you will be <strong>automatically re-enrolled after 2 years</strong>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <span>
                  You can <strong>suspend contributions</strong> after 6 months for up to 2 years
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Contribution rates table */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-1">
            Phased Contribution Rates (2026–2035+)
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Contributions are calculated on earnings up to €80,000. Rates increase gradually to
            give workers time to adjust.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-2 pr-4 text-gray-700 font-semibold">Period</th>
                  <th className="text-center py-2 px-4 text-gray-700 font-semibold">Employee</th>
                  <th className="text-center py-2 px-4 text-gray-700 font-semibold">Employer</th>
                  <th className="text-center py-2 px-4 text-gray-700 font-semibold">State</th>
                  <th className="text-center py-2 px-4 text-gray-700 font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { period: "2026–2028 (Years 1–3)", emp: "1.5%", emplr: "1.5%", state: "0.5%", total: "3.5%" },
                  { period: "2029–2031 (Years 4–6)", emp: "3%", emplr: "3%", state: "1%", total: "7%" },
                  { period: "2032–2034 (Years 7–9)", emp: "4.5%", emplr: "4.5%", state: "1.5%", total: "10.5%" },
                  { period: "2035+ (Year 10+)", emp: "6%", emplr: "6%", state: "2%", total: "14%" },
                ].map((row) => (
                  <tr key={row.period} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 pr-4 text-gray-700">{row.period}</td>
                    <td className="py-3 px-4 text-center font-semibold text-blue-700">{row.emp}</td>
                    <td className="py-3 px-4 text-center font-semibold text-emerald-700">
                      {row.emplr}
                    </td>
                    <td className="py-3 px-4 text-center font-semibold text-green-700">
                      {row.state}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-gray-900">{row.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Key facts */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Key Facts About My Future Fund</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Earnings Cap</h4>
              <p>
                Contributions are only calculated on the first €80,000 of your annual salary.
                Earnings above this threshold are ignored for contribution purposes.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Fund Managers</h4>
              <p>
                Your fund will be managed by one of three approved providers:{" "}
                <strong>Irish Life, Amundi,</strong> or <strong>BlackRock</strong>. You will be
                assigned a default manager but may switch.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Admin Fee</h4>
              <p>
                A 55 cent per week (€28.60 per year) administration fee is deducted from your
                fund. This covers the cost of running the central processing authority.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Why It Matters</h4>
              <p>
                Ireland has one of the lowest private pension coverage rates in Europe. Auto-enrolment
                is designed to close this gap, ensuring that workers who previously had no pension
                savings can build a meaningful retirement fund with the help of their employer and
                the State.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Tax Treatment</h4>
              <p>
                Unlike private pension contributions, auto-enrolment employee contributions do{" "}
                <strong>not</strong> qualify for income tax relief. Instead, the benefit comes from
                the employer match and State top-up, which are exempt from tax on the way in.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">At Retirement</h4>
              <p>
                Your pot can be drawn down from retirement age. Benefits are subject to standard
                income tax rules at drawdown. You can take part of the fund as a tax-free lump sum
                under certain conditions.
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-4">
            This calculator is for illustrative purposes only. Projections are not guaranteed.
            Consult a qualified financial advisor for personalised pension advice.
            Information based on legislation effective January 2026.
          </p>
        </div>
      </section>
    </main>
  );
}

'use client';

import { useState, useMemo } from 'react';
import { CalculatorInput } from '@/components/CalculatorInput';
import { SelectField } from '@/components/SelectField';
import { Home, Info, CheckCircle, AlertCircle, Calendar, ArrowRight } from 'lucide-react';

// ─── Rent Tax Credit rates ────────────────────────────────────────────────
type FilingStatus = 'single' | 'jointly';

interface RentCreditConfig {
  single: number;
  jointly: number;
}

const RENT_CREDIT_RATES: Record<number, RentCreditConfig> = {
  2022: { single: 500, jointly: 1000 },
  2023: { single: 500, jointly: 1000 },
  2024: { single: 1000, jointly: 2000 },
  2025: { single: 1000, jointly: 2000 },
  2026: { single: 1000, jointly: 2000 },
};

const TAX_YEARS = [2022, 2023, 2024, 2025, 2026];

// ─── Calculator logic ─────────────────────────────────────────────────────
function calcRentCredit(
  annualRent: number,
  taxYear: number,
  filingStatus: FilingStatus,
  numTenants: number,
): {
  twentyPercent: number;
  maxCredit: number;
  creditClaimed: number;
} {
  const rates = RENT_CREDIT_RATES[taxYear] ?? RENT_CREDIT_RATES[2026];
  const maxCredit = filingStatus === 'jointly' ? rates.jointly : rates.single;
  // Each tenant claims based on total rent paid (they are not required to divide)
  const twentyPercent = Math.round(annualRent * 0.2);
  const creditClaimed = Math.min(twentyPercent, maxCredit);
  return { twentyPercent, maxCredit, creditClaimed };
}

function calcAllYearsTotal(
  annualRent: number,
  filingStatus: FilingStatus,
): number {
  return TAX_YEARS.reduce((sum, year) => {
    const { creditClaimed } = calcRentCredit(annualRent, year, filingStatus, 1);
    return sum + creditClaimed;
  }, 0);
}

// ─── Component ──────────────────────────────────────────────────────────────────
export default function RentTaxCreditPage() {
  const [annualRent, setAnnualRent] = useState<number>(18000);
  const [taxYear, setTaxYear] = useState<number>(2025);
  const [filingStatus, setFilingStatus] = useState<FilingStatus>('single');
  const [numTenants, setNumTenants] = useState<number>(1);

  const result = useMemo(
    () => calcRentCredit(annualRent, taxYear, filingStatus, numTenants),
    [annualRent, taxYear, filingStatus, numTenants],
  );

  const allYearsTotal = useMemo(
    () => calcAllYearsTotal(annualRent, filingStatus),
    [annualRent, filingStatus],
  );

  const fmt = (n: number) =>
    `€${Math.round(n).toLocaleString('en-IE')}`;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      {/* ── Header ── */}
      <header className="flex flex-col gap-4 rounded-3xl bg-gradient-to-r from-orange-500 to-amber-500 p-8 text-white mb-8">
        <div className="flex items-center gap-3">
          <Home className="h-10 w-10" />
          <div>
            <h1 className="text-4xl font-bold">Rent Tax Credit Calculator</h1>
            <p className="text-lg mt-2">
              Calculate how much Rent Tax Credit you can claim for 2022–2026
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white/10 rounded-lg px-4 py-2 text-sm">
          <Info className="h-4 w-4 flex-shrink-0" />
          <span>
            Introduced in Budget 2023 and extended to 2028 in Budget 2026. Free to use — no sign-up required.
          </span>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ── Left column: Inputs ── */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Home className="h-5 w-5 text-orange-500" />
              Your Rental Details
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <CalculatorInput
                label="Annual Rent Paid (€)"
                value={annualRent}
                onChange={setAnnualRent}
                prefix="€"
              />
              <SelectField
                label="Tax Year"
                value={taxYear}
                onChange={(v) => setTaxYear(Number(v))}
                options={TAX_YEARS.map((y) => ({ label: y.toString(), value: y }))}
              />
              <SelectField
                label="Filing Status"
                value={filingStatus}
                onChange={(v) => setFilingStatus(v as FilingStatus)}
                options={[
                  { label: 'Single', value: 'single' },
                  { label: 'Jointly Assessed Couple', value: 'jointly' },
                ]}
              />
              <CalculatorInput
                label="Number of tenants claiming"
                value={numTenants}
                onChange={(v) => setNumTenants(Math.max(1, Math.round(v)))}
                prefix=""
              />
            </div>
            {numTenants > 1 && (
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 flex items-start gap-2">
                <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>
                  Each tenant in shared accommodation claims the credit independently based on the <strong>total rent</strong> — you do not divide the rent between tenants for the purpose of this credit.
                </span>
              </div>
            )}
          </div>

          {/* ── Calculation breakdown ── */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              How your credit is calculated
            </h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-sm flex-wrap">
              <div className="rounded-lg bg-orange-50 border border-orange-200 px-3 py-2 text-orange-900 font-medium">
                You paid {fmt(annualRent)} in rent
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 hidden sm:block" />
              <div className="rounded-lg bg-orange-50 border border-orange-200 px-3 py-2 text-orange-900 font-medium">
                20% = {fmt(result.twentyPercent)}
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 hidden sm:block" />
              <div className="rounded-lg bg-orange-50 border border-orange-200 px-3 py-2 text-orange-900 font-medium">
                Capped at {fmt(result.maxCredit)}
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 hidden sm:block" />
              <div className="rounded-lg bg-green-100 border border-green-300 px-3 py-2 text-green-900 font-bold">
                Credit = {fmt(result.creditClaimed)}
              </div>
            </div>

            <div className="mt-4 space-y-2 text-sm text-gray-600">
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span>Annual rent paid</span>
                <span className="font-semibold text-gray-900">{fmt(annualRent)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span>20% of rent</span>
                <span className="font-semibold text-gray-900">{fmt(result.twentyPercent)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span>
                  Maximum credit ({taxYear},{' '}
                  {filingStatus === 'jointly' ? 'jointly assessed' : 'single'})
                </span>
                <span className="font-semibold text-gray-900">{fmt(result.maxCredit)}</span>
              </div>
              <div className="flex justify-between py-1 font-bold text-base text-gray-900">
                <span>Credit you can claim ({taxYear})</span>
                <span className="text-green-700">{fmt(result.creditClaimed)}</span>
              </div>
            </div>
          </div>

          {/* ── All years unclaimed ── */}
          <div className="rounded-xl border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-orange-500" />
              Unclaimed credits across all years
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              If you haven't claimed for 2022–2026, here's what you could still recover.
            </p>
            <div className="grid grid-cols-5 gap-2 mb-4">
              {TAX_YEARS.map((year) => {
                const { creditClaimed } = calcRentCredit(annualRent, year, filingStatus, numTenants);
                return (
                  <div
                    key={year}
                    className={`rounded-lg p-3 text-center border ${
                      year === taxYear
                        ? 'border-orange-400 bg-orange-100'
                        : 'border-orange-200 bg-white'
                    }`}
                  >
                    <div className="text-xs font-semibold text-gray-500 mb-1">{year}</div>
                    <div className="text-sm font-bold text-orange-700">{fmt(creditClaimed)}</div>
                  </div>
                );
              })}
            </div>
            <div className="rounded-lg bg-orange-500 text-white px-4 py-3 flex items-center justify-between">
              <span className="font-semibold">You could claim up to</span>
              <span className="text-2xl font-bold">{fmt(allYearsTotal)}</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Amounts shown per tenant. You have 4 years from the end of each tax year to make a claim.
            </p>
          </div>
        </div>

        {/* ── Right column: Hero result + notes ── */}
        <div className="space-y-6">
          {/* Hero card */}
          <div className="rounded-xl border-2 border-orange-300 bg-gradient-to-br from-orange-50 to-amber-50 p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Your {taxYear} Credit
            </h3>
            <div className="text-5xl font-bold text-orange-600 mb-1">
              {fmt(result.creditClaimed)}
            </div>
            <p className="text-sm text-gray-600">
              Tax credit claimable for {taxYear}
            </p>
            <div className="mt-4 pt-4 border-t border-orange-200 text-sm text-gray-700 space-y-1">
              <div className="flex justify-between">
                <span>Potential tax saving</span>
                <span className="font-semibold text-green-700">{fmt(result.creditClaimed)}</span>
              </div>
              <div className="flex justify-between">
                <span>Monthly equivalent</span>
                <span className="font-semibold">
                  {fmt(result.creditClaimed / 12)}/mo
                </span>
              </div>
            </div>
          </div>

          {/* Key facts */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-3">
            <h3 className="font-semibold text-gray-900 text-sm">Key Facts</h3>
            {[
              { year: '2022–2023', single: '€500', jointly: '€1,000' },
              { year: '2024–2026', single: '€1,000', jointly: '€2,000' },
            ].map((row) => (
              <div key={row.year} className="text-xs rounded-lg bg-gray-50 border border-gray-100 p-3">
                <div className="font-semibold text-gray-700 mb-1">{row.year}</div>
                <div className="flex justify-between text-gray-600">
                  <span>Single: <strong>{row.single}</strong></span>
                  <span>Couple: <strong>{row.jointly}</strong></span>
                </div>
              </div>
            ))}
            <p className="text-xs text-gray-500">
              Credit = 20% of rent, capped at the limit above. Non-refundable — cannot reduce tax below zero.
            </p>
          </div>

          {/* How to claim */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900 text-sm mb-3">How to claim</h3>
            <div className="space-y-2 text-xs text-gray-700">
              <div className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span><strong>PAYE workers:</strong> Claim via MyAccount on Revenue.ie under "Manage your tax 20XX"</span>
              </div>
              <div className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span><strong>Self-assessed:</strong> Claim on your annual Form 11 via ROS</span>
              </div>
              <div className="flex gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <span><strong>Deadline:</strong> 4 years from the end of the tax year (e.g., 2022 claims expire 31 Dec 2026)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── SEO / Info Section ── */}
      <section className="mt-10 space-y-6">
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">About the Rent Tax Credit</h2>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-700">

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">What is the Rent Tax Credit?</h3>
              <p>
                The Rent Tax Credit is an income tax credit for people who pay rent on their private
                residential accommodation. It was introduced from 1 January 2022 as part of the
                Government's housing cost relief measures and extended through to 2028 in Budget 2026.
                It is worth up to €1,000 per year for a single person, or €2,000 for a jointly
                assessed couple (for 2024 onwards).
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Eligibility criteria</h3>
              <ul className="space-y-1">
                {[
                  'You pay rent for private rented accommodation',
                  'Your tenancy is registered with the Residential Tenancies Board (RTB)',
                  'You are not receiving the Housing Assistance Payment (HAP), Rental Accommodation Scheme (RAS), or similar state housing support',
                  'The landlord is not a local authority or approved housing body',
                  'You are an Irish income tax payer',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">What accommodation qualifies?</h3>
              <ul className="space-y-1">
                {[
                  'Your principal private residence (main home)',
                  'A second home used for work purposes (e.g., renting near your workplace during the week)',
                  'Accommodation rented for your child while they attend third-level education (student digs)',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Home className="h-4 w-4 text-orange-400 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Budget 2026 update</h3>
              <p className="mb-2">
                In Budget 2026 (announced October 2025), the Minister for Finance confirmed that the
                Rent Tax Credit would be <strong>extended to 2028</strong>. The credit amounts remain at
                €1,000 for single individuals and €2,000 for jointly assessed couples.
              </p>
              <div className="rounded-lg bg-amber-100 border border-amber-300 px-3 py-2 text-amber-900 text-xs font-medium">
                Credit extended to 2028 — plan your claims accordingly
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">How to claim (step by step)</h3>
              <ol className="space-y-1 list-decimal list-inside text-sm">
                <li>Log in to <strong>myAccount</strong> on Revenue.ie (PAYE) or <strong>ROS</strong> (self-assessed)</li>
                <li>Select "Manage your tax" for the relevant year</li>
                <li>Add the Rent Tax Credit under "Credits &amp; Reliefs"</li>
                <li>Enter the total annual rent paid and landlord details</li>
                <li>Revenue will issue a refund or reduce your tax liability</li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Important deadlines</h3>
              <div className="space-y-2 text-sm">
                {[
                  { year: '2022', deadline: '31 December 2026' },
                  { year: '2023', deadline: '31 December 2027' },
                  { year: '2024', deadline: '31 December 2028' },
                  { year: '2025', deadline: '31 December 2029' },
                  { year: '2026', deadline: '31 December 2030' },
                ].map(({ year, deadline }) => (
                  <div key={year} className="flex justify-between border-b border-orange-200 pb-1">
                    <span className="font-medium">{year} claim</span>
                    <span className="text-orange-700 font-semibold">Deadline: {deadline}</span>
                  </div>
                ))}
                <p className="text-xs text-gray-500 pt-1">
                  You have 4 years from the end of the relevant tax year to claim.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Disclaimer */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-xs text-gray-500">
          <strong>Disclaimer:</strong> This calculator is for general information purposes only and does
          not constitute tax advice. The Rent Tax Credit is non-refundable and can only reduce your
          income tax liability to zero. Figures are based on published Revenue guidance. Always verify
          your entitlement with Revenue.ie or consult a qualified tax advisor.
        </div>
      </section>
    </main>
  );
}

"use client";

import React, { useState } from "react";
import { calculateRedundancy, RedundancyInputs, RedundancyResults } from "@/lib/redundancy2025";
import { TaxFreeSection } from "@/components/redundancy/TaxFreeSection";
import { SCOPE_DISCLAIMER } from "@/components/TaxDisclaimer";
import { RelatedCalculators } from "@/components/RelatedCalculators";
import { TrustStrip } from '@/components/TrustStrip';
import { REVENUE_RATES as REVENUE_RATES_CHARTS } from '@/lib/config/siteRates';

const METHOD_LABEL: Record<RedundancyResults["bestMethod"], string> = {
  basic: "basic exemption",
  increased: "increased exemption",
  scsb: "SCSB",
};

function euro(n: number): string {
  return `€${n.toLocaleString("en-IE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function RedundancyCalculatorPage() {
  const [inputs, setInputs] = useState<RedundancyInputs>({
    annualSalary: 0,
    weeklyPay: 0,
    yearsService: 0,
    packageAmount: 0,
    pilon: 0,
    pilonContractual: true,
    holidayPay: 0,
    hasPension: false,
    pensionLumpSum: 0,
    pensionWaived: false,
    claimedAboveBasicLast10Years: false,
    priorReliefUsed: 0,
  });

  const [results, setResults] = useState<RedundancyResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof RedundancyInputs, value: any) => {
    setInputs((prev) => ({
      ...prev,
      [field]: typeof value === "string" ? Number(value) : value,
    }));
  };

  const handleSubmit = () => {
    setError(null);
    try {
      const res = calculateRedundancy(inputs);
      setResults(res);
    } catch (err: any) {
      setError(err.message || "An error occurred during calculation.");
    }
  };

  const numberField = (field: keyof RedundancyInputs, label: string, hint?: string) => (
    <div>
      <label className="block font-medium" htmlFor={`rc-${field}`}>{label}</label>
      <input
        id={`rc-${field}`}
        type="number"
        min={0}
        className="w-full p-2 border rounded"
        value={(inputs[field] as number) ?? 0}
        onChange={(e) => handleChange(field, e.target.value)}
      />
      {hint && <p className="mt-1 text-xs text-ink-muted">{hint}</p>}
    </div>
  );

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-12 sm:px-6 sm:py-16">
      <header className="max-w-2xl">
        <h1 className="font-serif text-4xl font-semibold">Redundancy calculator: how much is tax-free?</h1>
        <p className="mt-3 text-ink-muted">Estimate your statutory redundancy, the tax-free part of any extra payment, and the tax on the rest.</p>
        <TrustStrip
          className="mt-2"
          sources={[
            { label: 'Revenue', href: 'https://www.revenue.ie/en/personal-tax-credits-reliefs-and-exemptions/lump-sum-payments/index.aspx' },
            REVENUE_RATES_CHARTS,
          ]}
        />
        <p className="mt-2 text-sm text-ink-muted">Based on published Irish tax bands; not advice. {SCOPE_DISCLAIMER}</p>
      </header>

      {/* Error banner */}
      {error && (
        <div className="p-4 bg-red-100 text-red-800 rounded-xl">
          ❌ {error}
        </div>
      )}

      {/* Pension waiver warning */}
      {inputs.pensionWaived && (
        <div className="p-4 bg-yellow-100 text-yellow-900 rounded-xl">
          ⚠️ <strong>Pension lump sum given up — IRREVERSIBLE.</strong>{" "}
          The pension lump sum is not deducted from the increased exemption or SCSB.
        </div>
      )}

      {/* Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-2xl shadow">
        {numberField("annualSalary", "Annual salary (€)", "Your average yearly pay over the last 3 years is used for SCSB.")}
        {numberField("weeklyPay", "Weekly pay (€)", "Leave at 0 to work it out from the annual salary.")}
        {numberField("yearsService", "Complete years of service")}
        {numberField(
          "packageAmount",
          "Total redundancy package (€)",
          "Everything your employer pays as redundancy, including statutory redundancy. Leave out notice pay and holiday pay.",
        )}
        {numberField("pilon", "Pay in lieu of notice (€)")}
        {numberField("holidayPay", "Holiday pay (€)")}

        <div className="col-span-1 md:col-span-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={inputs.pilonContractual !== false}
              onChange={(e) => handleChange("pilonContractual", e.target.checked)}
            />
            <span className="font-medium">My contract provides for pay in lieu of notice</span>
          </label>
          <p className="mt-1 text-xs text-ink-muted">
            If it does, notice pay is taxed as normal pay. If not, it is added to the lump sum and can use the exemptions.
          </p>
        </div>

        <div className="col-span-1 md:col-span-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={!!inputs.claimedAboveBasicLast10Years}
              onChange={(e) => handleChange("claimedAboveBasicLast10Years", e.target.checked)}
            />
            <span className="font-medium">I had more than the basic exemption tax-free on a payment in the last 10 years</span>
          </label>
        </div>

        {numberField(
          "priorReliefUsed",
          "Tax-free termination relief used before (€)",
          "Counts against the €200,000 lifetime limit. Leave at 0 if none.",
        )}

        {/* Pension toggle */}
        <div className="col-span-1 md:col-span-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={inputs.hasPension}
              onChange={(e) => handleChange("hasPension", e.target.checked)}
            />
            <span className="font-medium">I get a tax-free pension lump sum from this job</span>
          </label>
        </div>

        {/* Conditional pension fields */}
        {inputs.hasPension && (
          <>
            {numberField("pensionLumpSum", "Tax-free pension lump sum (€)", "This reduces the increased exemption and SCSB.")}

            <div className="col-span-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={inputs.pensionWaived}
                  onChange={(e) => handleChange("pensionWaived", e.target.checked)}
                />
                <span className="font-medium text-yellow-800">
                  I am giving up the pension lump sum (⚠️ Irreversible)
                </span>
              </label>
            </div>
          </>
        )}

        <div className="col-span-2">
          <button
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700"
            onClick={handleSubmit}
          >
            Calculate
          </button>
        </div>
      </div>

      {/* RESULTS */}
      {results && (
        <div className="space-y-6">
          <div className="bg-green-50 p-6 rounded-2xl shadow" data-testid="redundancy-summary">
            <h2 className="text-2xl font-bold mb-4">Summary</h2>
            <p><strong>Statutory redundancy (tax-free):</strong> <span data-testid="statutory">{euro(results.statutoryRedundancy)}</span></p>
            <p><strong>Extra (ex-gratia) payment:</strong> <span data-testid="ex-gratia">{euro(results.exGratiaLumpSum)}</span></p>
            <p>
              <strong>Tax-free part of the extra payment:</strong> <span data-testid="tax-free">{euro(results.taxFreeLumpSum)}</span>{" "}
              <span className="text-sm text-ink-muted">({METHOD_LABEL[results.bestMethod]}, the best option for you)</span>
            </p>
            <p><strong>Taxable part of the extra payment:</strong> <span data-testid="taxable">{euro(results.taxableLumpSum)}</span></p>
            <p>
              <strong>Income tax and USC on the taxable part:</strong>{" "}
              <span data-testid="lump-tax">{euro(results.lumpSumIncomeTax + results.lumpSumUsc)}</span>{" "}
              <span className="text-sm text-ink-muted">(income tax {euro(results.lumpSumIncomeTax)}, USC {euro(results.lumpSumUsc)}; no PRSI)</span>
            </p>
            {results.pilonTaxable > 0 && (
              <p><strong>Tax on notice pay (income tax, USC, PRSI):</strong> {euro(results.pilonTax)}</p>
            )}
            {results.holidayTaxable > 0 && (
              <p><strong>Tax on holiday pay (income tax, USC, PRSI):</strong> {euro(results.holidayTax)}</p>
            )}
            <p className="mt-3 border-t border-green-200 pt-3"><strong>Total tax:</strong> <span data-testid="total-tax">{euro(results.totalTax)}</span></p>
            <p><strong>Estimated amount after tax:</strong> <span data-testid="net">{euro(results.netPackage)}</span></p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow space-y-3">
            <h3 className="text-xl font-semibold">Exemptions compared</h3>
            <ul className="list-disc pl-5 text-sm space-y-1">
              <li>Basic exemption: {euro(results.exemptions.basic)}</li>
              <li>
                Increased exemption:{" "}
                {results.exemptions.increased === null ? "not available (more than basic claimed in the last 10 years)" : euro(results.exemptions.increased)}
              </li>
              <li>SCSB: {euro(results.exemptions.scsb)}</li>
              <li>Lifetime limit left: {euro(results.breakdown.exemption.lifetimeLimitLeft)}</li>
            </ul>
            <p className="text-sm text-ink-muted">
              Tax is worked out at your own {results.breakdown.taxYear} rates on top of your salary, with single person
              credits. Top slicing relief no longer applies: it was abolished for ex-gratia payments made on or after
              1 January 2014. Source:{" "}
              <a
                href="https://www.citizensinformation.ie/en/money-and-tax/budgets/budget-2014/"
                className="underline"
                rel="noopener noreferrer"
              >
                Citizens Information, Budget 2014
              </a>
              .
            </p>
          </div>

          {/* Warnings */}
          {results.warnings.length > 0 && (
            <div className="bg-yellow-100 p-4 rounded-xl space-y-2">
              {results.warnings.map((w, i) => (
                <div key={i}>⚠️ {w}</div>
              ))}
            </div>
          )}
        </div>
      )}

      <TaxFreeSection />

      <RelatedCalculators current="redundancy" />
    </div>
  );
}

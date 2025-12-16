"use client";

import React, { useState } from "react";
import { calculateRedundancy, RedundancyInputs, RedundancyResults } from "@/lib/redundancy2025";

export default function RedundancyCalculatorPage() {
  const [inputs, setInputs] = useState<RedundancyInputs>({
    annualSalary: 0,
    weeklyPay: 0,
    yearsService: 0,
    packageAmount: 0,
    pilon: 0,
    holidayPay: 0,
    hasPension: false,
    pensionLumpSum: 0,
    pensionWaived: false,
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

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">Irish Redundancy Calculator (2025)</h1>

      {/* Error banner */}
      {error && (
        <div className="p-4 bg-red-100 text-red-800 rounded-xl">
          ❌ {error}
        </div>
      )}

      {/* Pension waiver warning */}
      {inputs.pensionWaived && (
        <div className="p-4 bg-yellow-100 text-yellow-900 rounded-xl">
          ⚠️ <strong>Pension Waiver Selected — IRREVERSIBLE.</strong>  
          You are opting to ignore the pension lump sum for SCSB exemption.
        </div>
      )}

      {/* Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-2xl shadow">
        <div>
          <label className="block font-medium">Annual Salary (€)</label>
          <input
            type="number"
            className="w-full p-2 border rounded"
            value={inputs.annualSalary}
            onChange={(e) => handleChange("annualSalary", e.target.value)}
          />
        </div>

        <div>
          <label className="block font-medium">Weekly Pay (€)</label>
          <input
            type="number"
            className="w-full p-2 border rounded"
            value={inputs.weeklyPay}
            onChange={(e) => handleChange("weeklyPay", e.target.value)}
          />
        </div>

        <div>
          <label className="block font-medium">Years of Service</label>
          <input
            type="number"
            className="w-full p-2 border rounded"
            value={inputs.yearsService}
            onChange={(e) => handleChange("yearsService", e.target.value)}
          />
        </div>

        <div>
          <label className="block font-medium">Enhanced / Ex-gratia Amount (€)</label>
          <input
            type="number"
            className="w-full p-2 border rounded"
            value={inputs.packageAmount}
            onChange={(e) => handleChange("packageAmount", e.target.value)}
          />
        </div>

        <div>
          <label className="block font-medium">PILON (€)</label>
          <input
            type="number"
            className="w-full p-2 border rounded"
            value={inputs.pilon}
            onChange={(e) => handleChange("pilon", e.target.value)}
          />
        </div>

        <div>
          <label className="block font-medium">Holiday Pay (€)</label>
          <input
            type="number"
            className="w-full p-2 border rounded"
            value={inputs.holidayPay}
            onChange={(e) => handleChange("holidayPay", e.target.value)}
          />
        </div>

        {/* Pension toggle */}
        <div className="col-span-1 md:col-span-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={inputs.hasPension}
              onChange={(e) => handleChange("hasPension", e.target.checked)}
            />
            <span className="font-medium">Include Pension Lump Sum</span>
          </label>
        </div>

        {/* Conditional pension fields */}
        {inputs.hasPension && (
          <>
            <div>
              <label className="block font-medium">Pension Lump Sum (€)</label>
              <input
                type="number"
                className="w-full p-2 border rounded"
                value={inputs.pensionLumpSum}
                onChange={(e) => handleChange("pensionLumpSum", e.target.value)}
              />
            </div>


            <div className="col-span-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={inputs.pensionWaived}
                  onChange={(e) => handleChange("pensionWaived", e.target.checked)}
                />
                <span className="font-medium text-yellow-800">
                  Waive pension lump sum for SCSB (⚠️ Irreversible)
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
          <div className="bg-green-50 p-6 rounded-2xl shadow">
            <h2 className="text-2xl font-bold mb-4">Summary</h2>
            <p><strong>Total Statutory:</strong> €{results.statutory.toLocaleString()}</p>
            <p><strong>Tax-Free Enhanced:</strong> €{results.taxFreeEnhanced.toLocaleString()}</p>
            <p><strong>Taxable Enhanced:</strong> €{results.taxableEnhanced.toLocaleString()}</p>
            <p><strong>PILON Tax:</strong> €{results.pilonTax.toLocaleString()}</p>
            <p><strong>Holiday Pay Tax:</strong> €{results.holidayTax.toLocaleString()}</p>
            <p><strong>Total Net:</strong> €{results.totalNet.toLocaleString()}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow space-y-3">
            <h3 className="text-xl font-semibold">Details</h3>
            <pre className="whitespace-pre-wrap text-sm">
{JSON.stringify(results.breakdown, null, 2)}
            </pre>
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
    </div>
  );
}

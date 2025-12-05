import React from 'react';
import { ScenarioComparison } from '../lib/taxEngine';

export function ComparisonView({ comparison }: { comparison: ScenarioComparison }) {
  const { scenarioA, scenarioB, delta } = comparison;
  return (
    <div className="grid gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:grid-cols-3">
      <div>
        <h3 className="text-sm font-semibold text-gray-800">Scenario A</h3>
        <p className="text-2xl font-bold">€{scenarioA.netAnnual.toFixed(0)}</p>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-800">Scenario B</h3>
        <p className="text-2xl font-bold">€{scenarioB.netAnnual.toFixed(0)}</p>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-800">Difference</h3>
        <p className="text-2xl font-bold text-brand-600">€{delta.netAnnual.toFixed(0)}</p>
      </div>
    </div>
  );
}

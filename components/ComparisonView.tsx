import React from 'react';
import { ScenarioComparison } from '../lib/taxEngine';

function money(n: number): string {
  return `€${Math.round(n).toLocaleString('en-IE')}`;
}

export function ComparisonView({ comparison }: { comparison: ScenarioComparison }) {
  const { scenarioA, scenarioB, delta } = comparison;
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="card">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">This income</h3>
        <p className="mt-2 font-serif text-2xl">{money(scenarioA.netAnnual)}</p>
      </div>
      <div className="card">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Other income</h3>
        <p className="mt-2 font-serif text-2xl">{money(scenarioB.netAnnual)}</p>
      </div>
      <div className="card">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Difference</h3>
        <p className="mt-2 font-serif text-2xl text-brand-700">{money(delta.netAnnual)}</p>
      </div>
    </div>
  );
}

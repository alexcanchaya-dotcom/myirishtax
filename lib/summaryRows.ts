import type { TaxBreakdown } from './taxEngine';

/** Whole-euro rows for the take-home result card that always add up on screen. */
export type SummaryRows = {
  gross: number;
  incomeTaxBeforeCredits: number;
  creditsUsed: number;
  incomeTax: number;
  usc: number;
  prsi: number;
  totalDeductions: number;
  pension: number;
  takeHome: number;
};

// Round a set of parts to whole euros so they still sum to the rounded total (largest remainder).
function roundToTotal(parts: number[], total: number): number[] {
  const floors = parts.map((p) => Math.floor(p));
  let left = total - floors.reduce((a, b) => a + b, 0);
  const order = parts
    .map((p, i) => ({ i, r: p - Math.floor(p) }))
    .sort((a, b) => b.r - a.r || a.i - b.i);
  const out = [...floors];
  for (let k = 0; left > 0 && k < order.length; k++, left--) out[order[k].i] += 1;
  for (let k = order.length - 1; left < 0 && k >= 0; k--, left++) out[order[k].i] -= 1;
  return out;
}

// gross = income tax + USC + PRSI + pension contribution + take-home (netAnnual already has the pension taken off).
export function buildSummaryRows(data: TaxBreakdown): SummaryRows {
  const pensionExact = data.pension?.contribution ?? 0;
  const grossExact = data.netAnnual + data.totalTax + pensionExact;
  const gross = Math.round(grossExact);
  const [incomeTax, usc, prsi, pension, takeHome] = roundToTotal(
    [data.payeAfterCredits, data.uscTotal, data.prsi, pensionExact, data.netAnnual],
    gross,
  );
  const incomeTaxBeforeCredits = Math.round(data.payeBeforeCredits);
  return {
    gross,
    incomeTaxBeforeCredits,
    creditsUsed: incomeTaxBeforeCredits - incomeTax,
    incomeTax,
    usc,
    prsi,
    totalDeductions: incomeTax + usc + prsi,
    pension,
    takeHome,
  };
}

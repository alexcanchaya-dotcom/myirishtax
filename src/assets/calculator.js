export const USC_BANDS_2025 = [
  { limit: 12012, rate: 0.005 },
  { limit: 25460, rate: 0.02 },
  { limit: 55216, rate: 0.045 },
  { limit: Infinity, rate: 0.08 }
];

export function calculateUSC(income, bands = USC_BANDS_2025) {
  let remaining = income;
  let usc = 0;
  for (let i = 0; i < bands.length; i += 1) {
    const currentLimit = bands[i].limit;
    const previousLimit = i === 0 ? 0 : bands[i - 1].limit;
    const taxable = Math.min(Math.max(remaining, 0), currentLimit - previousLimit);
    if (taxable > 0) {
      usc += taxable * bands[i].rate;
      remaining -= taxable;
    }
  }
  return usc;
}

export function calculatePRSI(income, rate = 0.04) {
  return Math.max(income * rate, 0);
}

export function calculatePAYE({ income, cutoff, credits, lowerRate = 0.2, higherRate = 0.4 }) {
  const standardTax = Math.min(income, cutoff) * lowerRate;
  const higherTax = Math.max(0, income - cutoff) * higherRate;
  const grossTax = standardTax + higherTax;
  return Math.max(0, grossTax - credits);
}

export function calculateTaxResult({ income, cutoff, credits, includeUSC = true, includePRSI = true }) {
  const paye = calculatePAYE({ income, cutoff, credits });
  const usc = includeUSC ? calculateUSC(income) : 0;
  const prsi = includePRSI ? calculatePRSI(income) : 0;
  const totalDeductions = paye + usc + prsi;
  const net = Math.max(0, income - totalDeductions);
  return { paye, usc, prsi, totalDeductions, net };
}

export function formatEuro(amount) {
  return `€${amount.toFixed(2)}`;
}

export function buildExportSummary(result, taxYear) {
  return {
    taxYear,
    totals: {
      net: formatEuro(result.net),
      deductions: formatEuro(result.totalDeductions)
    },
    breakdown: {
      paye: formatEuro(result.paye),
      usc: formatEuro(result.usc),
      prsi: formatEuro(result.prsi)
    },
    metadata: {
      generatedAt: new Date('2025-01-01T00:00:00Z').toISOString(),
      disclaimer: 'Illustrative calculator output only.'
    }
  };
}

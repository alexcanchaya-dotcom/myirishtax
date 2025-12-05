function resolveStandardBand(config, taxStatus, employments) {
  const bands = config.income_tax.standard_rate_bands;
  if (taxStatus === 'married_two_incomes' && Array.isArray(bands.married_two_incomes)) {
    return bands.married_two_incomes[0]?.base || bands.single;
  }
  if (taxStatus === 'married_two_incomes' && typeof bands.married_two_incomes === 'object') {
    const { base, increase_per_earner, max } = bands.married_two_incomes;
    const additionalEarners = Math.max(0, employments.length - 1);
    const increased = base + additionalEarners * (increase_per_earner || 0);
    return Math.min(max || increased, increased);
  }
  return bands[taxStatus] ?? bands.single;
}

function resolveCredits(config, overrides) {
  if (overrides) return overrides;
  const { credits } = config.income_tax;
  return credits.personal + (credits.paye || 0);
}

export function calculateIncomeTax(profile, config) {
  const cutoff = resolveStandardBand(config, profile.taxStatus, profile.employments);
  const standardRate = config.income_tax.standard_rate;
  const higherRate = config.income_tax.higher_rate;
  const standardTaxable = Math.min(profile.annualIncome, cutoff);
  const higherTaxable = Math.max(0, profile.annualIncome - cutoff);

  const grossTax = standardTaxable * standardRate + higherTaxable * higherRate;
  const credits = resolveCredits(config, profile.taxCredits);
  const liability = Math.max(0, grossTax - credits);

  return {
    type: 'income_tax',
    liability,
    breakdown: {
      standardTaxable,
      higherTaxable,
      standardRate,
      higherRate,
      credits
    }
  };
}

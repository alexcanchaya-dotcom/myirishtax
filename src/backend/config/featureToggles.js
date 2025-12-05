const parseBoolean = (value) => String(value || '').toLowerCase() === 'true';

const parseCsv = (value) =>
  String(value || '')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);

export function getEnabledTaxYears() {
  const years = parseCsv(process.env.TAX_YEARS_ENABLED);
  return years.length ? years : null;
}

export function isTaxYearEnabled(year) {
  const enabledYears = getEnabledTaxYears();
  if (!enabledYears) return true;
  return enabledYears.includes(String(year));
}

export function featureFlags() {
  return {
    experimentalCalculators: parseBoolean(process.env.ENABLE_EXPERIMENTAL_CALCULATORS),
    week1Month1Guardrails: parseBoolean(process.env.ENABLE_WEEK1_MONTH1_GUARDRAILS || 'true')
  };
}

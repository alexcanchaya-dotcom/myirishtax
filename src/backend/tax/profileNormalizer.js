import { featureFlags } from '../config/featureToggles.js';

const defaultTaxStatus = 'single';

function coerceNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function buildEmployments(rawIncomes = []) {
  const employments = rawIncomes
    .map((income, index) => ({
      label: `employment_${index + 1}`,
      annualIncome: coerceNumber(income, 0)
    }))
    .filter((employment) => employment.annualIncome > 0);
  return employments.length ? employments : [{ label: 'employment_1', annualIncome: 0 }];
}

export function normalizeProfile(input = {}) {
  const flags = featureFlags();
  const taxYear = Number(input.taxYear) || new Date().getFullYear();
  const employments = buildEmployments(input.employments || [input.income]);
  const annualIncome = employments.reduce((sum, emp) => sum + emp.annualIncome, 0);
  const warnings = [];

  if (!annualIncome) {
    throw new Error('At least one employment income must be provided.');
  }

  if (employments.length > 1) {
    warnings.push('Multiple employments detected – ensure credits/bands split correctly.');
  }

  const week1Month1 = Boolean(input.week1Month1Basis);
  if (week1Month1 && flags.week1Month1Guardrails) {
    warnings.push('Week 1 / Month 1 basis selected – cumulative credits may not apply.');
  }

  return {
    taxYear,
    taxStatus: input.taxStatus || defaultTaxStatus,
    employments,
    annualIncome,
    includeUSC: input.includeUSC !== false,
    includePRSI: input.includePRSI !== false,
    taxCredits: coerceNumber(input.taxCredits),
    week1Month1,
    benefits: input.benefits || {},
    flags,
    warnings
  };
}

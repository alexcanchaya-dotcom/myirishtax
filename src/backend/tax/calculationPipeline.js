import { loadTaxYearConfig } from '../config/taxYearRepository.js';
import { normalizeProfile } from './profileNormalizer.js';
import { calculateIncomeTax } from './calculators/incomeTaxCalculator.js';
import { calculateUSC } from './calculators/uscCalculator.js';
import { calculatePRSI } from './calculators/prsiCalculator.js';
import { calculateBIK } from './calculators/bikCalculator.js';

export async function runTaxPipeline(rawInput) {
  const profile = normalizeProfile(rawInput);
  const config = await loadTaxYearConfig(profile.taxYear);

  const incomeTax = calculateIncomeTax(profile, config);
  const usc = profile.includeUSC ? calculateUSC(profile, config) : { type: 'usc', liability: 0 };
  const prsi = profile.includePRSI ? calculatePRSI(profile, config) : { type: 'prsi', liability: 0 };
  const bik = calculateBIK(profile, config);

  const liabilities = [incomeTax, usc, prsi, bik];
  const totalLiability = liabilities.reduce((sum, item) => sum + (item.liability || 0), 0);
  const netIncome = Math.max(0, profile.annualIncome - totalLiability);

  return {
    profile,
    configMeta: config.metadata,
    liabilities,
    summary: {
      grossIncome: profile.annualIncome,
      totalLiability,
      netIncome
    },
    warnings: profile.warnings
  };
}

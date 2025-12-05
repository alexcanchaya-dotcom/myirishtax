import { getTaxConfig, MaritalStatus, TaxYearConfig, USCStep } from './config.js';

export type PayeInput = {
  income: number;
  spouseIncome?: number;
  credits?: number;
  includeUSC?: boolean;
  includePRSI?: boolean;
  maritalStatus?: MaritalStatus;
};

export type PayeBreakdown = {
  paye: number;
  usc: number;
  prsi: number;
  totalDeductions: number;
  net: number;
};

export function calculateUSC(income: number, bands: USCStep[]): number {
  return bands.reduce((acc, band, index) => {
    const previousLimit = index === 0 ? 0 : bands[index - 1].limit;
    const taxable = Math.min(Math.max(income - previousLimit, 0), band.limit - previousLimit);
    return acc + taxable * band.rate;
  }, 0);
}

export function calculatePRSI(income: number, rate: number): number {
  return Math.max(income * rate, 0);
}

export function calculatePAYE(
  income: number,
  cutoff: number,
  credits: number,
  standardRate: number,
  higherRate: number
): number {
  const standardTax = Math.min(income, cutoff) * standardRate;
  const higherTax = Math.max(0, income - cutoff) * higherRate;
  const grossTax = standardTax + higherTax;
  return Math.max(0, grossTax - credits);
}

export function calculateNetSalary({
  income,
  usc,
  prsi,
  paye
}: {
  income: number;
  usc: number;
  prsi: number;
  paye: number;
}): number {
  const totalDeductions = usc + prsi + paye;
  return Math.max(0, income - totalDeductions);
}

function resolveCutoff(config: TaxYearConfig, maritalStatus: MaritalStatus, spouseIncome?: number): number {
  const baseCutoff = config.standardRateCutoff[maritalStatus];
  if (maritalStatus === 'married_two_incomes' && spouseIncome) {
    return Math.min(baseCutoff + spouseIncome * 0.2, config.standardRateCutoff.married_two_incomes);
  }
  return baseCutoff;
}

export function calculatePAYEForYear(year: number, input: PayeInput): PayeBreakdown {
  const maritalStatus = input.maritalStatus ?? 'single';
  const config = getTaxConfig(year);
  const income = Math.max(input.income + (input.spouseIncome ?? 0), 0);
  const credits = input.credits ?? config.defaultCredits[maritalStatus];

  const cutoff = resolveCutoff(config, maritalStatus, input.spouseIncome);

  const paye = calculatePAYE(income, cutoff, credits, config.standardRate, config.higherRate);
  const usc = input.includeUSC === false ? 0 : calculateUSC(income, config.uscBands);
  const prsi = input.includePRSI === false ? 0 : calculatePRSI(income, config.prsiRate);
  const net = calculateNetSalary({ income, usc, prsi, paye });

  return {
    paye,
    usc,
    prsi,
    totalDeductions: paye + usc + prsi,
    net
  };
}

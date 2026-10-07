import { TaxYearConfig, getTaxYearConfig } from '../config/taxYearConfig';

export type CalculationInput = {
  income: number;
  period: 'annual' | 'monthly' | 'weekly';
  maritalStatus: 'single' | 'married';
  pensionContribution?: number;
  /** Age at the end of the year, for the pension relief age limit. Optional: without it only the 40% / €115,000 ceiling applies. */
  age?: number;
  additionalCredits?: number;
  taxYear: number;
};

/** Revenue "Tax relief limits on pension contributions": % of earnings by age, earnings capped at €115,000. */
export const PENSION_EARNINGS_CAP = 115000;
export const PENSION_AGE_LIMITS: { minAge: number; pct: number }[] = [
  { minAge: 60, pct: 0.4 },
  { minAge: 55, pct: 0.35 },
  { minAge: 50, pct: 0.3 },
  { minAge: 40, pct: 0.25 },
  { minAge: 30, pct: 0.2 },
  { minAge: 0, pct: 0.15 },
];

export function pensionAgeLimitPct(age?: number): number {
  if (age === undefined || !Number.isFinite(age)) return PENSION_AGE_LIMITS[0].pct; // no age: the highest (60+) limit
  return (PENSION_AGE_LIMITS.find((b) => age >= b.minAge) ?? PENSION_AGE_LIMITS[PENSION_AGE_LIMITS.length - 1]).pct;
}

export type PensionRelief = {
  contribution: number;
  /** Most that can get income tax relief this year: age % × earnings (capped at €115,000). */
  limit: number;
  /** The part of the contribution that reduces income tax. */
  relieved: number;
  /** Contribution above the limit: no relief this year. */
  overLimit: number;
  agePct: number;
  ageGiven: boolean;
};

export function calculatePensionRelief(earnings: number, contribution: number, age?: number): PensionRelief {
  const agePct = pensionAgeLimitPct(age);
  const limit = Math.max(0, Math.min(earnings, PENSION_EARNINGS_CAP)) * agePct;
  const c = Math.max(0, contribution);
  const relieved = Math.min(c, limit);
  return { contribution: c, limit, relieved, overLimit: c - relieved, agePct, ageGiven: age !== undefined && Number.isFinite(age) };
}

export type BandBreakdown = { band: string; amount: number; rate: number };
export type TaxBreakdown = {
  paye: BandBreakdown[];
  usc: BandBreakdown[];
  prsi: number;
  credits: number;
  payeBeforeCredits: number;
  payeAfterCredits: number;
  uscTotal: number;
  totalTax: number;
  netAnnual: number;
  netMonthly: number;
  netWeekly: number;
  netDaily: number;
  pension: PensionRelief;
};

export function sumBands(bands: BandBreakdown[]): number {
  return bands.reduce((sum, band) => sum + band.amount, 0);
}

function convertToAnnual(income: number, period: CalculationInput['period']): number {
  if (period === 'monthly') return income * 12;
  if (period === 'weekly') return income * 52;
  return income;
}

function calculateBands(amount: number, bands: { upTo: number | null; rate: number }[]): BandBreakdown[] {
  let remaining = amount;
  let lowerBound = 0;
  const breakdown: BandBreakdown[] = [];

  for (const band of bands) {
    if (remaining <= 0) break;
    const upper = band.upTo ?? Infinity;
    const taxable = Math.min(remaining, upper - lowerBound);
    breakdown.push({ band: `${lowerBound.toFixed(0)}-${band.upTo ?? '∞'}`, amount: taxable * band.rate, rate: band.rate });
    remaining -= taxable;
    lowerBound = upper;
  }

  return breakdown;
}

export function calculatePAYE(income: number, config: TaxYearConfig, maritalStatus: CalculationInput['maritalStatus']): BandBreakdown[] {
  const bands = maritalStatus === 'married' ? config.incomeTaxBandsMarried : config.incomeTaxBandsSingle;
  return calculateBands(income, bands);
}

// No USC at all when total income for the year is at or below the exemption threshold (€13,000).
// Above it, USC is charged on the full income, not just the excess (s.531AM(2) TCA 1997).
export function calculateUSC(income: number, config: TaxYearConfig): BandBreakdown[] {
  if (income <= config.uscExemptionThreshold) {
    return [{ band: `exempt (income €${String(config.uscExemptionThreshold).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} or less)`, amount: 0, rate: 0 }];
  }
  return calculateBands(income, config.uscBands);
}

function prsiRateForMonth(config: TaxYearConfig, month: number): number {
  const applicable = (config.prsiRateChanges ?? []).filter((c) => c.fromMonth <= month);
  return applicable.length > 0 ? applicable[applicable.length - 1].rate : config.prsiRate;
}

// Class A employee PRSI (take-home calculator). Assumes even weekly pay (annual ÷ 52).
// Weekly pay at or below €352: nil. €352.01–€424: the charge is reduced by a tapered credit of
// €12 less one-sixth of earnings over €352.01. Above €424: the rate on all earnings.
// The rate is weighted by month when it changes partway through the year.
export function calculateClassAPRSI(income: number, config: TaxYearConfig): number {
  const { weeklyNilUpTo, creditMax, creditTaperTo } = config.classAPrsi;
  const weekly = income / 52;
  if (weekly <= weeklyNilUpTo) return 0;
  const credit = weekly <= creditTaperTo ? Math.max(0, creditMax - (weekly - (weeklyNilUpTo + 0.01)) / 6) : 0;
  let total = 0;
  for (let month = 1; month <= 12; month++) {
    const weeklyCharge = Math.max(0, weekly * prsiRateForMonth(config, month) - credit);
    total += (weeklyCharge * 52) / 12;
  }
  return total;
}

// Rate-only PRSI (used for Class S), weighted by month when the rate changes partway through the year.
// Assumes even monthly pay, so this is an estimate. With no changes listed it is income × prsiRate.
export function calculatePRSI(income: number, config: TaxYearConfig): number {
  const changes = config.prsiRateChanges ?? [];
  if (changes.length === 0) return income * config.prsiRate;
  let total = 0;
  for (let month = 1; month <= 12; month++) {
    total += (income / 12) * prsiRateForMonth(config, month);
  }
  return total;
}

export function calculateCredits(
  config: TaxYearConfig,
  additionalCredits = 0,
  maritalStatus: CalculationInput['maritalStatus'] = 'single',
  options: { includePayeCredit?: boolean } = {},
): number {
  const includePayeCredit = options.includePayeCredit !== false;
  const base = maritalStatus === 'married' ? config.creditsMarried : config.credits;
  const payeCredit = includePayeCredit ? base.paye : 0;
  return base.personal + payeCredit + (base.additional ?? 0) + additionalCredits;
}

export function calculateNetIncome(input: CalculationInput): TaxBreakdown {
  const config = getTaxYearConfig(input.taxYear);
  const annualIncome = convertToAnnual(input.income, input.period);
  // Employee pension contributions get income tax relief only, within the age % and €115,000 earnings limits.
  // "There is no relief from USC or PRSI for employee pension contributions" (Revenue).
  const pension = calculatePensionRelief(annualIncome, input.pensionContribution ?? 0, input.age);
  const taxableIncome = Math.max(0, annualIncome - pension.relieved);

  const payeBreakdown = calculatePAYE(taxableIncome, config, input.maritalStatus);
  const uscBreakdown = calculateUSC(annualIncome, config);
  const prsi = calculateClassAPRSI(annualIncome, config);

  const payeBeforeCredits = sumBands(payeBreakdown);
  const uscTotal = sumBands(uscBreakdown);
  const totalCredits = calculateCredits(config, input.additionalCredits, input.maritalStatus);

  // Tax credits reduce income tax (PAYE) only. They cannot reduce USC or PRSI.
  const payeAfterCredits = Math.max(0, payeBeforeCredits - totalCredits);
  const totalTax = payeAfterCredits + uscTotal + prsi;
  // Take-home after tax and after the full pension contribution (it leaves your pay either way).
  const netAnnual = annualIncome - pension.contribution - totalTax;

  return {
    paye: payeBreakdown,
    usc: uscBreakdown,
    prsi,
    credits: totalCredits,
    payeBeforeCredits,
    payeAfterCredits,
    uscTotal,
    totalTax,
    netAnnual,
    netMonthly: netAnnual / 12,
    netWeekly: netAnnual / 52,
    netDaily: netAnnual / 365,
    pension,
  };
}

export type ScenarioComparison = {
  scenarioA: TaxBreakdown;
  scenarioB: TaxBreakdown;
  delta: {
    netAnnual: number;
    totalTax: number;
  };
};

export function compareScenarios(a: CalculationInput, b: CalculationInput): ScenarioComparison {
  const scenarioA = calculateNetIncome(a);
  const scenarioB = calculateNetIncome(b);
  return {
    scenarioA,
    scenarioB,
    delta: {
      netAnnual: scenarioB.netAnnual - scenarioA.netAnnual,
      totalTax: scenarioB.totalTax - scenarioA.totalTax,
    },
  };
}

import { TaxYearConfig, getTaxYearConfig } from '../config/taxYearConfig';

export type CalculationInput = {
  income: number;
  period: 'annual' | 'monthly' | 'weekly';
  maritalStatus: 'single' | 'married';
  pensionContribution?: number;
  additionalCredits?: number;
  taxYear: number;
};

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

export function calculateUSC(income: number, config: TaxYearConfig): BandBreakdown[] {
  return calculateBands(income, config.uscBands);
}

export function calculatePRSI(income: number, config: TaxYearConfig): number {
  return income * config.prsiRate;
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
  const pension = input.pensionContribution ?? 0;
  const taxableIncome = Math.max(0, annualIncome - pension);

  const payeBreakdown = calculatePAYE(taxableIncome, config, input.maritalStatus);
  const uscBreakdown = calculateUSC(taxableIncome, config);
  const prsi = calculatePRSI(taxableIncome, config);

  const payeBeforeCredits = sumBands(payeBreakdown);
  const uscTotal = sumBands(uscBreakdown);
  const totalCredits = calculateCredits(config, input.additionalCredits, input.maritalStatus);

  // Tax credits reduce income tax (PAYE) only. They cannot reduce USC or PRSI.
  const payeAfterCredits = Math.max(0, payeBeforeCredits - totalCredits);
  const totalTax = payeAfterCredits + uscTotal + prsi;
  const netAnnual = taxableIncome - totalTax;

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

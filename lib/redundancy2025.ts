// /lib/redundancy2025.ts

export interface RedundancyInputs {
  annualSalary: number; // gross annual salary
  weeklyPay?: number; // optional - will be derived from annualSalary if omitted
  yearsService: number; // full years of service (integer >=0)

  // Package components (amounts in euros)
  packageAmount?: number; // employer total package offered (optional)
  pilon?: number; // pay in lieu of notice
  holidayPay?: number; // accrued holiday pay

  // Pension information
  hasPension?: boolean;
  pensionLumpSum?: number; // lump sum pension paid on redundancy (0 if none)
  pensionWaived?: boolean; // if true, lump sum can be ignored or waived

  // Enhanced / ex-gratia choices
  enhancedType?: 'none' | 'basic' | 'increased' | 'scsb';
  noRedundancyLast10Years?: boolean; // affect Increased option

  // Misc
  statutoryWeeklyCap?: number; // defaults to 600
}

export interface RedundancyResults {
  statutoryRedundancy: number; // statutory, tax-free
  statutoryWeeklyCap: number;

  enhancedGross: number; // enhanced/ex-gratia gross before lifetime cap
  enhancedAfterLifetimeCap: number; // enhanced after applying lifetime cap (€200k)
  enhancedTaxable: number; // portion of enhanced subject to income tax
  enhancedTopSliceRelief: number; // computed top-slice relief amount (33% of taxable enhanced, per requirement)

  pilonTaxable: number;
  holidayTaxable: number;
  pilonTaxDeductedApprox: number; // approximate tax @ marginal rate
  holidayTaxDeductedApprox: number; // approx

  lifetimeCapApplied: boolean;
  warnings: string[];

  breakdown: {
    statutory: {
      formula: string;
      weeklyPayUsed: number;
      yearsService: number;
    };
    enhanced: {
      type: string;
      components: Record<string, number>;
    };
  };
}

// Constants
export const STATUTORY_WEEKLY_CAP = 600; // per requirement
export const BASIC_EXGRATIA_BASE = 10160; // €10,160
export const BASIC_EXGRATIA_PER_YEAR = 765; // €765 × years
export const INCREASED_EXTRA_MAX = 10000; // up to €10,000 increased element
export const LIFETIME_CAP = 200000; // €200,000 lifetime cap for ex-gratia
export const PILON_MARGINAL_RATE = 0.52; // ~52% marginal rate on PILON & holiday
export const TOP_SLICE_RELIEF_RATE = 0.33; // 33% on taxable enhanced redundancy

// Utility helpers
function safeNumber(input?: number): number {
  if (typeof input !== 'number' || Number.isNaN(input) || !Number.isFinite(input)) return 0;
  return Math.max(0, input);
}

function annualToWeekly(annual: number) {
  // Use 52.1429 weeks per year (average) for more accurate weekly conversion
  const weeks = 52.1429;
  return Math.round((annual / weeks) * 100) / 100; // rounded to cents
}

export function calculateRedundancy(rawInputs: RedundancyInputs): RedundancyResults {
  // Validate & normalise inputs
  const inputs: RedundancyInputs = {
    annualSalary: safeNumber(rawInputs.annualSalary),
    weeklyPay: rawInputs.weeklyPay ? safeNumber(rawInputs.weeklyPay) : undefined,
    yearsService: Math.max(0, Math.floor(rawInputs.yearsService || 0)),

    packageAmount: safeNumber(rawInputs.packageAmount),
    pilon: safeNumber(rawInputs.pilon),
    holidayPay: safeNumber(rawInputs.holidayPay),

    hasPension: !!rawInputs.hasPension,
    pensionLumpSum: safeNumber(rawInputs.pensionLumpSum),
    pensionWaived: !!rawInputs.pensionWaived,

    enhancedType: rawInputs.enhancedType || 'none',
    noRedundancyLast10Years: !!rawInputs.noRedundancyLast10Years,

    statutoryWeeklyCap: rawInputs.statutoryWeeklyCap || STATUTORY_WEEKLY_CAP,
  };

  const warnings: string[] = [];

  // Compute weekly pay if not provided
  const weeklyPayComputed = inputs.weeklyPay ?? annualToWeekly(inputs.annualSalary);

  // 1) Statutory redundancy
  // Formula: [(years × 2) + 1] × min(weekly_pay, €600) - 100% tax-free
  const statutoryWeeklyCap = inputs.statutoryWeeklyCap || STATUTORY_WEEKLY_CAP;
  const weeklyUsed = Math.min(weeklyPayComputed, statutoryWeeklyCap);
  const statutoryMultiplier = inputs.yearsService * 2 + 1;
  const statutoryRedundancy = Math.round(statutoryMultiplier * weeklyUsed * 100) / 100;

  // 2) Enhanced/ex-gratia with 3 options
  let enhancedGross = 0;
  const enhancedComponents: Record<string, number> = {};

  if (inputs.enhancedType === 'basic') {
    const val = BASIC_EXGRATIA_BASE + BASIC_EXGRATIA_PER_YEAR * inputs.yearsService;
    enhancedGross = Math.round(val * 100) / 100;
    enhancedComponents['base'] = enhancedGross;
  } else if (inputs.enhancedType === 'increased') {
    const basic = BASIC_EXGRATIA_BASE + BASIC_EXGRATIA_PER_YEAR * inputs.yearsService;
    // Increased: Basic + max(0, €10,000 - pension_lump_sum) [if no redundancy last 10 years]
    let extra = 0;
    if (inputs.noRedundancyLast10Years) {
      extra = Math.max(0, INCREASED_EXTRA_MAX - safeNumber(inputs.pensionLumpSum));
    }
    enhancedGross = Math.round((basic + extra) * 100) / 100;
    enhancedComponents['basic'] = Math.round(basic * 100) / 100;
    enhancedComponents['increased_extra'] = Math.round(extra * 100) / 100;
  } else if (inputs.enhancedType === 'scsb') {
    // SCSB: (avg_salary × years ÷ 15) - pension_lump_sum OR full if pension waived
    // avg_salary: use annualSalary as proxy for average salary
    const avgSalary = inputs.annualSalary;
    const scsbBase = (avgSalary * inputs.yearsService) / 15;
    let scsbFinal = scsbBase - safeNumber(inputs.pensionLumpSum);
    if (inputs.pensionWaived) {
      // If pension waived, full SCSB applies
      scsbFinal = scsbBase;
      warnings.push('⚠️ Pension waived: this is irreversible and may have pension consequences.');
    }
    enhancedGross = Math.round(Math.max(0, scsbFinal) * 100) / 100;
    enhancedComponents['scsb_base'] = Math.round(scsbBase * 100) / 100;
    enhancedComponents['pension_lump_sum_applied'] = inputs.pensionWaived ? 0 : Math.round(safeNumber(inputs.pensionLumpSum) * 100) / 100;
  }

  // 3) Lifetime cap €200,000 for ex-gratia
  const lifetimeCapApplied = enhancedGross > LIFETIME_CAP;
  let enhancedAfterLifetimeCap = enhancedGross;
  if (lifetimeCapApplied) {
    enhancedAfterLifetimeCap = LIFETIME_CAP;
    warnings.push(`⚠️ Lifetime cap of €${LIFETIME_CAP.toLocaleString()} applied to enhanced/ex-gratia payments.`);
  }

  // Determine taxable portion of enhanced/ex-gratia
  // Statutory redundancy is tax-free; enhanced/ex-gratia is normally taxable (but top-slice relief may apply)
  const enhancedTaxable = Math.round(enhancedAfterLifetimeCap * 100) / 100;

  // 4) PILON & Holiday pay: taxed at ~52% marginal rate
  const pilonTaxable = safeNumber(inputs.pilon);
  const holidayTaxable = safeNumber(inputs.holidayPay);
  const pilonTaxDeductedApprox = Math.round(pilonTaxable * PILON_MARGINAL_RATE * 100) / 100;
  const holidayTaxDeductedApprox = Math.round(holidayTaxable * PILON_MARGINAL_RATE * 100) / 100;

  // 5) Top slice relief: 33% on taxable enhanced redundancy
  // NOTE: Top-slice relief reduces the tax on the enhanced redundancy by applying the normal rate to a 'top slice'
  // For the purpose of this calculator we compute a simple relief amount = enhancedTaxable * TOP_SLICE_RELIEF_RATE
  const enhancedTopSliceRelief = Math.round(enhancedTaxable * TOP_SLICE_RELIEF_RATE * 100) / 100;

  // Warnings: pension waiver irreversible
  if (inputs.pensionWaived && inputs.hasPension) {
    if (!warnings.includes('⚠️ Pension waived: this is irreversible and may have pension consequences.')) {
      warnings.push('⚠️ Pension waived: this is irreversible and may have pension consequences.');
    }
  }

  // Build breakdown
  const breakdown = {
    statutory: {
      formula: '[(years × 2) + 1] × min(weekly_pay, €600) - 100% tax-free',
      weeklyPayUsed: weeklyUsed,
      yearsService: inputs.yearsService,
    },
    enhanced: {
      type: inputs.enhancedType || 'none',
      components: enhancedComponents,
    },
  };

  const results: RedundancyResults = {
    statutoryRedundancy,
    statutoryWeeklyCap,

    enhancedGross,
    enhancedAfterLifetimeCap,
    enhancedTaxable,
    enhancedTopSliceRelief,

    pilonTaxable,
    holidayTaxable,
    pilonTaxDeductedApprox,
    holidayTaxDeductedApprox,

    lifetimeCapApplied,
    warnings,

    breakdown,
  };

  return results;
}

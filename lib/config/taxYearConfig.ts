/**
 * Single rate book used by the Next.js calculators.
 *
 * 2025/2026 figures follow Budget notes already recorded in this file
 * (see commit history: "Correct all tax year rates against Revenue.ie Budget data").
 * Married personal credit is twice the single personal credit (joint assessment,
 * one income — same assumption as the married standard-rate band).
 * Married two-income: the band rises by up to marriedSecondEarnerIncrease (lower earner's income), see calculateNetIncome.
 *
 * config/tax_years/*.yml is an older draft and is not used by these calculators.
 */

export const CURRENT_TAX_YEAR = 2026;

export function formatTaxYearLabel(year: number): string {
  return `${year} tax year`;
}

export function getDefaultTaxYear(): number {
  return CURRENT_TAX_YEAR;
}

export type TaxBand = {
  upTo: number | null;
  rate: number;
};

export type TaxCredits = {
  personal: number;
  paye: number;
  homeCarer?: number;
  additional?: number;
};

export type TaxYearConfig = {
  year: number;
  incomeTaxBandsSingle: TaxBand[];
  incomeTaxBandsMarried: TaxBand[];
  uscBands: TaxBand[];
  prsiRate: number;
  /** Rate changes partway through the year, sorted; fromMonth is 1–12 (the change starts on the 1st of that month). */
  prsiRateChanges?: { fromMonth: number; rate: number }[];
  credits: TaxCredits;
  creditsMarried: TaxCredits;
  /**
   * Single Person Child Carer Credit and the standard rate band that comes with it (single + €4,000).
   * Revenue tax relief charts; Revenue SPCCC page: "If you are due the SPCCC, then you are automatically due the increased rate band."
   */
  singlePersonChildCarer: { credit: number; band: number };
  /** Married / civil partners, both with income: maximum increase in the standard rate band (Revenue tax relief charts). */
  marriedSecondEarnerIncrease: number;
  /** Earned Income Tax Credit (self-employed): lower of this or 20% of earned income. Revenue tax relief charts. */
  earnedIncomeCredit: number;
  /** Class S PRSI annual minimum when Class S applies (DSP / Revenue). 2024 is the self-assessment blend. */
  classSMinimum: number;
  /** No USC when total income for the year does not exceed this (s.531AM(2) TCA 1997; Revenue USC manual 18D-00-01). */
  uscExemptionThreshold: number;
  /** Class A employee PRSI: nil at or below weeklyNilUpTo; tapered weekly credit up to creditTaperTo (DSP Class A rates). */
  classAPrsi: ClassAPrsiRules;
};

export type ClassAPrsiRules = {
  /** Weekly earnings at or below this pay no employee PRSI (subclass A0). */
  weeklyNilUpTo: number;
  /** Maximum weekly PRSI credit, reduced by one-sixth of earnings over weeklyNilUpTo + €0.01. */
  creditMax: number;
  /** The credit applies on weekly earnings up to and including this (subclass AX). */
  creditTaperTo: number;
};

/** Unchanged 2023–2026: €352 weekly nil band, €12 tapered credit on €352.01–€424 (DSP Class A rates; Revenue Employer Notice 2024). */
const CLASS_A_PRSI_2016_ON: ClassAPrsiRules = { weeklyNilUpTo: 352, creditMax: 12, creditTaperTo: 424 };
/** USC exemption threshold €13,000 for 2016 onwards (Revenue USC manual 18D-00-01; "Payments and income exempt from USC"). */
const USC_EXEMPTION_2016_ON = 13000;

const baseConfigs: Record<number, TaxYearConfig> = {
  2023: {
    year: 2023,
    incomeTaxBandsSingle: [
      { upTo: 40000, rate: 0.2 },
      { upTo: null, rate: 0.4 },
    ],
    incomeTaxBandsMarried: [
      { upTo: 49000, rate: 0.2 },
      { upTo: null, rate: 0.4 },
    ],
    uscBands: [
      { upTo: 12012, rate: 0.005 },
      { upTo: 22920, rate: 0.02 },
      { upTo: 70044, rate: 0.045 },
      { upTo: null, rate: 0.08 },
    ],
    prsiRate: 0.04,
    credits: { personal: 1775, paye: 1775 },
    creditsMarried: { personal: 3550, paye: 1775 },
    singlePersonChildCarer: { credit: 1650, band: 44000 },
    marriedSecondEarnerIncrease: 31000,
    earnedIncomeCredit: 1775,
    classSMinimum: 500,
    uscExemptionThreshold: USC_EXEMPTION_2016_ON,
    classAPrsi: CLASS_A_PRSI_2016_ON,
  },
  2024: {
    year: 2024,
    incomeTaxBandsSingle: [
      { upTo: 42000, rate: 0.2 },
      { upTo: null, rate: 0.4 },
    ],
    incomeTaxBandsMarried: [
      { upTo: 51000, rate: 0.2 },
      { upTo: null, rate: 0.4 },
    ],
    uscBands: [
      { upTo: 12012, rate: 0.005 },
      { upTo: 25760, rate: 0.02 },
      { upTo: 70044, rate: 0.04 },
      { upTo: null, rate: 0.08 },
    ],
    // PRSI (Class A and Class S): 4% Jan–Sep 2024, 4.1% from 1 Oct 2024 (Social Welfare (Misc. Provisions) Act 2024 s.3).
    // Month-weighted in calculatePRSI: 9 months at 4% + 3 months at 4.1% = 4.025% blend.
    prsiRate: 0.04,
    prsiRateChanges: [{ fromMonth: 10, rate: 0.041 }],
    credits: { personal: 1875, paye: 1875 },
    creditsMarried: { personal: 3750, paye: 1875 },
    singlePersonChildCarer: { credit: 1750, band: 46000 },
    marriedSecondEarnerIncrease: 33000,
    earnedIncomeCredit: 1875,
    classSMinimum: 537.5, // €500 to 30 Sep 2024, €650 from 1 Oct 2024: blended €537.50 for 2024 self-assessment
    uscExemptionThreshold: USC_EXEMPTION_2016_ON,
    classAPrsi: CLASS_A_PRSI_2016_ON,
  },
  2025: {
    year: 2025,
    incomeTaxBandsSingle: [
      { upTo: 44000, rate: 0.2 },
      { upTo: null, rate: 0.4 },
    ],
    incomeTaxBandsMarried: [
      { upTo: 53000, rate: 0.2 },
      { upTo: null, rate: 0.4 },
    ],
    uscBands: [
      { upTo: 12012, rate: 0.005 },
      { upTo: 27382, rate: 0.02 },
      { upTo: 70044, rate: 0.03 },
      { upTo: null, rate: 0.08 },
    ],
    // PRSI (Class A and Class S): 4.1% Jan–Sep 2025, 4.2% from 1 Oct 2025 (Social Welfare (Misc. Provisions) Act 2024 s.3).
    // Month-weighted in calculatePRSI: 9 months at 4.1% + 3 months at 4.2% = 4.125% blend.
    prsiRate: 0.041,
    prsiRateChanges: [{ fromMonth: 10, rate: 0.042 }],
    credits: { personal: 2000, paye: 2000 },
    creditsMarried: { personal: 4000, paye: 2000 },
    singlePersonChildCarer: { credit: 1900, band: 48000 },
    marriedSecondEarnerIncrease: 35000,
    earnedIncomeCredit: 2000,
    classSMinimum: 650,
    uscExemptionThreshold: USC_EXEMPTION_2016_ON,
    classAPrsi: CLASS_A_PRSI_2016_ON,
  },
  2026: {
    year: 2026,
    // Budget 2026: No change to income tax bands (same as 2025)
    incomeTaxBandsSingle: [
      { upTo: 44000, rate: 0.2 },
      { upTo: null, rate: 0.4 },
    ],
    incomeTaxBandsMarried: [
      { upTo: 53000, rate: 0.2 },
      { upTo: null, rate: 0.4 },
    ],
    // Budget 2026: 2% USC ceiling increased from €27,382 to €28,700
    // 3% rate applies from €28,700.01 to €70,044
    uscBands: [
      { upTo: 12012, rate: 0.005 },
      { upTo: 28700, rate: 0.02 },
      { upTo: 70044, rate: 0.03 },
      { upTo: null, rate: 0.08 },
    ],
    // PRSI (Class A employee): 4.2% Jan–Sep 2026, 4.35% from 1 Oct 2026 (DSP Class A rates page).
    // Weighted by month in calculatePRSI: 9 months at 4.2% + 3 months at 4.35%.
    prsiRate: 0.042,
    prsiRateChanges: [{ fromMonth: 10, rate: 0.0435 }],
    // Budget 2026: No change to credits (same as 2025)
    credits: { personal: 2000, paye: 2000 },
    creditsMarried: { personal: 4000, paye: 2000 },
    singlePersonChildCarer: { credit: 1900, band: 48000 },
    marriedSecondEarnerIncrease: 35000,
    earnedIncomeCredit: 2000,
    classSMinimum: 650,
    uscExemptionThreshold: USC_EXEMPTION_2016_ON,
    classAPrsi: CLASS_A_PRSI_2016_ON,
  },
};

export function getTaxYearConfig(year: number): TaxYearConfig {
  return baseConfigs[year] ?? baseConfigs[2026];
}

export function listSupportedYears(): number[] {
  return Object.keys(baseConfigs).map(Number).sort();
}

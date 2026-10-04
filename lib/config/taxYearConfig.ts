/**
 * Single rate book used by the Next.js calculators.
 *
 * 2025/2026 figures follow Budget notes already recorded in this file
 * (see commit history: "Correct all tax year rates against Revenue.ie Budget data").
 * Married personal credit is twice the single personal credit (joint assessment,
 * one income — same assumption as the married standard-rate band).
 * Married two-income bands are not modelled.
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
};

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
    prsiRate: 0.04,
    credits: { personal: 1875, paye: 1875 },
    creditsMarried: { personal: 3750, paye: 1875 },
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
    prsiRate: 0.04,
    credits: { personal: 2000, paye: 2000 },
    creditsMarried: { personal: 4000, paye: 2000 },
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
  },
};

export function getTaxYearConfig(year: number): TaxYearConfig {
  return baseConfigs[year] ?? baseConfigs[2026];
}

export function listSupportedYears(): number[] {
  return Object.keys(baseConfigs).map(Number).sort();
}

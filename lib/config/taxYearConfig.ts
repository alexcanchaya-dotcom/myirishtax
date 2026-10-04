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

import { BUDGET_2027, type Budget2027 } from './taxYear2027';

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

/**
 * Maps the Budget 2027 config to a TaxYearConfig.
 * Throws if any field the engine needs is still blank, so a half-filled config fails the build.
 */
export function toTaxYearConfig(b: Budget2027): TaxYearConfig {
  const missing: string[] = [];
  const need = (value: number | null, blank: string): number => {
    if (value === null || value === undefined || Number.isNaN(value)) {
      missing.push(blank);
      return 0;
    }
    return value;
  };
  const standardRate = need(b.incomeTax.standardRate, '2027_STANDARD_RATE');
  const higherRate = need(b.incomeTax.higherRate, '2027_HIGHER_RATE');
  const bandSingle = need(b.incomeTax.bandSingle, '2027_STANDARD_RATE_BAND_SINGLE');
  const bandMarried = need(b.incomeTax.bandMarriedOneEarner, '2027_STANDARD_RATE_BAND_MARRIED_ONE_EARNER');
  const personalSingle = need(b.credits.personalSingle, '2027_PERSONAL_CREDIT_SINGLE');
  const personalMarried = need(b.credits.personalMarried, '2027_PERSONAL_CREDIT_MARRIED');
  const employeePaye = need(b.credits.employeePaye, '2027_EMPLOYEE_PAYE_CREDIT');
  const uscBands: TaxBand[] = b.usc.bands.map((band, i) => ({
    upTo: band.upTo === 'balance' ? null : need(band.upTo, `2027_USC_BAND_${i + 1}_TOP`),
    rate: need(band.rate, `2027_USC_RATE_${i + 1}`),
  }));
  const prsiRate = need(b.prsi.rateFrom1Jan, '2027_PRSI_RATE_FROM_1_JAN');
  let prsiRateChanges: TaxYearConfig['prsiRateChanges'];
  if (b.prsi.changeMonth !== null || b.prsi.rateAfterChange !== null) {
    const fromMonth = need(b.prsi.changeMonth, '2027_PRSI_CHANGE_DATE');
    const rate = need(b.prsi.rateAfterChange, '2027_PRSI_RATE_AFTER_CHANGE');
    if (fromMonth < 1 || fromMonth > 12) missing.push('2027_PRSI_CHANGE_DATE (month must be 1–12)');
    prsiRateChanges = [{ fromMonth, rate }];
  }
  if (missing.length > 0) {
    throw new Error(`Budget 2027 config is marked confirmed but these blanks are empty: ${missing.join(', ')}`);
  }
  return {
    year: 2027,
    incomeTaxBandsSingle: [
      { upTo: bandSingle, rate: standardRate },
      { upTo: null, rate: higherRate },
    ],
    incomeTaxBandsMarried: [
      { upTo: bandMarried, rate: standardRate },
      { upTo: null, rate: higherRate },
    ],
    uscBands,
    prsiRate,
    ...(prsiRateChanges ? { prsiRateChanges } : {}),
    credits: { personal: personalSingle, paye: employeePaye },
    creditsMarried: { personal: personalMarried, paye: employeePaye },
  };
}

// 2027 only exists once the official figures are filled in and marked confirmed.
if (BUDGET_2027.status === 'confirmed') {
  baseConfigs[2027] = toTaxYearConfig(BUDGET_2027);
}

export function isTaxYearAvailable(year: number): boolean {
  return year in baseConfigs;
}

export function getTaxYearConfig(year: number): TaxYearConfig {
  return baseConfigs[year] ?? baseConfigs[2026];
}

export function listSupportedYears(): number[] {
  return Object.keys(baseConfigs).map(Number).sort();
}

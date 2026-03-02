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
  credits: TaxCredits;
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
    // PRSI: 4.2% from Jan 2026, increasing to 4.35% from Oct 2026
    // Using 4.2% as the standard rate for the year
    prsiRate: 0.042,
    // Budget 2026: No change to credits (same as 2025)
    credits: { personal: 2000, paye: 2000 },
  },
};

export function getTaxYearConfig(year: number): TaxYearConfig {
  return baseConfigs[year] ?? baseConfigs[2026];
}

export function listSupportedYears(): number[] {
  return Object.keys(baseConfigs).map(Number).sort();
}

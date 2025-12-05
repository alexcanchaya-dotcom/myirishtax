export type USCStep = {
  limit: number;
  rate: number;
};

export type MaritalStatus = 'single' | 'single_parent' | 'married_one_income' | 'married_two_incomes';

export type TaxYearConfig = {
  year: number;
  uscBands: USCStep[];
  prsiRate: number;
  standardRate: number;
  higherRate: number;
  standardRateCutoff: Record<MaritalStatus, number>;
  defaultCredits: Record<MaritalStatus, number>;
};

export const TAX_CONFIGS: Record<number, TaxYearConfig> = {
  2024: {
    year: 2024,
    uscBands: [
      { limit: 12012, rate: 0.005 },
      { limit: 25760, rate: 0.02 },
      { limit: 70444, rate: 0.045 },
      { limit: Infinity, rate: 0.08 }
    ],
    prsiRate: 0.04,
    standardRate: 0.2,
    higherRate: 0.4,
    standardRateCutoff: {
      single: 42000,
      single_parent: 47000,
      married_one_income: 51000,
      married_two_incomes: 84000
    },
    defaultCredits: {
      single: 3500,
      single_parent: 4000,
      married_one_income: 7000,
      married_two_incomes: 7000
    }
  },
  2025: {
    year: 2025,
    uscBands: [
      { limit: 12012, rate: 0.005 },
      { limit: 25460, rate: 0.02 },
      { limit: 55216, rate: 0.045 },
      { limit: Infinity, rate: 0.08 }
    ],
    prsiRate: 0.04,
    standardRate: 0.2,
    higherRate: 0.4,
    standardRateCutoff: {
      single: 42000,
      single_parent: 47000,
      married_one_income: 51000,
      married_two_incomes: 84000
    },
    defaultCredits: {
      single: 3500,
      single_parent: 4000,
      married_one_income: 7000,
      married_two_incomes: 7000
    }
  }
};

export function getTaxConfig(year: number): TaxYearConfig {
  const config = TAX_CONFIGS[year];
  if (!config) {
    throw new Error(`No tax configuration found for year ${year}`);
  }
  return config;
}

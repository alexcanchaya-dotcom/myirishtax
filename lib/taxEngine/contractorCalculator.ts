/**
 * Contractor/Self-Employed Tax Calculator for Ireland
 *
 * Uses the same rate book as the PAYE engine (lib/config/taxYearConfig.ts).
 * Self-employed people get the personal tax credit only (no PAYE credit).
 * Credits reduce income tax only — not USC or Class S PRSI.
 */

import { getTaxYearConfig } from '../config/taxYearConfig';
import { calculateCredits, calculatePAYE, calculatePRSI, calculateUSC, sumBands } from './index';

export interface ContractorInput {
  grossIncome: number;
  expenses: number;
  pensionContribution?: number;
  taxYear: number;
  maritalStatus: 'single' | 'married';
  previousYearTax?: number;
}

export interface ExpenseCategory {
  category: string;
  amount: number;
  description?: string;
}

export interface ContractorBreakdown {
  grossIncome: number;
  totalExpenses: number;
  taxableIncome: number;
  incomeTax: {
    bands: Array<{ band: string; rate: string; tax: number }>;
    total: number;
    afterCredits: number;
  };
  usc: {
    bands: Array<{ band: string; rate: string; charge: number }>;
    total: number;
  };
  prsi: {
    rate: string;
    amount: number;
  };
  credits: {
    personalCredit: number;
    total: number;
  };
  totalTax: number;
  totalTaxAndPrsi: number;
  netIncome: number;
  effectiveTaxRate: number;
  preliminaryTax?: {
    method: 'current_year' | 'previous_year' | 'lower';
    amount: number;
    dueDate: string;
  };
  monthly: number;
  weekly: number;
  daily: number;
}

/** Class S PRSI applies above this income floor (existing note in this calculator). */
const CLASS_S_PRSI_THRESHOLD = 5000;
/** DSP Class S minimum annual contribution when Class S applies (self-assessed). */
const CLASS_S_PRSI_MINIMUM = 650;

function formatClassSRate(config: ReturnType<typeof getTaxYearConfig>): string {
  if (!config.prsiRateChanges?.length) {
    return `${(config.prsiRate * 100).toFixed(1)}%`;
  }
  // Effective full-year blend when rates change partway through the year (2026: 4.2375%).
  const blend = calculatePRSI(1, config);
  const pct = blend * 100;
  const rounded = Math.abs(pct * 10000 - Math.round(pct * 10000)) < 1e-6 ? (Math.round(pct * 10000) / 10000) : pct;
  return `${rounded}%`;
}

export function calculateContractorTax(input: ContractorInput): ContractorBreakdown {
  const config = getTaxYearConfig(input.taxYear);
  const { grossIncome, expenses, pensionContribution = 0, maritalStatus } = input;

  const taxableIncome = Math.max(0, grossIncome - expenses - pensionContribution);

  const payeBreakdown = calculatePAYE(taxableIncome, config, maritalStatus);
  const uscBreakdown = calculateUSC(grossIncome, config);

  const totalIncomeTax = sumBands(payeBreakdown);
  const totalUsc = sumBands(uscBreakdown);

  const prsiableIncome = Math.max(0, grossIncome - CLASS_S_PRSI_THRESHOLD);
  // Same month-weighted rate book as the take-home calculator (2026: 4.2% Jan–Sep, 4.35% from 1 Oct → 4.2375%).
  // Above the €5,000 floor: percentage or €650 minimum, whichever is greater (DSP Class S).
  // At or under the floor: no Class S PRSI.
  const totalPrsi =
    prsiableIncome > 0 ? Math.max(calculatePRSI(prsiableIncome, config), CLASS_S_PRSI_MINIMUM) : 0;

  const personalCredit = calculateCredits(config, 0, maritalStatus, { includePayeCredit: false });
  const incomeTaxAfterCredits = Math.max(0, totalIncomeTax - personalCredit);
  const totalTaxAndPrsi = incomeTaxAfterCredits + totalUsc + totalPrsi;
  const netIncome = grossIncome - expenses - totalTaxAndPrsi;
  const effectiveTaxRate = grossIncome > 0 ? (totalTaxAndPrsi / grossIncome) * 100 : 0;

  let preliminaryTax: ContractorBreakdown['preliminaryTax'];
  if (input.previousYearTax !== undefined) {
    const currentYearEstimate = incomeTaxAfterCredits * 0.9;
    const previousYearAmount = input.previousYearTax;
    const lowerAmount = Math.min(currentYearEstimate, previousYearAmount);

    preliminaryTax = {
      method: lowerAmount === currentYearEstimate ? 'current_year' : 'previous_year',
      amount: lowerAmount,
      dueDate: `October 31, ${input.taxYear}`,
    };
  }

  return {
    grossIncome,
    totalExpenses: expenses,
    taxableIncome,
    incomeTax: {
      bands: payeBreakdown.map((band) => ({
        band: band.band,
        rate: `${band.rate * 100}%`,
        tax: band.amount,
      })),
      total: totalIncomeTax,
      afterCredits: incomeTaxAfterCredits,
    },
    usc: {
      bands: uscBreakdown.map((band) => ({
        band: band.band,
        rate: `${band.rate * 100}%`,
        charge: band.amount,
      })),
      total: totalUsc,
    },
    prsi: {
      rate: `${formatClassSRate(config)} (Class S)`,
      amount: totalPrsi,
    },
    credits: {
      personalCredit,
      total: personalCredit,
    },
    totalTax: incomeTaxAfterCredits + totalUsc,
    totalTaxAndPrsi,
    netIncome,
    effectiveTaxRate,
    preliminaryTax,
    monthly: netIncome / 12,
    weekly: netIncome / 52,
    daily: netIncome / 365,
  };
}

export const COMMON_EXPENSE_CATEGORIES = [
  'Office Rent',
  'Equipment & Software',
  'Phone & Internet',
  'Travel & Mileage',
  'Professional Fees (Accountant, Legal)',
  'Insurance',
  'Marketing & Advertising',
  'Training & Education',
  'Bank Charges',
  'Subscriptions',
  'Other',
] as const;

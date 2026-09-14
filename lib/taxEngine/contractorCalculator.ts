/**
 * Contractor/Self-Employed Tax Calculator for Ireland
 *
 * Uses the same rate book as the PAYE engine (lib/config/taxYearConfig.ts).
 * Self-employed people get the personal tax credit only (no PAYE credit).
 * Credits reduce income tax only — not USC or Class S PRSI.
 */

import { getTaxYearConfig } from '../config/taxYearConfig';
import { calculateCredits, calculatePAYE, calculateUSC, sumBands } from './index';

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

export function calculateContractorTax(input: ContractorInput): ContractorBreakdown {
  const config = getTaxYearConfig(input.taxYear);
  const { grossIncome, expenses, pensionContribution = 0, maritalStatus } = input;

  const taxableIncome = Math.max(0, grossIncome - expenses - pensionContribution);

  const payeBreakdown = calculatePAYE(taxableIncome, config, maritalStatus);
  const uscBreakdown = calculateUSC(grossIncome, config);

  const totalIncomeTax = sumBands(payeBreakdown);
  const totalUsc = sumBands(uscBreakdown);

  const prsiableIncome = Math.max(0, grossIncome - CLASS_S_PRSI_THRESHOLD);
  const totalPrsi = prsiableIncome * config.prsiRate;

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
      rate: `${(config.prsiRate * 100).toFixed(1)}% (Class S)`,
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

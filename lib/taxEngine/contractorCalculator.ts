/**
 * Contractor/Self-Employed Tax Calculator for Ireland
 *
 * Calculates tax for self-employed individuals including:
 * - Income Tax on profits (not PAYE)
 * - Universal Social Charge (USC)
 * - Self-employed PRSI (Class S)
 * - Preliminary tax estimates
 */

import { getTaxYearConfig } from '../config/taxYearConfig';

export interface ContractorInput {
  grossIncome: number;
  expenses: number;
  pensionContribution?: number;
  taxYear: number;
  maritalStatus: 'single' | 'married';
  // For preliminary tax
  previousYearTax?: number;
}

export interface ExpenseCategory {
  category: string;
  amount: number;
  description?: string;
}

export interface ContractorBreakdown {
  // Income
  grossIncome: number;
  totalExpenses: number;
  taxableIncome: number;

  // Tax calculations
  incomeTax: {
    bands: Array<{ band: string; rate: string; tax: number }>;
    total: number;
  };
  usc: {
    bands: Array<{ band: string; rate: string; charge: number }>;
    total: number;
  };
  prsi: {
    rate: string;
    amount: number;
  };

  // Credits (limited for self-employed)
  credits: {
    personalCredit: number;
    total: number;
  };

  // Totals
  totalTax: number;
  totalTaxAndPrsi: number;
  netIncome: number;
  effectiveTaxRate: number;

  // Preliminary tax (estimate for next year)
  preliminaryTax?: {
    method: 'current_year' | 'previous_year' | 'lower';
    amount: number;
    dueDate: string;
  };

  // Breakdown by period
  monthly: number;
  weekly: number;
  daily: number;
}

export function calculateContractorTax(input: ContractorInput): ContractorBreakdown {
  const config = getTaxYearConfig(input.taxYear);
  const { grossIncome, expenses, pensionContribution = 0, maritalStatus } = input;

  // Calculate taxable income (gross - expenses - pension)
  const taxableIncome = Math.max(0, grossIncome - expenses - pensionContribution);

  // Get tax bands for marital status
  const bands = config.incomeTax[maritalStatus];

  // Calculate Income Tax (same bands as PAYE, but no PAYE credit)
  const incomeTaxBands: Array<{ band: string; rate: string; tax: number }> = [];
  let remainingIncome = taxableIncome;
  let totalIncomeTax = 0;

  for (const band of bands) {
    if (remainingIncome <= 0) break;

    const taxableAtThisRate = band.limit === Infinity
      ? remainingIncome
      : Math.min(remainingIncome, band.limit);

    const tax = taxableAtThisRate * band.rate;
    totalIncomeTax += tax;

    incomeTaxBands.push({
      band: band.limit === Infinity ? `Over €${(taxableIncome - taxableAtThisRate).toLocaleString()}` : `€0 - €${band.limit.toLocaleString()}`,
      rate: `${(band.rate * 100)}%`,
      tax: tax,
    });

    remainingIncome -= taxableAtThisRate;
  }

  // Calculate USC (on gross income, not taxable income)
  const uscBands: Array<{ band: string; rate: string; charge: number }> = [];
  let remainingForUsc = grossIncome;
  let totalUsc = 0;

  for (const band of config.usc) {
    if (remainingForUsc <= 0) break;

    const chargeableAtThisRate = band.limit === Infinity
      ? remainingForUsc
      : Math.min(remainingForUsc, band.limit);

    const charge = chargeableAtThisRate * band.rate;
    totalUsc += charge;

    uscBands.push({
      band: band.limit === Infinity ? `Over €${(grossIncome - chargeableAtThisRate).toLocaleString()}` : `€0 - €${band.limit.toLocaleString()}`,
      rate: `${(band.rate * 100)}%`,
      charge: charge,
    });

    remainingForUsc -= chargeableAtThisRate;
  }

  // Calculate Self-Employed PRSI (Class S)
  // 4% on income over €5,000
  const prsiThreshold = 5000;
  const prsiRate = 0.04;
  const prsiableIncome = Math.max(0, grossIncome - prsiThreshold);
  const totalPrsi = prsiableIncome * prsiRate;

  // Self-employed only get Personal Tax Credit (no PAYE credit)
  const personalCredit = config.credits.personal;
  const totalCredits = personalCredit;

  // Calculate final tax after credits
  const taxBeforeCredits = totalIncomeTax + totalUsc;
  const taxAfterCredits = Math.max(0, totalIncomeTax - totalCredits) + totalUsc;
  const totalTaxAndPrsi = taxAfterCredits + totalPrsi;
  const netIncome = grossIncome - expenses - totalTaxAndPrsi;
  const effectiveTaxRate = grossIncome > 0 ? (totalTaxAndPrsi / grossIncome) * 100 : 0;

  // Calculate preliminary tax for next year
  // Self-employed must pay preliminary tax by Oct 31
  // 90% of current year tax OR 100% of previous year tax (whichever is lower)
  let preliminaryTax: ContractorBreakdown['preliminaryTax'];

  if (input.previousYearTax !== undefined) {
    const currentYearEstimate = totalTaxAfterCredits * 0.9;
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
      bands: incomeTaxBands,
      total: totalIncomeTax,
    },
    usc: {
      bands: uscBands,
      total: totalUsc,
    },
    prsi: {
      rate: `${(prsiRate * 100)}% (Class S)`,
      amount: totalPrsi,
    },
    credits: {
      personalCredit,
      total: totalCredits,
    },
    totalTax: taxAfterCredits,
    totalTaxAndPrsi,
    netIncome,
    effectiveTaxRate,
    preliminaryTax,
    monthly: netIncome / 12,
    weekly: netIncome / 52,
    daily: netIncome / 365,
  };
}

// Common expense categories for contractors
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

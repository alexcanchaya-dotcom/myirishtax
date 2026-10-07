/**
 * Contractor/Self-Employed Tax Calculator for Ireland
 *
 * Uses the same rate book as the PAYE engine (lib/config/taxYearConfig.ts).
 * Self-employed people get the personal tax credit and the Earned Income Tax Credit
 * (lower of the year's maximum or 20% of earned income; Revenue). No PAYE credit.
 * Credits reduce income tax only — not USC or Class S PRSI.
 * USC and Class S PRSI are charged on profit (income less allowable expenses); pension
 * contributions reduce income tax only (Revenue: no USC or PRSI relief on pension contributions).
 */

import { getTaxYearConfig } from '../config/taxYearConfig';
import { calculateCredits, calculatePAYE, calculatePRSI, calculatePensionRelief, calculateUSC, sumBands, type PensionRelief } from './index';

export interface ContractorInput {
  grossIncome: number;
  expenses: number;
  pensionContribution?: number;
  /** Age, for the pension relief age limit. Optional: without it only the 40% / €115,000 ceiling applies. */
  age?: number;
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
    earnedIncomeCredit: number;
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
  /** Pension relief: age % × profit (net relevant earnings, capped at €115,000). */
  pension: PensionRelief;
}

/**
 * Class S applies once reckonable income is €5,000 or more (Citizens Information: "If you earn less than
 * €5,000 … you are exempt"). It is then charged on ALL reckonable income (DSP: "of all your reckonable
 * income, or an annual minimum charge of €650, whichever is greater"). No €5,000 deduction.
 */
const CLASS_S_PRSI_THRESHOLD = 5000;
/** USC surcharge: 3% on non-PAYE income above €100,000 (Revenue "Other rates of USC"; s.531AN(2) TCA). */
const USC_SURCHARGE_THRESHOLD = 100000;
const USC_SURCHARGE_RATE = 0.03;

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
  const { grossIncome, expenses, pensionContribution = 0, maritalStatus, age } = input;

  // Profit = income less allowable expenses. This is the base for USC and Class S PRSI.
  const profit = Math.max(0, grossIncome - expenses);
  // Pension contributions reduce income tax only, within the age % of net relevant earnings (profit),
  // with earnings capped at €115,000 (Revenue Pensions Manual ch. 21 RACs / ch. 24 PRSAs).
  const pension = calculatePensionRelief(profit, pensionContribution, age);
  const taxableIncome = Math.max(0, profit - pension.relieved);

  const payeBreakdown = calculatePAYE(taxableIncome, config, maritalStatus);
  const uscBreakdown = calculateUSC(profit, config);
  if (profit > USC_SURCHARGE_THRESHOLD) {
    uscBreakdown.push({
      band: `surcharge on non-PAYE income over ${USC_SURCHARGE_THRESHOLD}`,
      amount: (profit - USC_SURCHARGE_THRESHOLD) * USC_SURCHARGE_RATE,
      rate: USC_SURCHARGE_RATE,
    });
  }

  const totalIncomeTax = sumBands(payeBreakdown);
  const totalUsc = sumBands(uscBreakdown);

  // Same month-weighted rate book as the take-home calculator (2026: 4.2% Jan–Sep, 4.35% from 1 Oct → 4.2375%).
  // At €5,000 or more: the rate on all profit, or the year's minimum (€650 for 2025/2026), whichever is greater.
  // Under €5,000: no Class S PRSI.
  const totalPrsi =
    profit >= CLASS_S_PRSI_THRESHOLD ? Math.max(calculatePRSI(profit, config), config.classSMinimum) : 0;

  const personalCredit = calculateCredits(config, 0, maritalStatus, { includePayeCredit: false });
  // Earned Income Tax Credit: lower of the year's maximum or 20% of earned income (Revenue).
  const earnedIncomeCredit = Math.min(config.earnedIncomeCredit, profit * 0.2);
  const totalCredits = personalCredit + earnedIncomeCredit;
  const incomeTaxAfterCredits = Math.max(0, totalIncomeTax - totalCredits);
  const totalTaxAndPrsi = incomeTaxAfterCredits + totalUsc + totalPrsi;
  // Take-home after tax and after the full pension contribution (same basis as the take-home calculator).
  const netIncome = grossIncome - expenses - pension.contribution - totalTaxAndPrsi;
  const effectiveTaxRate = grossIncome > 0 ? (totalTaxAndPrsi / grossIncome) * 100 : 0;

  let preliminaryTax: ContractorBreakdown['preliminaryTax'];
  if (input.previousYearTax !== undefined) {
    // Revenue: preliminary tax covers Income Tax, PRSI and USC — 90% of this year's total, or 100% of last year's.
    const currentYearEstimate = totalTaxAndPrsi * 0.9;
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
      earnedIncomeCredit,
      total: totalCredits,
    },
    totalTax: incomeTaxAfterCredits + totalUsc,
    totalTaxAndPrsi,
    netIncome,
    effectiveTaxRate,
    preliminaryTax,
    monthly: netIncome / 12,
    weekly: netIncome / 52,
    daily: netIncome / 365,
    pension,
  };
}

export const COMMON_EXPENSE_CATEGORIES = [
  'Office Rent',
  'Equipment & Software',
  'Phone & Internet',
  'Travel & Mileage',
  'Professional Fees (Bookkeeping, Legal)',
  'Insurance',
  'Marketing & Advertising',
  'Training & Education',
  'Bank Charges',
  'Subscriptions',
  'Other',
] as const;

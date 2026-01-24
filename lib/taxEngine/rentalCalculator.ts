/**
 * Rental Income Tax Calculator for Ireland
 *
 * Calculates tax on rental income including:
 * - Rental income tax at marginal rate
 * - Deductible expenses (mortgage interest, repairs, etc.)
 * - Rental Tax Credit (€600 for landlords)
 * - Pre-letting expenses
 */

export interface RentalInput {
  // Income
  grossRentalIncome: number;

  // Deductible expenses
  mortgageInterest: number; // Limited to 75% in recent years
  insurancePremiums: number;
  repairs: number;
  managementFees: number;
  accountingFees: number;
  legalFees: number;
  advertisingCosts: number;
  lptPropertyTax: number; // Not deductible but tracked
  otherExpenses: number;

  // Pre-letting expenses
  preLettingExpenses: number;

  // Other income for tax calculation
  otherIncome?: number;
  maritalStatus: 'single' | 'married';
  taxYear: number;
}

export interface RentalExpenseBreakdown {
  category: string;
  amount: number;
  deductible: boolean;
  notes?: string;
}

export interface RentalBreakdown {
  // Income
  grossRentalIncome: number;

  // Expenses
  deductibleExpenses: RentalExpenseBreakdown[];
  totalDeductibleExpenses: number;
  nonDeductibleExpenses: RentalExpenseBreakdown[];
  totalNonDeductibleExpenses: number;

  // Profit/Loss
  netRentalProfit: number;
  isLoss: boolean;

  // Tax calculation
  taxableIncome: number; // Rental profit + other income
  taxOnRental: number;
  rentalTaxCredit: number;
  taxAfterCredit: number;
  marginalRate: number;

  // Summary
  netIncomeAfterTax: number;
  effectiveTaxRate: number;

  // Breakdown
  monthly: {
    grossIncome: number;
    expenses: number;
    taxAfterCredit: number;
    netIncome: number;
  };
}

export function calculateRentalTax(input: RentalInput): RentalBreakdown {
  const {
    grossRentalIncome,
    mortgageInterest,
    insurancePremiums,
    repairs,
    managementFees,
    accountingFees,
    legalFees,
    advertisingCosts,
    lptPropertyTax,
    otherExpenses,
    preLettingExpenses,
    otherIncome = 0,
    maritalStatus,
  } = input;

  // Deductible expenses
  const deductibleExpenses: RentalExpenseBreakdown[] = [
    {
      category: 'Mortgage Interest (75% allowed)',
      amount: mortgageInterest * 0.75,
      deductible: true,
      notes: 'Only 75% of mortgage interest is deductible',
    },
    {
      category: 'Insurance Premiums',
      amount: insurancePremiums,
      deductible: true,
    },
    {
      category: 'Repairs & Maintenance',
      amount: repairs,
      deductible: true,
      notes: 'Must be repairs, not improvements',
    },
    {
      category: 'Management Fees',
      amount: managementFees,
      deductible: true,
    },
    {
      category: 'Accounting Fees',
      amount: accountingFees,
      deductible: true,
    },
    {
      category: 'Legal Fees',
      amount: legalFees,
      deductible: true,
    },
    {
      category: 'Advertising',
      amount: advertisingCosts,
      deductible: true,
    },
    {
      category: 'Pre-letting Expenses',
      amount: preLettingExpenses,
      deductible: true,
      notes: 'Expenses incurred before first letting',
    },
    {
      category: 'Other Deductible Expenses',
      amount: otherExpenses,
      deductible: true,
    },
  ].filter(exp => exp.amount > 0);

  // Non-deductible expenses (for information)
  const nonDeductibleExpenses: RentalExpenseBreakdown[] = [
    {
      category: 'Local Property Tax (LPT)',
      amount: lptPropertyTax,
      deductible: false,
      notes: 'LPT is not deductible but is payable',
    },
    {
      category: 'Mortgage Interest (25% not allowed)',
      amount: mortgageInterest * 0.25,
      deductible: false,
      notes: 'Only 75% of mortgage interest is deductible',
    },
  ].filter(exp => exp.amount > 0);

  const totalDeductibleExpenses = deductibleExpenses.reduce(
    (sum, exp) => sum + exp.amount,
    0
  );
  const totalNonDeductibleExpenses = nonDeductibleExpenses.reduce(
    (sum, exp) => sum + exp.amount,
    0
  );

  // Calculate net rental profit
  const netRentalProfit = grossRentalIncome - totalDeductibleExpenses;
  const isLoss = netRentalProfit < 0;

  // Total taxable income (rental profit + other income)
  // Losses can be carried forward but not offset against other income
  const taxableRentalIncome = Math.max(0, netRentalProfit);
  const taxableIncome = taxableRentalIncome + otherIncome;

  // Determine marginal tax rate based on income brackets
  // Simplified: 20% up to €42,000 (single) or €51,000 (married)
  // 40% above that
  const standardRateBand = maritalStatus === 'married' ? 51000 : 42000;
  const marginalRate = taxableIncome > standardRateBand ? 0.4 : 0.2;

  // Calculate tax on rental income at marginal rate
  const taxOnRental = taxableRentalIncome * marginalRate;

  // Rental Tax Credit: €600
  const rentalTaxCredit = taxableRentalIncome > 0 ? 600 : 0;

  // Tax after credit
  const taxAfterCredit = Math.max(0, taxOnRental - rentalTaxCredit);

  // Net income after all taxes and expenses
  const netIncomeAfterTax = grossRentalIncome - totalDeductibleExpenses - totalNonDeductibleExpenses - taxAfterCredit;

  // Effective tax rate
  const effectiveTaxRate = grossRentalIncome > 0
    ? (taxAfterCredit / grossRentalIncome) * 100
    : 0;

  return {
    grossRentalIncome,
    deductibleExpenses,
    totalDeductibleExpenses,
    nonDeductibleExpenses,
    totalNonDeductibleExpenses,
    netRentalProfit,
    isLoss,
    taxableIncome,
    taxOnRental,
    rentalTaxCredit,
    taxAfterCredit,
    marginalRate,
    netIncomeAfterTax,
    effectiveTaxRate,
    monthly: {
      grossIncome: grossRentalIncome / 12,
      expenses: (totalDeductibleExpenses + totalNonDeductibleExpenses) / 12,
      taxAfterCredit: taxAfterCredit / 12,
      netIncome: netIncomeAfterTax / 12,
    },
  };
}

// Common rental expense categories
export const RENTAL_EXPENSE_CATEGORIES = [
  'Mortgage Interest',
  'Property Insurance',
  'Repairs & Maintenance',
  'Property Management Fees',
  'Accountant Fees',
  'Legal Fees',
  'Advertising (Letting)',
  'ESB/Gas (if paid by landlord)',
  'Refuse Collection',
  'Service Charges',
  'Ground Rent',
  'Local Property Tax (LPT)',
  'Other',
] as const;

/**
 * Auto-Enrolment (My Future Fund) Pension Calculator for Ireland
 *
 * Calculates projected pension pot and contributions under the Irish
 * Auto-Enrolment scheme launched 1 January 2026. Covers:
 * - Phased contribution rates (employee, employer, state) over 10 years
 * - Earnings cap of €80,000
 * - Investment growth projection to retirement
 * - Admin fee deduction (55c/week = €28.60/year)
 * - Year-by-year breakdown for charting
 */

export interface AutoEnrolmentInput {
  annualSalary: number;
  age: number;
  currentYear?: number;       // defaults to 2026
  retirementAge?: number;     // defaults to 66
  existingPensionPot?: number; // any existing savings
  investmentReturnRate?: number; // annual % return, default 5%
}

export interface AutoEnrolmentBreakdown {
  isEligible: boolean;
  eligibilityReason?: string;
  cappedSalary: number; // capped at €80,000

  // Current year contributions
  employeeContribution: number;
  employerContribution: number;
  stateContribution: number;
  totalAnnualContribution: number;

  // Monthly/weekly breakdown
  employeeMonthly: number;
  employeeWeekly: number;

  // Impact on take-home
  currentNetReduction: number; // how much less take-home per year

  // Projected pension pot at retirement
  projectedPot: number;
  totalEmployeeContributions: number;
  totalEmployerContributions: number;
  totalStateContributions: number;
  totalInvestmentGrowth: number;

  // Projected annual pension income (using 4% withdrawal rate)
  projectedAnnualPension: number;
  projectedMonthlyPension: number;

  // Year-by-year breakdown (for chart/table)
  yearlyBreakdown: YearlyBreakdown[];
}

export interface YearlyBreakdown {
  year: number;
  age: number;
  employeeRate: string;
  employerRate: string;
  stateRate: string;
  employeeContribution: number;
  employerContribution: number;
  stateContribution: number;
  totalContribution: number;
  cumulativePot: number;
}

// Admin fee: 55 cent per week = €28.60 per year
const ADMIN_FEE_ANNUAL = 28.6;

// Earnings cap for contributions
const EARNINGS_CAP = 80_000;

// Contribution rates phased over 10 years (applied to capped salary)
interface ContributionRates {
  employee: number;
  employer: number;
  state: number;
}

function getContributionRates(schemeYear: number): ContributionRates {
  // schemeYear = calendar year - 2025 (scheme starts 2026 = year 1)
  if (schemeYear <= 3) {
    // Years 1-3: 2026-2028
    return { employee: 0.015, employer: 0.015, state: 0.005 };
  } else if (schemeYear <= 6) {
    // Years 4-6: 2029-2031
    return { employee: 0.03, employer: 0.03, state: 0.01 };
  } else if (schemeYear <= 9) {
    // Years 7-9: 2032-2034
    return { employee: 0.045, employer: 0.045, state: 0.015 };
  } else {
    // Year 10+: 2035+
    return { employee: 0.06, employer: 0.06, state: 0.02 };
  }
}

function getRateLabel(rate: number): string {
  return `${(rate * 100).toString().replace(/\.0$/, '')}%`;
}

export function calculateAutoEnrolment(input: AutoEnrolmentInput): AutoEnrolmentBreakdown {
  const {
    annualSalary,
    age,
    currentYear = 2026,
    retirementAge = 66,
    existingPensionPot = 0,
    investmentReturnRate = 5,
  } = input;

  const annualReturnRate = investmentReturnRate / 100;

  // --- Eligibility check ---
  const isEligible = age >= 23 && age <= 60 && annualSalary >= 20_000;
  let eligibilityReason: string | undefined;

  if (age < 23) {
    eligibilityReason = 'You must be at least 23 years old to be automatically enrolled.';
  } else if (age > 60) {
    eligibilityReason = 'Auto-enrolment applies to workers aged 23–60.';
  } else if (annualSalary < 20_000) {
    eligibilityReason = 'Auto-enrolment applies to workers earning €20,000 or more per year.';
  }

  // Capped salary for contribution calculations
  const cappedSalary = Math.min(annualSalary, EARNINGS_CAP);

  // --- Current year rates (scheme year = currentYear - 2025) ---
  const schemeYearNow = currentYear - 2025;
  const currentRates = getContributionRates(schemeYearNow);

  const employeeContribution = cappedSalary * currentRates.employee;
  const employerContribution = cappedSalary * currentRates.employer;
  const stateContribution = cappedSalary * currentRates.state;
  const totalAnnualContribution =
    employeeContribution + employerContribution + stateContribution - ADMIN_FEE_ANNUAL;

  // Monthly / weekly employee cost
  const employeeMonthly = employeeContribution / 12;
  const employeeWeekly = employeeContribution / 52;

  // Net take-home reduction = employee contribution only (employer/state don't affect take-home)
  const currentNetReduction = employeeContribution;

  // --- Year-by-year projection ---
  const yearsToRetirement = Math.max(0, retirementAge - age);
  const yearlyBreakdown: YearlyBreakdown[] = [];

  let cumulativePot = existingPensionPot;
  let totalEmployeeContributions = 0;
  let totalEmployerContributions = 0;
  let totalStateContributions = 0;

  for (let i = 0; i < yearsToRetirement; i++) {
    const calendarYear = currentYear + i;
    const personAge = age + i;
    const schemeYear = calendarYear - 2025;

    // Only contribute while within the eligible age window (up to 60)
    const stillEligibleAge = personAge >= 23 && personAge <= 60;

    let empContrib = 0;
    let emplrContrib = 0;
    let stateContrib = 0;

    // Rates for this calendar year (used for both contributions and labels)
    const yearRates = getContributionRates(Math.max(1, schemeYear));

    if (stillEligibleAge && calendarYear >= 2026) {
      empContrib = cappedSalary * yearRates.employee;
      emplrContrib = cappedSalary * yearRates.employer;
      stateContrib = cappedSalary * yearRates.state;
    }

    const yearContribBeforeFee = empContrib + emplrContrib + stateContrib;
    const adminFeeThisYear = yearContribBeforeFee > 0 ? ADMIN_FEE_ANNUAL : 0;
    const yearContrib = yearContribBeforeFee - adminFeeThisYear;

    // Apply investment return to existing pot, then add new contributions.
    // Convention: grow existing pot at annual return, then add net contributions.
    cumulativePot = cumulativePot * (1 + annualReturnRate) + yearContrib;

    totalEmployeeContributions += empContrib;
    totalEmployerContributions += emplrContrib;
    totalStateContributions += stateContrib;

    yearlyBreakdown.push({
      year: calendarYear,
      age: personAge,
      employeeRate: stillEligibleAge && calendarYear >= 2026 ? getRateLabel(yearRates.employee) : '0%',
      employerRate: stillEligibleAge && calendarYear >= 2026 ? getRateLabel(yearRates.employer) : '0%',
      stateRate: stillEligibleAge && calendarYear >= 2026 ? getRateLabel(yearRates.state) : '0%',
      employeeContribution: empContrib,
      employerContribution: emplrContrib,
      stateContribution: stateContrib,
      totalContribution: yearContrib,
      cumulativePot: Math.round(cumulativePot),
    });
  }

  const projectedPot = Math.max(0, cumulativePot);
  const totalContributionsSum =
    totalEmployeeContributions + totalEmployerContributions + totalStateContributions;
  const totalAdminFees = ADMIN_FEE_ANNUAL * yearsToRetirement;
  const totalInvestmentGrowth = Math.max(
    0,
    projectedPot - existingPensionPot - totalContributionsSum + totalAdminFees,
  );

  // Projected pension income using 4% safe withdrawal rate
  const projectedAnnualPension = projectedPot * 0.04;
  const projectedMonthlyPension = projectedAnnualPension / 12;

  return {
    isEligible,
    eligibilityReason,
    cappedSalary,

    employeeContribution,
    employerContribution,
    stateContribution,
    totalAnnualContribution,

    employeeMonthly,
    employeeWeekly,

    currentNetReduction,

    projectedPot,
    totalEmployeeContributions,
    totalEmployerContributions,
    totalStateContributions,
    totalInvestmentGrowth,

    projectedAnnualPension,
    projectedMonthlyPension,

    yearlyBreakdown,
  };
}

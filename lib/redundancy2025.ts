// /lib/redundancy2025.ts
//
// Redundancy / termination payments (Revenue Tax and Duty Manual Part 05-05-19; Revenue "Lump sum payments").
// - Statutory redundancy: exempt from income tax, USC and PRSI (s.203 TCA 1997).
// - Ex-gratia lump sum (package less statutory, plus any non-contractual PILON): tax-free up to the best of
//   basic (€10,160 + €765 per complete year), increased (basic + up to €10,000, less any pension lump sum,
//   if no relief above basic in the previous 10 years) or SCSB (average pay × years ÷ 15, less any pension lump sum),
//   within the €200,000 lifetime limit (s.201(8)).
// - The taxable excess is charged to income tax and USC at the person's own rates. It is not reckonable for PRSI.
// - Contractual PILON and holiday pay are ordinary pay: income tax, USC and PRSI, no exemption.

import { getTaxYearConfig, CURRENT_TAX_YEAR } from './config/taxYearConfig';
import { calculateClassAPRSI, calculateCredits, calculatePAYE, calculateUSC, sumBands } from './taxEngine';

export interface RedundancyInputs {
  annualSalary: number; // gross annual salary (also used as the 36-month average for SCSB)
  weeklyPay?: number; // optional - will be derived from annualSalary if omitted
  yearsService: number; // complete years of service (integer >= 0)

  // Package components (amounts in euros)
  packageAmount?: number; // total redundancy package from the employer, including statutory redundancy (excluding PILON and holiday pay)
  pilon?: number; // pay in lieu of notice
  pilonContractual?: boolean; // default true: notice pay in the contract is taxable as pay (no exemption)
  holidayPay?: number; // accrued holiday pay (taxable as pay)

  // Pension information
  hasPension?: boolean;
  pensionLumpSum?: number; // tax-free pension lump sum received or receivable (relevant capital sum)
  pensionWaived?: boolean; // lump sum irrevocably given up: not deducted

  /** True if relief above the basic exemption was claimed in the previous 10 years (no increased exemption). */
  claimedAboveBasicLast10Years?: boolean;
  /** Tax-free termination relief already used on earlier payments (counts against the €200,000 lifetime limit). */
  priorReliefUsed?: number;

  taxYear?: number;
  statutoryWeeklyCap?: number; // defaults to 600
}

export type ExemptionMethod = 'basic' | 'increased' | 'scsb';

export interface RedundancyResults {
  statutoryRedundancy: number; // statutory, tax-free
  statutoryWeeklyCap: number;

  /** Package less statutory redundancy, plus non-contractual PILON. */
  exGratiaLumpSum: number;
  exemptions: { basic: number; increased: number | null; scsb: number };
  bestMethod: ExemptionMethod;
  /** Tax-free part of the ex-gratia lump sum (best exemption, within the lifetime limit, no more than the lump sum). */
  taxFreeLumpSum: number;
  /** Taxable part of the ex-gratia lump sum. */
  taxableLumpSum: number;
  lumpSumIncomeTax: number;
  lumpSumUsc: number;

  pilonTaxable: number; // contractual PILON (taxed as pay)
  holidayTaxable: number;
  pilonTax: number; // income tax + USC + PRSI on contractual PILON
  holidayTax: number; // income tax + USC + PRSI on holiday pay

  totalTax: number;
  netPackage: number; // package + PILON + holiday pay − tax on them

  lifetimeCapApplied: boolean;
  warnings: string[];

  breakdown: {
    statutory: { formula: string; weeklyPayUsed: number; yearsService: number };
    exemption: { method: ExemptionMethod; basic: number; increased: number | null; scsb: number; lifetimeLimitLeft: number };
    taxYear: number;
  };
}

// Constants
export const STATUTORY_WEEKLY_CAP = 600; // Redundancy Payments Act: weekly pay capped at €600
export const BASIC_EXGRATIA_BASE = 10160; // €10,160
export const BASIC_EXGRATIA_PER_YEAR = 765; // €765 × complete years
export const INCREASED_EXTRA_MAX = 10000; // up to €10,000 extra, less the pension lump sum
export const LIFETIME_CAP = 200000; // €200,000 lifetime limit on termination relief (s.201(8))

const round2 = (n: number) => Math.round(n * 100) / 100;

function safeNumber(input?: number): number {
  if (typeof input !== 'number' || Number.isNaN(input) || !Number.isFinite(input)) return 0;
  return Math.max(0, input);
}

function annualToWeekly(annual: number) {
  // 52.1429 weeks per year (average)
  return Math.round((annual / 52.1429) * 100) / 100;
}

/** Income tax (after single credits) and USC on an annual amount, plus Class A PRSI on the PRSI base. */
function taxOn(itUscBase: number, prsiBase: number, taxYear: number) {
  const config = getTaxYearConfig(taxYear);
  const credits = calculateCredits(config, 0, 'single');
  const it = Math.max(0, sumBands(calculatePAYE(itUscBase, config, 'single')) - credits);
  const usc = sumBands(calculateUSC(itUscBase, config));
  const prsi = calculateClassAPRSI(prsiBase, config);
  return { it, usc, prsi };
}

export function calculateRedundancy(raw: RedundancyInputs): RedundancyResults {
  const annualSalary = safeNumber(raw.annualSalary);
  const yearsService = Math.max(0, Math.floor(raw.yearsService || 0));
  const packageAmount = safeNumber(raw.packageAmount);
  const pilon = safeNumber(raw.pilon);
  const pilonContractual = raw.pilonContractual !== false;
  const holidayPay = safeNumber(raw.holidayPay);
  const pensionLumpSum = raw.hasPension && !raw.pensionWaived ? safeNumber(raw.pensionLumpSum) : 0;
  const priorReliefUsed = safeNumber(raw.priorReliefUsed);
  const taxYear = raw.taxYear ?? CURRENT_TAX_YEAR;
  const warnings: string[] = [];

  // 1) Statutory redundancy: [(years × 2) + 1] × min(weekly pay, €600). Tax-free.
  const weeklyPay = raw.weeklyPay ? safeNumber(raw.weeklyPay) : annualToWeekly(annualSalary);
  const statutoryWeeklyCap = raw.statutoryWeeklyCap || STATUTORY_WEEKLY_CAP;
  const weeklyUsed = Math.min(weeklyPay, statutoryWeeklyCap);
  const statutoryRedundancy = yearsService >= 2 ? round2((yearsService * 2 + 1) * weeklyUsed) : 0;
  if (yearsService < 2) warnings.push('Statutory redundancy needs at least 2 years (104 weeks) of service.');

  // 2) Ex-gratia lump sum = package − statutory (+ non-contractual PILON)
  if (packageAmount > 0 && packageAmount < statutoryRedundancy) {
    warnings.push('The package entered is less than the estimated statutory redundancy.');
  }
  const exGratiaFromPackage = Math.max(0, packageAmount - statutoryRedundancy);
  const exGratiaLumpSum = round2(exGratiaFromPackage + (pilonContractual ? 0 : pilon));

  // 3) Exemptions: best of basic, increased, SCSB
  const basic = BASIC_EXGRATIA_BASE + BASIC_EXGRATIA_PER_YEAR * yearsService;
  const increased = raw.claimedAboveBasicLast10Years ? null : basic + Math.max(0, INCREASED_EXTRA_MAX - pensionLumpSum);
  const scsb = Math.max(0, (annualSalary * yearsService) / 15 - pensionLumpSum);
  const candidates: [ExemptionMethod, number][] = [['basic', basic], ['scsb', scsb]];
  if (increased !== null) candidates.splice(1, 0, ['increased', increased]);
  const [bestMethod, bestExemption] = candidates.reduce((a, b) => (b[1] > a[1] ? b : a));

  // 4) €200,000 lifetime limit, less relief already used
  const lifetimeLimitLeft = Math.max(0, LIFETIME_CAP - priorReliefUsed);
  const lifetimeCapApplied = bestExemption > lifetimeLimitLeft && exGratiaLumpSum > lifetimeLimitLeft;
  if (lifetimeCapApplied) {
    warnings.push(`The €${LIFETIME_CAP.toLocaleString('en-IE')} lifetime limit on tax-free termination payments applies.`);
  }
  const taxFreeLumpSum = round2(Math.min(exGratiaLumpSum, bestExemption, lifetimeLimitLeft));
  const taxableLumpSum = round2(exGratiaLumpSum - taxFreeLumpSum);

  // 5) Tax at the person's own rates (income tax, USC; PRSI on pay items only)
  const pilonTaxable = pilonContractual ? pilon : 0;
  const payItems = pilonTaxable + holidayPay;
  const base = taxOn(annualSalary, annualSalary, taxYear);
  const withPay = taxOn(annualSalary + payItems, annualSalary + payItems, taxYear);
  const withAll = taxOn(annualSalary + payItems + taxableLumpSum, annualSalary + payItems, taxYear);
  const payItemsTax = withPay.it + withPay.usc + withPay.prsi - (base.it + base.usc + base.prsi);
  const pilonTax = round2(payItems > 0 ? (payItemsTax * pilonTaxable) / payItems : 0);
  const holidayTax = round2(payItems > 0 ? (payItemsTax * holidayPay) / payItems : 0);
  const lumpSumIncomeTax = round2(withAll.it - withPay.it);
  const lumpSumUsc = round2(withAll.usc - withPay.usc);
  const totalTax = round2(lumpSumIncomeTax + lumpSumUsc + pilonTax + holidayTax);
  const netPackage = round2(packageAmount + pilon + holidayPay - totalTax);

  if (raw.pensionWaived && raw.hasPension) {
    warnings.push('Pension lump sum given up: this is irreversible and may have pension consequences.');
  }

  return {
    statutoryRedundancy,
    statutoryWeeklyCap,
    exGratiaLumpSum,
    exemptions: { basic: round2(basic), increased: increased === null ? null : round2(increased), scsb: round2(scsb) },
    bestMethod,
    taxFreeLumpSum,
    taxableLumpSum,
    lumpSumIncomeTax,
    lumpSumUsc,
    pilonTaxable,
    holidayTaxable: holidayPay,
    pilonTax,
    holidayTax,
    totalTax,
    netPackage,
    lifetimeCapApplied,
    warnings,
    breakdown: {
      statutory: {
        formula: '[(years × 2) + 1] × min(weekly pay, €600), tax-free',
        weeklyPayUsed: weeklyUsed,
        yearsService,
      },
      exemption: {
        method: bestMethod,
        basic: round2(basic),
        increased: increased === null ? null : round2(increased),
        scsb: round2(scsb),
        lifetimeLimitLeft,
      },
      taxYear,
    },
  };
}

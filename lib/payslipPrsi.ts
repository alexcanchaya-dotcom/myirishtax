import { getTaxYearConfig } from './config/taxYearConfig';
import { calculateClassAPRSI, weeklyClassAPRSI } from './taxEngine';

/** October 2026 PRSI change worked from the engine's 2026 config (4.2% Jan–Sep, 4.35% from 1 Oct). */
export function octoberPrsiExample(annualPay: number) {
  const config = getTaxYearConfig(2026);
  const before = config.prsiRate;
  const after = config.prsiRateChanges?.find((c) => c.fromMonth === 10)?.rate ?? before;
  const weeklyPay = annualPay / 52;
  const weeklyBefore = weeklyClassAPRSI(weeklyPay, before, config);
  const weeklyAfter = weeklyClassAPRSI(weeklyPay, after, config);
  return {
    annualPay,
    before,
    after,
    weeklyPay,
    weeklyBefore,
    weeklyAfter,
    weeklyMore: weeklyAfter - weeklyBefore,
    monthlyBefore: (weeklyBefore * 52) / 12,
    monthlyAfter: (weeklyAfter * 52) / 12,
    monthlyMore: ((weeklyAfter - weeklyBefore) * 52) / 12,
    yearPrsi2026: calculateClassAPRSI(annualPay, config),
  };
}

export const OCTOBER_EXAMPLE_SALARIES = [30000, 45000, 60000, 80000];

/**
 * Irish Capital Gains Tax standard rate by disposal date.
 *
 * Budget 2027 cut the standard CGT rate from 33% to 31% for disposals made on or after 7 October 2026
 * (Dept of Finance, Budget 2027 Tax Policy Changes, p.7 §4.1; Financial Resolution No. 3).
 * The 33% rate for development land is unchanged; the tools here don't model development land.
 */
export const CGT_RATE_BEFORE_7_OCT_2026 = 0.33;
export const CGT_RATE_FROM_7_OCT_2026 = 0.31;
/** First disposal day taxed at 31% (Irish calendar date). */
export const CGT_RATE_CHANGE_DATE = '2026-10-07';
/** Shown wherever a gain has no disposal date and we assume the current 31% rate. */
export const CGT_NO_DATE_NOTE = 'Gains on disposals before 7 October 2026 are taxed at 33%.';

const dublinDay = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Dublin',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** The disposal's calendar day in Ireland as YYYY-MM-DD, or null if there's no usable date. */
export function irishDisposalDay(date?: string | null): string | null {
  if (!date) return null;
  const trimmed = date.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return null;
  return dublinDay.format(parsed);
}

/** Standard CGT rate for a disposal. With no usable date, the current rate (31%) is assumed. */
export function cgtRateForDisposal(date?: string | null): number {
  const day = irishDisposalDay(date);
  if (day === null) return CGT_RATE_FROM_7_OCT_2026;
  return day >= CGT_RATE_CHANGE_DATE ? CGT_RATE_FROM_7_OCT_2026 : CGT_RATE_BEFORE_7_OCT_2026;
}

export interface CGTRatePart {
  rate: number;
  taxableGain: number;
  cgtDue: number;
}

/**
 * Splits a year's taxable gain across the rates its gains were made at.
 * Losses and the annual exemption are set against the highest-rate gains first (the most
 * beneficial order for the taxpayer), so the taxable amount is filled from the lowest rate up.
 */
export function splitTaxableGainByRate(
  gainsByRate: Map<number, number>,
  taxableGain: number,
): { cgtDue: number; parts: CGTRatePart[] } {
  let remaining = Math.max(0, taxableGain);
  const parts: CGTRatePart[] = [];
  const rates = [...gainsByRate.keys()].sort((a, b) => a - b);
  for (const rate of rates) {
    if (remaining <= 0) break;
    const taxable = Math.min(remaining, Math.max(0, gainsByRate.get(rate) ?? 0));
    if (taxable <= 0) continue;
    parts.push({ rate, taxableGain: taxable, cgtDue: taxable * rate });
    remaining -= taxable;
  }
  return { cgtDue: parts.reduce((sum, p) => sum + p.cgtDue, 0), parts };
}

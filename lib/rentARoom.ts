/**
 * Rent-a-Room Relief checker (Revenue).
 * - Limit €14,000 of gross income (rent plus meals, laundry and similar charges), before expenses.
 *   At or under: no income tax, PRSI or USC on it. Over: the whole amount is taxed, not just the excess.
 * - Not for: your (or your civil partner's) child, your employer, short-term guests (lets of 28 days or less),
 *   except students, 'digs' and respite care.
 * - The room must be in your home (sole or main residence). One limit if jointly assessed (shared).
 * Source: https://www.revenue.ie/en/personal-tax-credits-reliefs-and-exemptions/land-and-property/rent-a-room-relief/qualifying-conditions.aspx
 *
 * 2027: €16,000 from 1 January 2027 (Department of Finance, Budget 2027 Tax Policy Changes §3.2, p.6), only while
 * BUDGET_2027.status is 'confirmed'. It still needs the Finance Bill to become law.
 */
import { BUDGET_2027 } from './config/taxYear2027';

export const RENT_A_ROOM_LIMIT: Record<number, number> = {
  2024: 14000,
  2025: 14000,
  2026: 14000,
};
if (BUDGET_2027.status === 'confirmed') RENT_A_ROOM_LIMIT[2027] = 16000; // TPC §3.2, p.6

export const RENT_A_ROOM_YEARS = Object.keys(RENT_A_ROOM_LIMIT).map(Number);

export type RentARoomInput = {
  year: number;
  rent: number;
  /** Meals, laundry, utilities and other charges paid by the lodger. */
  extras: number;
  inYourHome: boolean;
  tenantIsChildOrEmployer: boolean;
  /** Lets of 28 consecutive days or less, unless students, 'digs' or respite care. */
  shortTermGuests: boolean;
};

export type RentARoomResult = {
  limit: number;
  gross: number;
  status: 'exempt' | 'over-limit' | 'not-eligible';
  reasons: string[];
  /** Amount that is taxable (before expenses) on this simple check. */
  taxable: number;
  /** How far under (positive) or over (negative) the limit you are. */
  headroom: number;
};

export function checkRentARoom(input: RentARoomInput): RentARoomResult {
  const limit = RENT_A_ROOM_LIMIT[input.year];
  if (limit === undefined) throw new Error(`No Rent-a-Room limit for ${input.year}`);
  const gross = Math.max(0, input.rent) + Math.max(0, input.extras);
  const reasons: string[] = [];
  if (!input.inYourHome) reasons.push('The room must be in your own home (your sole or main residence).');
  if (input.tenantIsChildOrEmployer) reasons.push('Income from your child, or from your employer, does not qualify.');
  if (input.shortTermGuests)
    reasons.push('Short-term guests (lets of 28 days or less, including booking sites) do not qualify.');
  if (reasons.length > 0) return { limit, gross, status: 'not-eligible', reasons, taxable: gross, headroom: limit - gross };
  if (gross > limit) return { limit, gross, status: 'over-limit', reasons, taxable: gross, headroom: limit - gross };
  return { limit, gross, status: 'exempt', reasons, taxable: 0, headroom: limit - gross };
}

/** Revenue: a return "must be made within four years after the end of the tax year" (PAYE Income Tax Return page). */
export function refundYears(currentYear: number) {
  return { first: currentYear - 4, last: currentYear - 1, expiring: currentYear - 4 };
}

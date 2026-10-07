/**
 * Turns what someone typed or pasted into a number: drops €, commas and spaces ("€60,000" → 60000).
 * An empty box counts as 0 for the maths only; anything that still isn't a number is 0.
 */
export function parseAmount(raw: string): number {
  const n = Number(raw.replace(/[€,\s]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

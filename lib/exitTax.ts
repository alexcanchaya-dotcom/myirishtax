/**
 * Irish exit tax for individuals (Irish funds, life assurance policies since 2001 and equivalent EU/EEA/OECD funds,
 * including ETFs taxed under that regime). Not personal portfolio funds/policies (PPIU/PPLAP).
 *
 * - 38% from 1 January 2026 (Finance Act 2025; Revenue eBrief 016/26).
 * - Budget 2027 (6 Oct 2026) announced 35% "for introduction in 2027" (Tax Policy Changes §2.2, p.5).
 *   No start date yet: it will be set in the Finance Bill. Keep `startDate` null until it is law.
 * - Deemed disposal (every 8 years) is unchanged.
 */
export const EXIT_TAX = {
  current: { rate: 0.38, from: '1 January 2026' },
  announced: { rate: 0.35, startDate: null as string | null },
  deemedDisposalYears: 8,
} as const;

export function exitTaxOn(gain: number, rate: number): number {
  return Math.max(0, gain) * rate;
}

/** Gains used in the worked examples table on /exit-tax-ireland. */
export const EXIT_TAX_EXAMPLE_GAINS = [1000, 5000, 10000, 25000, 50000];

export function exitTaxExampleRows(gains: number[] = EXIT_TAX_EXAMPLE_GAINS) {
  return gains.map((gain) => {
    const now = exitTaxOn(gain, EXIT_TAX.current.rate);
    const announced = exitTaxOn(gain, EXIT_TAX.announced.rate);
    return { gain, now, announced, saving: now - announced };
  });
}

/** Deemed disposal: on each 8th anniversary you are taxed as if you sold, and the gain resets. */
export function deemedDisposalExample(invested: number, valueAt8Years: number, rate: number) {
  const gain = Math.max(0, valueAt8Years - invested);
  return { gain, tax: exitTaxOn(gain, rate), newBase: valueAt8Years };
}

/**
 * Irish exit tax for individuals (Irish funds, life assurance policies since 2001 and equivalent EU/EEA/OECD funds,
 * including ETFs taxed under that regime). Not personal portfolio funds/policies (PPIU/PPLAP).
 *
 * - 38% from 1 January 2026 (Finance Act 2025; Revenue eBrief 016/26).
 * - Budget 2027 (6 Oct 2026) announced 35% "for introduction in 2027" (Tax Policy Changes §2.2, p.5).
 * - Finance (No. 2) Bill 2026 (Bill 98 of 2026, as initiated) s.29(1) substitutes "35 per cent" for "38 per cent" in
 *   TCA ss.730F, 730J, 730K, 739D(5A), 739E, 747D, 747E; s.29(2) applies it to events/payments/disposals
 *   "on or after 1 January 2027". Still a Bill: `enacted` false until the Finance Act is signed.
 * - Deemed disposal (every 8 years) is unchanged.
 */
export const EXIT_TAX = {
  current: { rate: 0.38, from: '1 January 2026' },
  announced: { rate: 0.35, startDate: '1 January 2027' as string | null, enacted: false },
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

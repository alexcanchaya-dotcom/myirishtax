export function calculateUSC(profile, config) {
  const { bands, exemptions } = config.usc;
  if (exemptions?.income_under && profile.annualIncome < exemptions.income_under) {
    return { type: 'usc', liability: 0, breakdown: { exempt: true } };
  }

  let remaining = profile.annualIncome;
  let usc = 0;
  const bandBreakdown = [];

  for (const band of bands) {
    const ceiling = band.up_to ?? Infinity;
    const taxable = Math.max(0, Math.min(remaining, ceiling - (bandBreakdown.at(-1)?.limit || 0)));
    if (taxable > 0) {
      const charge = taxable * band.rate;
      usc += charge;
      bandBreakdown.push({ limit: ceiling, taxable, rate: band.rate, charge });
      remaining -= taxable;
    }
  }

  if (remaining > 0) {
    const rate = bands.at(-1)?.rate ?? 0.08;
    const charge = remaining * rate;
    usc += charge;
    bandBreakdown.push({ limit: null, taxable: remaining, rate, charge });
  }

  return { type: 'usc', liability: usc, breakdown: { bands: bandBreakdown } };
}

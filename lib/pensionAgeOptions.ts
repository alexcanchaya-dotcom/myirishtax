// Revenue age bands for pension relief; the value is a representative age for the band.
// https://www.revenue.ie/en/jobs-and-pensions/pension/relief/tax-relief-limits.aspx

/** Short plain-words hint shown under the age box on the take-home and contractor calculators. */
export const PENSION_AGE_HINT =
  'Only matters if you pay into a pension. Tax relief is capped at a share of your earnings that rises with age: 15% under 30, up to 40% at 60 or over, on earnings up to €115,000. Not set uses 40%.';
export const PENSION_AGE_OPTIONS = [
  { label: 'Not set (40% limit)', value: '' },
  { label: 'Under 30 (15%)', value: '29' },
  { label: '30–39 (20%)', value: '35' },
  { label: '40–49 (25%)', value: '45' },
  { label: '50–54 (30%)', value: '52' },
  { label: '55–59 (35%)', value: '57' },
  { label: '60 or over (40%)', value: '60' },
];

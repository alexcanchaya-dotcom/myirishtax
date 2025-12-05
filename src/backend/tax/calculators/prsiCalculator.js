function calculateCredit(config, weeklyPay) {
  const creditCfg = config.prsi.class_a.credit;
  if (!creditCfg) return 0;
  if (weeklyPay <= creditCfg.lower_threshold_weekly) return creditCfg.max_weekly_credit;
  if (weeklyPay >= creditCfg.upper_threshold_weekly) return 0;
  const taper =
    ((creditCfg.upper_threshold_weekly - weeklyPay) /
      (creditCfg.upper_threshold_weekly - creditCfg.lower_threshold_weekly)) *
    creditCfg.max_weekly_credit;
  return Math.max(0, taper);
}

export function calculatePRSI(profile, config) {
  const weeklyPay = profile.annualIncome / 52;
  const employeeRate = config.prsi.class_a.employee_rate;
  const gross = profile.annualIncome * employeeRate;
  const credit = calculateCredit(config, weeklyPay);
  const liability = Math.max(0, gross - credit * 52);

  return {
    type: 'prsi',
    liability,
    breakdown: { weeklyPay, employeeRate, creditPerWeek: credit }
  };
}

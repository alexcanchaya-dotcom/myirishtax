function resolveCompanyCarBenefit(benefitInput = {}, bikConfig) {
  const { company_car: companyCarCfg } = bikConfig;
  if (!benefitInput.companyCar) return { benefit: 0 };
  const { originalMarketValue = 0, businessKm = 0, co2Category } = benefitInput.companyCar;
  if (!originalMarketValue) return { benefit: 0, note: 'Company car OMV missing' };

  const category = companyCarCfg.co2_categories[co2Category];
  if (!category) return { benefit: 0, note: 'Unknown CO2 category' };

  const basePercentage = category.base_percentage;
  const discountBand = companyCarCfg.business_km_discounts.find(
    (band) =>
      businessKm >= band.min_km &&
      (band.max_km === null || businessKm <= band.max_km)
  );
  const discount = discountBand ? 1 - discountBand.discount : 1;
  const adjustedValue = Math.max(0, originalMarketValue - (companyCarCfg.electric_vehicle_omv_deduction || 0));
  const benefit = adjustedValue * basePercentage * discount;
  return { benefit, rateApplied: basePercentage * discount };
}

export function calculateBIK(profile, config) {
  const companyCar = resolveCompanyCarBenefit(profile.benefits, config.bik);
  return {
    type: 'bik',
    liability: companyCar.benefit,
    breakdown: { companyCar }
  };
}

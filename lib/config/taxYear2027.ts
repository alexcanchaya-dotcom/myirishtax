// Budget 2027 figures. Every null is a blank.
// Fill ONLY from the official Budget 2027 documents (see budget-2027-spec.md §1). No forecasts.
// While status is 'pending', 2027 is not added to the calculators and /budget-2027 shows only the pending line.
export type Pending<T> = T | null;

export const BUDGET_2027 = {
  status: 'pending' as 'pending' | 'confirmed',
  figuresCheckedOn: null as Pending<string>, // [[FIGURES_CHECKED_DATE]]
  startDate: null as Pending<string>, // [[2027_START_DATE]]
  sources: {
    speech: null as Pending<string>, // [[LINK_BUDGET_2027_SPEECH]]
    taxPolicyChanges: null as Pending<string>, // [[LINK_BUDGET_2027_TAX_POLICY_CHANGES]]
    revenueSummary: null as Pending<string>, // [[LINK_REVENUE_BUDGET_2027_SUMMARY]]
    prsi: null as Pending<string>, // [[LINK_DSP_BUDGET_2027_PRSI]]
    minimumWage: null as Pending<string>, // [[LINK_MINIMUM_WAGE_2027]] (optional)
  },
  incomeTax: {
    standardRate: null as Pending<number>, // [[2027_STANDARD_RATE]]  write rates as decimals (the 2026 rate of 20% is 0.2)
    higherRate: null as Pending<number>, // [[2027_HIGHER_RATE]]
    bandSingle: null as Pending<number>, // [[2027_STANDARD_RATE_BAND_SINGLE]]
    bandMarriedOneEarner: null as Pending<number>, // [[2027_STANDARD_RATE_BAND_MARRIED_ONE_EARNER]]
    bandMarriedTwoEarners: null as Pending<number>, // [[2027_STANDARD_RATE_BAND_MARRIED_TWO_EARNERS]] (page text only)
    twoEarnerMaxIncrease: null as Pending<number>, // [[2027_TWO_EARNER_MAX_INCREASE]] (page text only)
    bandOneParent: null as Pending<number>, // [[2027_STANDARD_RATE_BAND_ONE_PARENT]] (page text only)
  },
  credits: {
    personalSingle: null as Pending<number>, // [[2027_PERSONAL_CREDIT_SINGLE]]
    personalMarried: null as Pending<number>, // [[2027_PERSONAL_CREDIT_MARRIED]]
    employeePaye: null as Pending<number>, // [[2027_EMPLOYEE_PAYE_CREDIT]]
    earnedIncome: null as Pending<number>, // [[2027_EARNED_INCOME_CREDIT]] (page text only)
    homeCarer: null as Pending<number>, // [[2027_HOME_CARER_CREDIT]] (page text only)
    singlePersonChildCarer: null as Pending<number>, // [[2027_SINGLE_PERSON_CHILD_CARER_CREDIT]] (page text only)
    rentSingle: null as Pending<number>, // [[2027_RENT_TAX_CREDIT_SINGLE]] (page text only)
    rentCouple: null as Pending<number>, // [[2027_RENT_TAX_CREDIT_COUPLE]] (page text only)
  },
  usc: {
    exemptionThreshold: null as Pending<number>, // [[2027_USC_EXEMPTION_THRESHOLD]]
    bands: [
      { upTo: null as Pending<number>, rate: null as Pending<number> }, // [[2027_USC_BAND_1_TOP]] / [[2027_USC_RATE_1]]
      { upTo: null as Pending<number>, rate: null as Pending<number> }, // [[2027_USC_BAND_2_TOP]] / [[2027_USC_RATE_2]]
      { upTo: null as Pending<number>, rate: null as Pending<number> }, // [[2027_USC_BAND_3_TOP]] / [[2027_USC_RATE_3]]
      { upTo: 'balance' as Pending<number> | 'balance', rate: null as Pending<number> }, // [[2027_USC_RATE_4]]
    ],
  },
  prsi: {
    rateFrom1Jan: null as Pending<number>, // [[2027_PRSI_RATE_FROM_1_JAN]]
    changeMonth: null as Pending<number>, // from [[2027_PRSI_CHANGE_DATE]]: month number (1st of a month); null if no change
    rateAfterChange: null as Pending<number>, // [[2027_PRSI_RATE_AFTER_CHANGE]]; null if no change
    weeklyNilThreshold: null as Pending<number>, // [[2027_PRSI_WEEKLY_NIL_THRESHOLD]] (follow-up PR B)
    creditMaxWeekly: null as Pending<number>, // [[2027_PRSI_CREDIT_MAX_WEEKLY]] (follow-up PR B)
    creditTopWeekly: null as Pending<number>, // [[2027_PRSI_CREDIT_TOP]] (follow-up PR B)
  },
  minimumWage: {
    hourly: null as Pending<number>, // [[2027_MINIMUM_WAGE_HOURLY]] (page text only; leave null if not announced)
    startDate: null as Pending<string>, // [[2027_MINIMUM_WAGE_START_DATE]]
  },
  autoEnrolmentEmployeeRate: null as Pending<number>, // [[2027_AUTO_ENROLMENT_EMPLOYEE_RATE]] (only if changed)
  otherChanges: [] as string[], // [[2027_OTHER_CHANGES_FREE_TEXT]]
};

export type Budget2027 = typeof BUDGET_2027;

// Budget 2027 figures. Every null is a blank.
// Fill ONLY from the official Budget 2027 documents (see budget-2027-spec.md §1). No forecasts.
// Filled Tue 6 Oct 2026 from TPC = Dept of Finance "Budget 2027 Tax Policy Changes" (publication version);
// page numbers are TPC's printed page numbers. Nulls are still open (see PR #39) and keep status 'pending'.
// While status is 'pending', 2027 is not added to the calculators and /budget-2027 shows only the pending line.
export type Pending<T> = T | null;

export const BUDGET_2027 = {
  status: 'pending' as 'pending' | 'confirmed',
  figuresCheckedOn: null as Pending<string>, // [[FIGURES_CHECKED_DATE]] shown as text, e.g. '8 Oct 2026'
  figuresCheckedOnIso: null as Pending<string>, // same date as YYYY-MM-DD, used for the sitemap lastmod of /budget-2027
  startDate: '1 January 2027' as Pending<string>, // [[2027_START_DATE]] TPC p.4 (most changes)
  sources: {
    speech: 'https://www.gov.ie/en/department-of-finance/speeches/statement-by-minister-harris-on-budget-2027/' as Pending<string>, // [[LINK_BUDGET_2027_SPEECH]]
    taxPolicyChanges: 'https://assets.gov.ie/static/documents/c6792805/Budget_2027_-_Tax_Policy_Changes_-_Publication_Version.pdf' as Pending<string>, // [[LINK_BUDGET_2027_TAX_POLICY_CHANGES]]
    revenueSummary: null as Pending<string>, // [[LINK_REVENUE_BUDGET_2027_SUMMARY]] NULL: Revenue's summary PDF still says Budget 2026; do not link it
    prsi: null as Pending<string>, // [[LINK_DSP_BUDGET_2027_PRSI]] NULL: no DSP Budget 2027 PRSI notice yet
    minimumWage: 'https://assets.gov.ie/static/documents/c6792805/Budget_2027_-_Tax_Policy_Changes_-_Publication_Version.pdf' as Pending<string>, // [[LINK_MINIMUM_WAGE_2027]] TPC p.4 (no separate DETE notice found)
  },
  incomeTax: {
    standardRate: 0.2 as Pending<number>, // TPC p.26 Table 10 [[2027_STANDARD_RATE]]  write rates as decimals (the 2026 rate of 20% is 0.2)
    higherRate: 0.4 as Pending<number>, // TPC p.26 Table 10 // [[2027_HIGHER_RATE]]
    bandSingle: 46500 as Pending<number>, // TPC p.4 // [[2027_STANDARD_RATE_BAND_SINGLE]]
    bandMarriedOneEarner: 55500 as Pending<number>, // TPC p.4 // [[2027_STANDARD_RATE_BAND_MARRIED_ONE_EARNER]]
    bandMarriedTwoEarners: 55500 as Pending<number>, // TPC p.4 // [[2027_STANDARD_RATE_BAND_MARRIED_TWO_EARNERS]] (page text only)
    twoEarnerMaxIncrease: 37500 as Pending<number>, // TPC p.4 fn 5 (lower of €37,500 or the lower earner's income) // [[2027_TWO_EARNER_MAX_INCREASE]] (page text only)
    bandOneParent: 50500 as Pending<number>, // TPC p.4 // [[2027_STANDARD_RATE_BAND_ONE_PARENT]] (page text only)
  },
  credits: {
    personalSingle: 2125 as Pending<number>, // TPC p.4 // [[2027_PERSONAL_CREDIT_SINGLE]]
    personalMarried: null as Pending<number>, // [[2027_PERSONAL_CREDIT_MARRIED]] NULL: not stated; TPC worked examples only add up with €4,250 (Al decides)
    employeePaye: 2125 as Pending<number>, // TPC p.4 // [[2027_EMPLOYEE_PAYE_CREDIT]]
    earnedIncome: 2125 as Pending<number>, // TPC p.4 // [[2027_EARNED_INCOME_CREDIT]] (page text only)
    homeCarer: 2050 as Pending<number>, // TPC p.4 // [[2027_HOME_CARER_CREDIT]] (page text only)
    singlePersonChildCarer: null as Pending<number>, // [[2027_SINGLE_PERSON_CHILD_CARER_CREDIT]] (page text only) NULL: not stated
    rentSingle: 1150 as Pending<number>, // TPC p.6 (2027 and 2028) // [[2027_RENT_TAX_CREDIT_SINGLE]] (page text only)
    rentCouple: 2300 as Pending<number>, // TPC p.6 (2027 and 2028) // [[2027_RENT_TAX_CREDIT_COUPLE]] (page text only)
  },
  usc: {
    exemptionThreshold: 13000 as Pending<number>, // TPC p.4 ("Incomes less than €13,000 are exempt") // [[2027_USC_EXEMPTION_THRESHOLD]]
    bands: [
      { upTo: 12012 as Pending<number>, rate: 0.005 as Pending<number> }, // TPC p.4 [[2027_USC_BAND_1_TOP]] / [[2027_USC_RATE_1]]
      { upTo: 30300 as Pending<number>, rate: 0.02 as Pending<number> }, // TPC p.4 [[2027_USC_BAND_2_TOP]] / [[2027_USC_RATE_2]]
      { upTo: null as Pending<number>, rate: 0.03 as Pending<number> }, // TPC p.4 rate 3%. [[2027_USC_BAND_3_TOP]] NULL: TPC p.4 text says €70,444 but TPC's worked tables, speech and guide only add up with €70,044 (Al decides)
      { upTo: 'balance' as Pending<number> | 'balance', rate: 0.08 as Pending<number> }, // TPC p.4 [[2027_USC_RATE_4]] 8% on the balance
    ],
  },
  prsi: {
    rateFrom1Jan: null as Pending<number>, // [[2027_PRSI_RATE_FROM_1_JAN]] NULL: only in TPC table notes (4.35%, rising to 4.5% on 1 Oct 2027); no DSP notice yet
    changeMonth: null as Pending<number>, // from [[2027_PRSI_CHANGE_DATE]]: month number (1st of a month); null if no change
    rateAfterChange: null as Pending<number>, // [[2027_PRSI_RATE_AFTER_CHANGE]]; null if no change
    weeklyNilThreshold: null as Pending<number>, // [[2027_PRSI_WEEKLY_NIL_THRESHOLD]] (follow-up PR B)
    creditMaxWeekly: null as Pending<number>, // [[2027_PRSI_CREDIT_MAX_WEEKLY]] (follow-up PR B)
    creditTopWeekly: null as Pending<number>, // [[2027_PRSI_CREDIT_TOP]] (follow-up PR B)
    classSMinimum: null as Pending<number>, // [[2027_CLASS_S_MINIMUM]] €650 in 2025/2026 (DSP); fill once DSP confirms 2027
  },
  minimumWage: {
    hourly: 14.94 as Pending<number>, // TPC p.4 (and p.22 Table 6 note) // [[2027_MINIMUM_WAGE_HOURLY]] (page text only; leave null if not announced)
    startDate: '1 January 2027' as Pending<string>, // [[2027_MINIMUM_WAGE_START_DATE]] TPC p.22 Table 6 note
  },
  autoEnrolmentEmployeeRate: null as Pending<number>, // [[2027_AUTO_ENROLMENT_EMPLOYEE_RATE]] (only if changed) NULL: unchanged, so no line
  otherChanges: [
    // TPC p.6 §3.2
    'The Rent-a-Room limit goes up from €14,000 to €16,000 from 1 January 2027.',
    // TPC p.10 §5.3
    'The tax-free limit for selling electricity you generate at home to the grid goes up from €400 to €600.',
    // TPC p.11 §6.2
    'Childminders can earn up to €20,000 tax-free under childminding relief (it was €15,000).',
  ] as string[], // [[2027_OTHER_CHANGES_FREE_TEXT]]
};

export type Budget2027 = typeof BUDGET_2027;

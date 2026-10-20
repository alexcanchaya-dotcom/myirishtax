// Budget 2027 figures. Every null is a blank.
// Fill ONLY from the official Budget 2027 documents (see budget-2027-spec.md §1). No forecasts.
// Filled Tue 6 Oct 2026 from TPC = Dept of Finance "Budget 2027 Tax Policy Changes" (publication version);
// page numbers are TPC's printed page numbers. Open figures resolved 10 Oct 2026 (see PR #39).
// While status is 'pending', 2027 is not added to the calculators and /budget-2027 shows only the pending line.
// Checked again Tue 20 Oct 2026 against the Finance (No. 2) Bill 2026 (Bill No. 98 of 2026, published 19 Oct 2026),
// section 3 (rate bands and personal tax credits, 2027 onward), and its Explanatory Memorandum. Every figure below matches.
export type Pending<T> = T | null;

export const BUDGET_2027 = {
  status: 'confirmed' as 'pending' | 'confirmed', // Al: 'go ahead with all' (10 Oct 2026)
  // PM 11 Oct 2026 made 2027 single-only until the Finance Bill confirmed the couple and one-parent figures.
  // 20 Oct 2026: Finance (No. 2) Bill 2026 s.3 confirms them, so 2027 is on for everyone (single, single parents,
  // married / civil partners). Setting this back to true makes the engine, API and UI refuse couples and one-parent for 2027 again.
  singleOnly: false as boolean,
  figuresCheckedOn: '20 Oct 2026' as Pending<string>, // [[FIGURES_CHECKED_DATE]] shown as text
  figuresCheckedOnIso: '2026-10-20' as Pending<string>, // same date as YYYY-MM-DD, used for the sitemap lastmod of /budget-2027
  startDate: '1 January 2027' as Pending<string>, // [[2027_START_DATE]] TPC p.4 (most changes)
  sources: {
    speech: 'https://www.gov.ie/en/department-of-finance/speeches/statement-by-minister-harris-on-budget-2027/' as Pending<string>, // [[LINK_BUDGET_2027_SPEECH]]
    taxPolicyChanges: 'https://assets.gov.ie/static/documents/c6792805/Budget_2027_-_Tax_Policy_Changes_-_Publication_Version.pdf' as Pending<string>, // [[LINK_BUDGET_2027_TAX_POLICY_CHANGES]]
    revenueSummary: null as Pending<string>, // [[LINK_REVENUE_BUDGET_2027_SUMMARY]] NULL: Revenue's summary PDF still says Budget 2026; do not link it
    prsi: 'https://www.irishstatutebook.ie/eli/2024/act/24/section/3/enacted/en/html' as Pending<string>, // [[LINK_DSP_BUDGET_2027_PRSI]] Social Welfare (Miscellaneous Provisions) Act 2024 s.3 (4.35% from 1 Oct 2026, 4.5% from 1 Oct 2027); no separate DSP Budget 2027 notice
    financeBill: 'https://www.oireachtas.ie/en/bills/bill/2026/98/' as Pending<string>, // Finance (No. 2) Bill 2026, Bill No. 98 of 2026 (Oireachtas page; text: data.oireachtas.ie/ie/oireachtas/bill/2026/98/eng/initiated/b9826d.pdf)
    minimumWage: 'https://assets.gov.ie/static/documents/c6792805/Budget_2027_-_Tax_Policy_Changes_-_Publication_Version.pdf' as Pending<string>, // [[LINK_MINIMUM_WAGE_2027]] TPC p.4 (no separate DETE notice found)
  },
  incomeTax: {
    standardRate: 0.2 as Pending<number>, // TPC p.26 Table 10 [[2027_STANDARD_RATE]]  write rates as decimals (the 2026 rate of 20% is 0.2)
    higherRate: 0.4 as Pending<number>, // TPC p.26 Table 10 // [[2027_HIGHER_RATE]]
    bandSingle: 46500 as Pending<number>, // TPC p.4; Finance (No. 2) Bill 2026 s.3(a)(ii) (TCA s.15 Table, Part 1: first €46,500 at 20%) // [[2027_STANDARD_RATE_BAND_SINGLE]]
    bandMarriedOneEarner: 55500 as Pending<number>, // TPC p.4; Finance (No. 2) Bill 2026 s.3(a)(ii) (TCA s.15 Table, Part 3: first €55,500 at 20%) // [[2027_STANDARD_RATE_BAND_MARRIED_ONE_EARNER]]
    bandMarriedTwoEarners: 55500 as Pending<number>, // TPC p.4; Finance (No. 2) Bill 2026 s.3(a)(ii) (Part 3 €55,500, plus the s.15(3) increase below) // [[2027_STANDARD_RATE_BAND_MARRIED_TWO_EARNERS]] (page text only)
    twoEarnerMaxIncrease: 37500 as Pending<number>, // TPC p.4 fn 5 (lower of €37,500 or the lower earner's income); Finance (No. 2) Bill 2026 s.3(a)(i) (TCA s.15(3)(i): €37,500 for €35,000) // [[2027_TWO_EARNER_MAX_INCREASE]] (page text only)
    bandOneParent: 50500 as Pending<number>, // TPC p.4; Finance (No. 2) Bill 2026 s.3(a)(ii) (TCA s.15 Table, Part 2: first €50,500 at 20%) // [[2027_STANDARD_RATE_BAND_ONE_PARENT]] (page text only)
  },
  credits: {
    personalSingle: 2125 as Pending<number>, // TPC p.4; Finance (No. 2) Bill 2026 s.3(b)(iii) (TCA s.461(c): €2,125 for €2,000) // [[2027_PERSONAL_CREDIT_SINGLE]]
    personalMarried: 4250 as Pending<number>, // [[2027_PERSONAL_CREDIT_MARRIED]] Finance (No. 2) Bill 2026 s.3(b)(i) (TCA s.461(a): €4,250 for €4,000); memo s.3 'by €250 to €4,250'. Before the Bill: TPC p.18 Table 3 (married, one income, €100k): income tax 20,475 = 28,900 − 2,125 PAYE − 2,050 home carer − 4,250; the only value that fits every row. Not printed as a sentence.
    employeePaye: 2125 as Pending<number>, // TPC p.4; Finance (No. 2) Bill 2026 s.3(d) (TCA s.472(4): €2,125 for €2,000) // [[2027_EMPLOYEE_PAYE_CREDIT]]
    earnedIncome: 2125 as Pending<number>, // TPC p.4; Finance (No. 2) Bill 2026 s.3(e) (TCA s.472AB(2) and (3): €2,125 for €2,000) // [[2027_EARNED_INCOME_CREDIT]] (page text only)
    homeCarer: 2050 as Pending<number>, // TPC p.4; Finance (No. 2) Bill 2026 s.3(c) (TCA s.466A(2): €2,050 for €1,950) // [[2027_HOME_CARER_CREDIT]] (page text only)
    singlePersonChildCarer: 1900 as Pending<number>, // [[2027_SINGLE_PERSON_CHILD_CARER_CREDIT]] unchanged: Finance (No. 2) Bill 2026 does not amend TCA s.462B (its s.3 changes only the s.15 bands and the s.461, s.466A, s.472 and s.472AB credits). Also: TPC §2.1.1 lists every credit change and this one is not among them (band does change, to €50,500); Revenue chart 2026 €1,900
    rentSingle: 1150 as Pending<number>, // TPC p.6 (2027 and 2028); Finance (No. 2) Bill 2026 s.4(1)(b)(i) (TCA s.473B(13): €1,150 for €1,000) // [[2027_RENT_TAX_CREDIT_SINGLE]] (page text only)
    rentCouple: 2300 as Pending<number>, // TPC p.6 (2027 and 2028); Finance (No. 2) Bill 2026 s.4(1)(b)(ii) (TCA s.473B(13): €2,300 for €2,000) // [[2027_RENT_TAX_CREDIT_COUPLE]] (page text only)
  },
  usc: {
    exemptionThreshold: 13000 as Pending<number>, // TPC p.4 // [[2027_USC_EXEMPTION_THRESHOLD]] €13,000 OR LESS is exempt (engine uses <=): Citizens Information "If your total income is €13,000 or less per year, you do not pay any USC"; TPC's 'less than' is shorthand for the same unchanged rule
    bands: [
      { upTo: 12012 as Pending<number>, rate: 0.005 as Pending<number> }, // TPC p.4 [[2027_USC_BAND_1_TOP]] / [[2027_USC_RATE_1]]
      { upTo: 30300 as Pending<number>, rate: 0.02 as Pending<number> }, // TPC p.4 [[2027_USC_BAND_2_TOP]] / [[2027_USC_RATE_2]]
      { upTo: 70044 as Pending<number>, rate: 0.03 as Pending<number> }, // TPC p.4 rate 3%. [[2027_USC_BAND_3_TOP]] €70,044: TPC Table 2 (single, p.18) USC at €75k proposed = €2,015 and Example 8 (p.34, €90k + €37.5k) 2027 USC = €3,856 only fit €70,044 (€70,444 gives €1,995 / €3,836). The '€70,444' in the p.4 list is a misprint.
      { upTo: 'balance' as Pending<number> | 'balance', rate: 0.08 as Pending<number> }, // TPC p.4 [[2027_USC_RATE_4]] 8% on the balance
    ],
  },
  prsi: {
    rateFrom1Jan: 0.0435 as Pending<number>, // [[2027_PRSI_RATE_FROM_1_JAN]] SW(MP)A 2024 s.3 (4.35% in force from 1 Oct 2026); TPC Tables 2–5 note 2
    changeMonth: 10 as Pending<number>, // [[2027_PRSI_CHANGE_DATE]] 1 October 2027: SW(MP)A 2024 s.3(4) "on and from 1 October 2027"
    rateAfterChange: 0.045 as Pending<number>, // [[2027_PRSI_RATE_AFTER_CHANGE]] SW(MP)A 2024 s.3 table, Fourth Substitution "4.5 per cent"; TPC note 2
    weeklyNilThreshold: 352 as Pending<number>, // [[2027_PRSI_WEEKLY_NIL_THRESHOLD]] unchanged: no Budget 2027 change announced; current law per DSP Class A page (no end date)
    creditMaxWeekly: 12 as Pending<number>, // [[2027_PRSI_CREDIT_MAX_WEEKLY]] unchanged (DSP Class A page: 'tapered employee PRSI Credit of €12 per week')
    creditTopWeekly: 424 as Pending<number>, // [[2027_PRSI_CREDIT_TOP]] unchanged (DSP Class A page: €352.01 – €424)
    classSMinimum: 650 as Pending<number>, // [[2027_CLASS_S_MINIMUM]] unchanged: DSP PRSI page 'annual minimum charge of €650'; no Budget 2027 change
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

/** Shown wherever 2027 can be picked, only if BUDGET_2027.singleOnly is ever set back to true. */
export const SINGLE_ONLY_LINE = '2027 covers single people only for now.';


import type { FaqItem } from '@/components/Faq';

// Every answer here is shown on the page (the Faq component renders it) and matches the engine and the
// sources quoted in the PRs: Revenue tax relief charts, gov.ie PRSI pages, Revenue eBrief 034/26,
// Revenue lump sum pages, Citizens Information Budget 2014 (top slicing).

export const TAKE_HOME_FAQ: FaqItem[] = [
  {
    q: 'Which tax year does it use?',
    a: 'The 2026 tax year by default. You can switch to 2025, 2024 or 2023 in the Tax year box.',
  },
  {
    q: 'Why did my pay go down in October 2026?',
    a: 'Employee PRSI went up from 4.2% to 4.35% on 1 October 2026. For the year, the calculator uses 9 months at 4.2% and 3 months at 4.35%.',
  },
  {
    q: 'Do pension contributions reduce USC and PRSI?',
    a: "No. Employee pension contributions get income tax relief only, up to Revenue's age limit (15% of earnings under 30, rising to 40% at 60 or over, on earnings up to €115,000). USC and PRSI are charged on your full pay.",
  },
  {
    q: 'When do I pay no USC?',
    a: 'If your total income for the year is €13,000 or less, you pay no USC. Above that, USC is charged on all of it.',
  },
  {
    q: 'How does it work for a married couple or civil partners who both earn?',
    a: "Under joint assessment the 20% band is €53,000, plus the lower of €35,000 or the lower earner's pay. Each of you gets the €2,000 Employee Tax Credit and the Married Person credit is €4,000. USC and PRSI are worked out on each person's own pay.",
  },
];

export const CONTRACTOR_FAQ: FaqItem[] = [
  {
    q: 'What is Class S PRSI?',
    a: 'Self-employed people with reckonable income of €5,000 or more pay Class S PRSI on all of it: 4.2% until 30 September 2026 and 4.35% from 1 October 2026, with a minimum of €650 a year.',
  },
  {
    q: 'When are preliminary tax and the tax return due?',
    a: 'The 2025 return (Form 11) and 2026 preliminary tax are due by 31 October 2026. If you both pay and file on ROS, the date is 18 November 2026.',
  },
  {
    q: 'How much preliminary tax do I pay?',
    a: "Usually the lower of 90% of this year's income tax, USC and PRSI, or 100% of last year's. If you enter last year's figure, the calculator uses the lower of the two.",
  },
  {
    q: 'Is there extra USC for the self-employed?',
    a: 'Yes. Self-employed income over €100,000 has an extra 3% USC on the part above €100,000.',
  },
];

export const REDUNDANCY_FAQ: FaqItem[] = [
  {
    q: 'Is statutory redundancy taxed?',
    a: "No. Statutory redundancy is tax-free. It is 2 weeks' pay for each year of service plus 1 week, with pay capped at €600 a week, and you need at least 2 years' service.",
  },
  {
    q: 'How much of an extra (ex-gratia) payment is tax-free?',
    a: 'The highest of: the basic exemption (€10,160 plus €765 for each complete year of service), the increased exemption (up to €10,000 more, less any tax-free pension lump sum), or SCSB. There is a €200,000 lifetime limit.',
  },
  {
    q: 'Is PRSI charged on the taxable part?',
    a: 'No. The taxable part of an ex-gratia lump sum has income tax and USC but no PRSI. Pay in lieu of notice that is in your contract is taxed as normal pay, with PRSI.',
  },
  {
    q: 'Does top slicing relief still apply?',
    a: 'No. Top slicing relief was abolished for ex-gratia payments made on or after 1 January 2014.',
  },
];

import Link from 'next/link';

export type CalculatorKey = 'take-home' | 'auto-enrolment' | 'rent-credit' | 'contractor' | 'redundancy' | 'payslip-october-prsi' | 'rent-a-room';

const CALCULATORS: { key: CalculatorKey; href: string; label: string; blurb: string }[] = [
  { key: 'take-home', href: '/', label: 'Take-home pay', blurb: 'PAYE, USC and PRSI on your salary.' },
  {
    key: 'auto-enrolment',
    href: '/auto-enrolment-calculator',
    label: 'Auto-enrolment',
    blurb: 'MyFutureFund pension contributions.',
  },
  { key: 'rent-credit', href: '/rent-tax-credit', label: 'Rent tax credit', blurb: 'What you can claim back on rent.' },
  {
    key: 'contractor',
    href: '/contractor-calculator',
    label: 'Contractor',
    blurb: 'Self-employed tax and Class S PRSI.',
  },
  {
    key: 'redundancy',
    href: '/redundancy-calculator',
    label: 'Redundancy',
    blurb: 'Tax-free amount and tax on a package.',
  },
  {
    key: 'payslip-october-prsi',
    href: '/payslip-october-prsi',
    label: 'Why October pay dropped',
    blurb: 'Employee PRSI went from 4.2% to 4.35% on 1 Oct 2026.',
  },
  {
    key: 'rent-a-room',
    href: '/rent-a-room-relief',
    label: 'Rent-a-room relief',
    blurb: 'Tax-free rent from a room in your home, up to €14,000.',
  },
];

export function RelatedCalculators({ current, className = '' }: { current: CalculatorKey; className?: string }) {
  const links = CALCULATORS.filter((c) => c.key !== current);
  return (
    <nav aria-labelledby="related-calculators-heading" className={`card mt-12 ${className}`}>
      <h2 id="related-calculators-heading" className="text-lg font-semibold text-ink">
        Related calculators
      </h2>
      <ul className={`mt-4 grid gap-4 ${links.length > 3 ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-3'}`}>
        {links.map((c) => (
          <li key={c.key}>
            <Link
              href={c.href}
              className="font-medium text-ink underline decoration-line underline-offset-2 hover:text-brand-700"
            >
              {c.label}
            </Link>
            <p className="mt-1 text-sm text-ink-muted">{c.blurb}</p>
          </li>
        ))}
      </ul>
    </nav>
  );
}

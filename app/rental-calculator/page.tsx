import Link from 'next/link';
import { TaxDisclaimer } from '@/components/TaxDisclaimer';
import { PageHeader } from '@/components/PageHeader';

export const metadata = {
  title: 'Rental Income Calculator | Coming soon | MyIrishTax',
  description:
    'Irish rental income calculator is coming soon. The previous version used an expired 75% mortgage-interest rule.',
};

export default function RentalCalculatorComingSoonPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
      <PageHeader title="Rental income">
        <p>Coming soon. We will not show a figure we know is wrong.</p>
        <TaxDisclaimer />
      </PageHeader>

      <section className="card space-y-4 text-ink-muted">
        <p>
          The older version treated only 75% of mortgage interest as deductible. That rule is out
          of date, so this page stays off the main menu until the engine is rewritten.
        </p>
        <p>
          Use{' '}
          <Link href="/" className="text-ink underline decoration-line underline-offset-2 hover:text-brand-700">
            PAYE take-home
          </Link>{' '}
          for employment income, or the{' '}
          <Link href="/rent-tax-credit" className="text-ink underline decoration-line underline-offset-2 hover:text-brand-700">
            rent tax credit
          </Link>{' '}
          if you pay rent as a tenant.
        </p>
      </section>
    </main>
  );
}

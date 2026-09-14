import Link from 'next/link';
import { Home } from 'lucide-react';
import { TaxDisclaimer } from '@/components/TaxDisclaimer';

export const metadata = {
  title: 'Rental Income Calculator | Coming soon | MyIrishTax',
  description:
    'Irish rental income calculator is coming soon. The previous version used an expired 75% mortgage-interest rule.',
};

export default function RentalCalculatorComingSoonPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <header className="rounded-3xl bg-gradient-to-r from-green-600 to-emerald-600 p-8 text-white mb-8">
        <div className="flex items-center gap-3">
          <Home className="h-10 w-10" />
          <div>
            <h1 className="text-4xl font-bold">Rental Income Calculator</h1>
            <p className="text-lg mt-2">Coming soon</p>
          </div>
        </div>
      </header>

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4 text-gray-700">
        <p>
          This calculator is hidden from the main menu until the numbers are current. The older
          version treated only 75% of mortgage interest as deductible. That rule is out of date,
          so we will not show a rental tax figure that we know is wrong.
        </p>
        <p>
          Use the PAYE calculator for employment income, or the rent tax credit calculator if you
          pay rent as a tenant.
        </p>
        <TaxDisclaimer />
        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            href="/"
            className="inline-flex items-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            PAYE calculator
          </Link>
          <Link
            href="/rent-tax-credit"
            className="inline-flex items-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
          >
            Rent tax credit
          </Link>
        </div>
      </section>
    </main>
  );
}

import { PageHeader } from '@/components/PageHeader';
import Link from 'next/link';

export const metadata = {
  title: 'About MyIrishTax',
  description:
    'MyIrishTax is built by Aleksander Canchaya, an ACCA qualified accountant. Irish take-home pay estimates from published tax bands; not advice.',
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
      <PageHeader title="About MyIrishTax">
        <p>Irish take-home estimates, built by a qualified accountant.</p>
      </PageHeader>

      <div className="space-y-10 text-base leading-relaxed text-ink-muted">
        <section>
          <h2 className="text-xl font-semibold text-ink">Aleksander Canchaya</h2>
          <p className="mt-3">
            Aleksander is an ACCA qualified accountant with over 13 years of professional
            accounting and tax experience. He currently leads record-to-report work across many
            entities in Europe. He built MyIrishTax so people in Ireland can see a clear take-home
            estimate without signing up.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-ink">How the numbers are treated</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>PAYE, USC and PRSI use the 2025/2026 figures in our rate book.</li>
            <li>Results are estimates, not a Revenue assessment.</li>
            <li>
              Calculator figures are sent to our server to compute a result. We do not sell them.
              See the{' '}
              <Link href="/privacy" className="text-ink underline decoration-line underline-offset-2">
                Privacy Policy
              </Link>
              .
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-ink">Disclaimer</h2>
          <p className="mt-3">
            Based on published Irish tax bands; not advice. For your own situation, check
            Revenue.ie or a qualified advisor.
          </p>
        </section>
      </div>
    </main>
  );
}

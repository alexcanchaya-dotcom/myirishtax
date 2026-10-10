import { PageHeader } from '@/components/PageHeader';
import Link from 'next/link';
import { pageMeta } from '@/lib/pageMeta';

export const metadata = pageMeta({
  title: 'About MyIrishTax',
  description:
    'MyIrishTax is a free Irish take-home pay calculator built by Aleksander Canchaya. Estimates from published Revenue and gov.ie rates; not financial or tax advice.',
  path: '/about',
});

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
      <PageHeader title="About MyIrishTax">
        <p>Free Irish take-home estimates from published Revenue and gov.ie rates.</p>
      </PageHeader>

      <div className="space-y-10 text-base leading-relaxed text-ink-muted">
        <section>
          <h2 className="text-xl font-semibold text-ink">Aleksander Canchaya</h2>
          <p className="mt-3">
            Aleksander built MyIrishTax so people in Ireland can see a clear take-home estimate
            without signing up. The figures come from published Revenue and gov.ie rates and are
            estimates only. They are not financial or tax advice.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-ink">How the numbers are treated</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>PAYE, USC and PRSI use the 2026 tax year figures in our rate book (2025 is still available).</li>
            <li>Results are estimates, not a Revenue assessment.</li>
            <li>
              The free PAYE estimate is worked out in your browser. Some other tools send the
              figures you type to our server to compute a result. We do not sell them. See the{' '}
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
            Estimate only, not financial or tax advice. For your own situation, check Revenue.ie
            or get advice.
          </p>
        </section>
      </div>
    </main>
  );
}

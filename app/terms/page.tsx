import { LegalArticle } from '@/components/LegalArticle';
import Link from 'next/link';

export const metadata = {
  title: 'Terms of Use | MyIrishTax',
  description: 'Terms for using the MyIrishTax calculators and website.',
};

export default function TermsPage() {
  return (
    <LegalArticle badge="Terms" title="Terms of Use">
      <p>Last updated: September 2026</p>
      <p>
        By using MyIrishTax you agree to these terms and to our{' '}
        <Link href="/privacy" className="text-brand-600 hover:underline">
          Privacy Policy
        </Link>
        .
      </p>

      <h2 className="text-lg font-semibold text-gray-900">The service</h2>
      <p>
        We provide Irish tax calculators and related pages for information. Results are estimates
        based on published tax bands and the figures you enter. They are not a tax return and not
        advice.
      </p>

      <h2 className="text-lg font-semibold text-gray-900">Your responsibility</h2>
      <p>
        Check figures against Revenue.ie or a qualified advisor before you file or make money
        decisions. You must not use the site for unlawful purposes.
      </p>

      <h2 className="text-lg font-semibold text-gray-900">Paid features</h2>
      <p>
        Optional paid plans may be offered later. Card payments are only taken when checkout is
        switched on. Prices, if shown, are in euro.
      </p>

      <h2 className="text-lg font-semibold text-gray-900">Liability</h2>
      <p>
        We take care with the calculators but cannot promise they match your Revenue assessment.
        To the extent allowed by law, our liability is limited to fees you paid us for a paid
        service (if any).
      </p>

      <h2 className="text-lg font-semibold text-gray-900">Contact</h2>
      <p>
        <a href="mailto:support@myirishtax.com" className="text-brand-600 hover:underline">
          support@myirishtax.com
        </a>
        . Registered company details on request.
      </p>
    </LegalArticle>
  );
}

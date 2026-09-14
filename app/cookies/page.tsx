import { LegalArticle } from '@/components/LegalArticle';
import Link from 'next/link';

export const metadata = {
  title: 'Cookie Policy | MyIrishTax',
  description: 'Cookies used by MyIrishTax and how to manage them.',
};

export default function CookiesPage() {
  return (
    <LegalArticle badge="Cookies" title="Cookie Policy">
      <p>Last updated: September 2026</p>
      <p>
        We use cookies that are needed to run the site, such as keeping you signed in if you create
        an account. We do not run advertising or analytics cookies unless that is clearly turned on
        later and you agree.
      </p>

      <h2 className="text-lg font-semibold text-gray-900">What we use today</h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          <strong>Essential:</strong> session cookies for sign-in and security.
        </li>
        <li>
          <strong>Optional analytics or ads:</strong> not active on this app unless separately
          enabled.
        </li>
      </ul>

      <h2 className="text-lg font-semibold text-gray-900">Managing cookies</h2>
      <p>
        You can delete cookies in your browser settings. Blocking essential cookies may stop sign-in
        from working. See also our{' '}
        <Link href="/privacy" className="text-brand-600 hover:underline">
          Privacy Policy
        </Link>
        .
      </p>

      <h2 className="text-lg font-semibold text-gray-900">Contact</h2>
      <p>
        <a href="mailto:support@myirishtax.com" className="text-brand-600 hover:underline">
          support@myirishtax.com
        </a>
      </p>
    </LegalArticle>
  );
}

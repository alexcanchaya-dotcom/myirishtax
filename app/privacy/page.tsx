import { LegalArticle } from '@/components/LegalArticle';
import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy | MyIrishTax',
  description:
    'How MyIrishTax handles calculator figures, accounts, and contact email. We do not sell your data.',
};

export default function PrivacyPage() {
  return (
    <LegalArticle badge="Privacy" title="Privacy Policy">
      <p>Last updated: September 2026</p>
      <p>
        MyIrishTax provides free Irish tax calculators. This page explains what happens to
        information you enter. Company registration details are available on request.
      </p>

      <h2 className="text-lg font-semibold text-gray-900">Calculator figures</h2>
      <p>
        The free PAYE take-home estimate is worked out in your browser. Contractor and some other
        tools send the numbers you type (income, credits, tax year, and similar fields) to our
        website so we can return a result. Those figures leave your device. We use them to compute
        the estimate. We do not use calculator figures to identify you, and we do not sell them.
      </p>
      <p>
        If you sign in and save a calculation, that saved record is stored on your account so you
        can open it later.
      </p>

      <h2 className="text-lg font-semibold text-gray-900">Accounts and contact</h2>
      <p>
        If you create an account we store the email and name you provide so you can sign in. If
        you email us, we keep the message long enough to reply.
      </p>

      <h2 className="text-lg font-semibold text-gray-900">Cookies</h2>
      <p>
        Essential cookies are used to keep you signed in. See the{' '}
        <Link href="/cookies" className="text-brand-600 hover:underline">
          Cookie Policy
        </Link>
        .
      </p>

      <h2 className="text-lg font-semibold text-gray-900">Your rights</h2>
      <p>
        You may ask for a copy of account data we hold, or ask us to correct or delete it. Email{' '}
        <a href="mailto:support@myirishtax.com" className="text-brand-600 hover:underline">
          support@myirishtax.com
        </a>
        .
      </p>

      <h2 className="text-lg font-semibold text-gray-900">Contact</h2>
      <p>
        MyIrishTax —{' '}
        <a href="mailto:support@myirishtax.com" className="text-brand-600 hover:underline">
          support@myirishtax.com
        </a>
        . Registered company details on request.
      </p>
    </LegalArticle>
  );
}

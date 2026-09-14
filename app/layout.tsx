import './globals.css';
import React from 'react';
import { SessionProvider } from '@/components/auth/SessionProvider';
import { NavBar } from '@/components/NavBar';
import Link from 'next/link';

export const metadata = {
  metadataBase: new URL('https://myirishtax.com'),
  title: 'MyIrishTax - Free Irish Tax Calculators | PAYE, USC, PRSI, Contractor',
  description:
    'Free Irish PAYE, USC and PRSI calculator for 2025 and 2026. Based on published Irish tax bands; not advice. Also contractor, rent credit, redundancy and auto-enrolment tools.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 flex flex-col min-h-screen">
        <SessionProvider>
          <NavBar />
          <div className="flex-1">
            {children}
          </div>
          <footer className="bg-white border-t border-gray-200 mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <Link href="/" className="text-lg font-bold text-brand-600">
                    MyIrishTax
                  </Link>
                  <p className="mt-2 text-sm text-gray-500">
                    Irish tax calculators based on published bands. Not advice.
                  </p>
                  <p className="mt-3 text-sm text-gray-500">
                    <a href="mailto:support@myirishtax.com" className="hover:text-gray-900">
                      support@myirishtax.com
                    </a>
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Calculators</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li><Link href="/" className="hover:text-gray-900">PAYE Tax Calculator</Link></li>
                    <li><Link href="/contractor-calculator" className="hover:text-gray-900">Contractor Tax Calculator</Link></li>
                    <li><Link href="/redundancy-calculator" className="hover:text-gray-900">Redundancy Calculator</Link></li>
                    <li><Link href="/auto-enrolment-calculator" className="hover:text-gray-900">Auto-Enrolment Calculator</Link></li>
                    <li><Link href="/rent-tax-credit" className="hover:text-gray-900">Rent Tax Credit Calculator</Link></li>
                    <li><Link href="/rental-calculator" className="hover:text-gray-900">Rental Income (coming soon)</Link></li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Company</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li><Link href="/about" className="hover:text-gray-900">About</Link></li>
                    <li><Link href="/privacy" className="hover:text-gray-900">Privacy</Link></li>
                    <li><Link href="/terms" className="hover:text-gray-900">Terms</Link></li>
                    <li><Link href="/cookies" className="hover:text-gray-900">Cookies</Link></li>
                    <li><Link href="/disclaimer" className="hover:text-gray-900">Disclaimer</Link></li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Sister sites</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>
                      <a href="https://wealthmodeler.com" className="hover:text-gray-900" rel="noopener noreferrer">
                        Wealth Modeler
                      </a>
                    </li>
                    <li>
                      <a href="https://longevitymodeler.com" className="hover:text-gray-900" rel="noopener noreferrer">
                        Longevity Modeler
                      </a>
                    </li>
                  </ul>
                  <p className="mt-4 text-xs text-gray-500 leading-relaxed">
                    Based on published Irish tax bands; not advice. Always check Revenue.ie or a
                    qualified advisor for your own position.
                  </p>
                </div>
              </div>
              <div className="mt-8 border-t border-gray-200 pt-6 text-center text-xs text-gray-500">
                © {new Date().getFullYear()} MyIrishTax. Contact:{' '}
                <a href="mailto:support@myirishtax.com" className="hover:text-gray-900">
                  support@myirishtax.com
                </a>
                . Registered company details on request.
              </div>
            </div>
          </footer>
        </SessionProvider>
      </body>
    </html>
  );
}

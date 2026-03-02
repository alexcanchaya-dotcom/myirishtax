import './globals.css';
import React from 'react';
import { SessionProvider } from '@/components/auth/SessionProvider';
import { NavBar } from '@/components/NavBar';
import Link from 'next/link';

export const metadata = {
  title: 'MyIrishTax - Free Irish Tax Calculators | PAYE, USC, PRSI, Contractor, Rental',
  description: 'Free Irish tax calculators built by an ACCA qualified accountant. Calculate PAYE, USC, PRSI, contractor tax, rental income tax, rent tax credit, and auto-enrolment pension contributions for 2026.',
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
                    Free Irish tax calculators built by an ACCA qualified accountant with 13+ years of experience.
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Calculators</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li><Link href="/" className="hover:text-gray-900">PAYE Tax Calculator</Link></li>
                    <li><Link href="/contractor-calculator" className="hover:text-gray-900">Contractor Tax Calculator</Link></li>
                    <li><Link href="/rental-calculator" className="hover:text-gray-900">Rental Income Calculator</Link></li>
                    <li><Link href="/redundancy-calculator" className="hover:text-gray-900">Redundancy Calculator</Link></li>
                    <li><Link href="/auto-enrolment-calculator" className="hover:text-gray-900">Auto-Enrolment Calculator</Link></li>
                    <li><Link href="/rent-tax-credit" className="hover:text-gray-900">Rent Tax Credit Calculator</Link></li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Company</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li><Link href="/about" className="hover:text-gray-900">About</Link></li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Disclaimer</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    The calculators on MyIrishTax are provided for informational purposes only and do not constitute professional tax or financial advice. Always consult a qualified tax advisor for your specific circumstances.
                  </p>
                </div>
              </div>
              <div className="mt-8 border-t border-gray-200 pt-6 text-center text-xs text-gray-500">
                © {new Date().getFullYear()} MyIrishTax. All rights reserved.
              </div>
            </div>
          </footer>
        </SessionProvider>
      </body>
    </html>
  );
}

import './globals.css';
import React from 'react';
import { SessionProvider } from '@/components/auth/SessionProvider';
import { UserNav } from '@/components/auth/UserNav';
import Link from 'next/link';

export const metadata = {
  title: 'MyIrishTax - Irish Tax Calculator',
  description: 'Professional Irish tax calculator for PAYE, USC, PRSI, redundancy, and more',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <SessionProvider>
          <nav className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <Link href="/" className="flex items-center">
                  <span className="text-xl font-bold text-brand-600">MyIrishTax</span>
                </Link>
                <div className="flex items-center gap-6">
                  <Link href="/" className="text-sm font-medium text-gray-700 hover:text-gray-900">
                    PAYE
                  </Link>
                  <Link href="/contractor-calculator" className="text-sm font-medium text-gray-700 hover:text-gray-900">
                    Contractor
                  </Link>
                  <Link href="/rental-calculator" className="text-sm font-medium text-gray-700 hover:text-gray-900">
                    Rental
                  </Link>
                  <Link href="/redundancy-calculator" className="text-sm font-medium text-gray-700 hover:text-gray-900">
                    Redundancy
                  </Link>
                  <UserNav />
                </div>
              </div>
            </div>
          </nav>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}

import './globals.css';
import React from 'react';
import { SessionProvider } from '@/components/auth/SessionProvider';
import { UserNav } from '@/components/auth/UserNav';
import Link from 'next/link';
import { Calculator, TrendingUp, Home, Briefcase, Wallet, Twitter, Linkedin, Mail } from 'lucide-react';

export const metadata = {
  title: 'MyIrishTax - Irish Tax Calculator & Investment Tax Platform',
  description: 'Professional Irish tax calculator for PAYE, contractors, rental income, plus crypto & stock investment tax tracking. Calculate capital gains tax automatically.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-br from-gray-50 via-white to-gray-50 text-gray-900 min-h-screen flex flex-col">
        <SessionProvider>
          {/* Modern Navigation with Glass Effect */}
          <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-20">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 group">
                  <div className="bg-gradient-to-br from-brand-600 to-purple-600 p-2 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
                    <Calculator className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <span className="text-2xl font-bold bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent">
                      MyIrishTax
                    </span>
                    <div className="text-xs text-gray-500 -mt-1">Ireland's Tax Platform</div>
                  </div>
                </Link>

                {/* Navigation Links */}
                <div className="hidden md:flex items-center gap-1">
                  <Link
                    href="/paye-calculator"
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <Calculator className="h-4 w-4" />
                      PAYE
                    </div>
                  </Link>
                  <Link
                    href="/contractor-calculator"
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Contractor
                    </div>
                  </Link>
                  <Link
                    href="/rental-calculator"
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4" />
                      Rental
                    </div>
                  </Link>
                  <Link
                    href="/portfolio"
                    className="px-4 py-2 text-sm font-medium text-brand-700 hover:text-brand-900 bg-brand-50 hover:bg-brand-100 rounded-lg transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Portfolio
                      <span className="text-xs bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-2 py-0.5 rounded-full font-bold">
                        NEW
                      </span>
                    </div>
                  </Link>
                </div>

                {/* User Navigation */}
                <div className="flex items-center gap-3">
                  <UserNav />
                </div>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>

          {/* Modern Footer */}
          <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
              <div className="grid md:grid-cols-4 gap-12">
                {/* Brand Column */}
                <div className="md:col-span-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-gradient-to-br from-brand-500 to-purple-600 p-2 rounded-xl">
                      <Calculator className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-xl font-bold">MyIrishTax</span>
                  </div>
                  <p className="text-gray-400 text-sm mb-6">
                    Ireland's most comprehensive tax and investment platform. Calculate taxes, track investments, and stay compliant.
                  </p>
                  <div className="flex gap-3">
                    <a href="#" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors">
                      <Twitter className="h-5 w-5" />
                    </a>
                    <a href="#" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors">
                      <Linkedin className="h-5 w-5" />
                    </a>
                    <a href="#" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors">
                      <Mail className="h-5 w-5" />
                    </a>
                  </div>
                </div>

                {/* Calculators Column */}
                <div>
                  <h3 className="font-semibold text-lg mb-4">Tax Calculators</h3>
                  <ul className="space-y-3">
                    <li>
                      <Link href="/paye-calculator" className="text-gray-400 hover:text-white transition-colors text-sm">
                        PAYE Calculator
                      </Link>
                    </li>
                    <li>
                      <Link href="/contractor-calculator" className="text-gray-400 hover:text-white transition-colors text-sm">
                        Contractor Tax
                      </Link>
                    </li>
                    <li>
                      <Link href="/rental-calculator" className="text-gray-400 hover:text-white transition-colors text-sm">
                        Rental Income
                      </Link>
                    </li>
                    <li>
                      <Link href="/redundancy-calculator" className="text-gray-400 hover:text-white transition-colors text-sm">
                        Redundancy Calculator
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Investment Tools Column */}
                <div>
                  <h3 className="font-semibold text-lg mb-4">Investment Tools</h3>
                  <ul className="space-y-3">
                    <li>
                      <Link href="/portfolio" className="text-gray-400 hover:text-white transition-colors text-sm">
                        Portfolio Dashboard
                      </Link>
                    </li>
                    <li>
                      <Link href="/portfolio/import" className="text-gray-400 hover:text-white transition-colors text-sm">
                        Import Transactions
                      </Link>
                    </li>
                    <li>
                      <Link href="/portfolio/connections" className="text-gray-400 hover:text-white transition-colors text-sm">
                        Exchange Connections
                      </Link>
                    </li>
                    <li>
                      <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                        CGT Reports
                      </a>
                    </li>
                  </ul>
                </div>

                {/* Company Column */}
                <div>
                  <h3 className="font-semibold text-lg mb-4">Company</h3>
                  <ul className="space-y-3">
                    <li>
                      <Link href="/pricing" className="text-gray-400 hover:text-white transition-colors text-sm">
                        Pricing
                      </Link>
                    </li>
                    <li>
                      <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                        About Us
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                        Privacy Policy
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                        Terms of Service
                      </a>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Bottom Bar */}
              <div className="border-t border-gray-700 mt-12 pt-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <p className="text-gray-400 text-sm">
                    © {new Date().getFullYear()} MyIrishTax. All rights reserved.
                  </p>
                  <p className="text-gray-500 text-xs">
                    Tax calculations are for guidance only. Consult a tax professional for advice.
                  </p>
                </div>
              </div>
            </div>
          </footer>
        </SessionProvider>
      </body>
    </html>
  );
}

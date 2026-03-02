'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { UserNav } from '@/components/auth/UserNav';

const navLinks = [
  { href: '/', label: 'PAYE' },
  { href: '/contractor-calculator', label: 'Contractor' },
  { href: '/rental-calculator', label: 'Rental' },
  { href: '/redundancy-calculator', label: 'Redundancy' },
  { href: '/auto-enrolment-calculator', label: 'Auto-Enrolment' },
  { href: '/rent-tax-credit', label: 'Rent Credit' },
  { href: '/about', label: 'About' },
];

export function NavBar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center flex-shrink-0">
            <span className="text-xl font-bold text-brand-600">MyIrishTax</span>
          </Link>
          <div className="hidden md:flex items-center gap-5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-gray-900 ${
                  pathname === link.href ? 'text-brand-600' : 'text-gray-600'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <UserNav />
          </div>
          <div className="flex md:hidden items-center gap-3">
            <UserNav />
            <button
              onClick={() => setMobileOpen((prev) => !prev)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-gray-50 hover:text-gray-900 ${
                  pathname === link.href ? 'text-brand-600 bg-brand-50' : 'text-gray-700'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}

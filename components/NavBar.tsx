'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { UserNav } from '@/components/auth/UserNav';

const navLinks = [
  { href: '/', label: 'PAYE' },
  { href: '/contractor-calculator', label: 'Contractor' },
  { href: '/rent-tax-credit', label: 'Rent credit' },
  { href: '/about', label: 'About' },
];

export function NavBar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="font-serif text-lg text-brand-700">
          MyIrishTax
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm transition-colors hover:text-ink ${
                pathname === link.href ? 'text-brand-700' : 'text-ink-muted'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <UserNav />
        </div>
        <div className="flex items-center gap-3 md:hidden">
          <UserNav />
          <button
            onClick={() => setMobileOpen((prev) => !prev)}
            className="rounded-md p-2 text-ink-muted hover:bg-white hover:text-ink"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {mobileOpen && (
        <div className="border-t border-line bg-paper md:hidden">
          <div className="space-y-1 px-4 py-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block rounded-md px-3 py-2 text-sm ${
                  pathname === link.href ? 'bg-white text-brand-700' : 'text-ink'
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

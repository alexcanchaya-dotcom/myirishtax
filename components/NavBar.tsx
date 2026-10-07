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

// Phone menu lists every calculator and guide (the desktop bar stays short).
const mobileGroups: { heading: string; links: { href: string; label: string }[] }[] = [
  {
    heading: 'Calculators',
    links: [
      { href: '/', label: 'Take-home pay (PAYE)' },
      { href: '/contractor-calculator', label: 'Contractor' },
      { href: '/redundancy-calculator', label: 'Redundancy' },
      { href: '/auto-enrolment-calculator', label: 'Auto-enrolment' },
      { href: '/rent-tax-credit', label: 'Rent credit' },
    ],
  },
  {
    heading: 'Guides',
    links: [
      { href: '/small-benefit-exemption', label: 'Small benefit exemption' },
      { href: '/second-income-form-12', label: 'Second income / Form 12' },
    ],
  },
  { heading: 'MyIrishTax', links: [{ href: '/about', label: 'About' }] },
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
          <UserNav signedOutLinks={false} />
        </div>
        <div className="flex items-center gap-3 md:hidden">
          <UserNav signedOutLinks={false} />
          <button
            onClick={() => setMobileOpen((prev) => !prev)}
            className="rounded-md p-3 text-ink-muted hover:bg-white hover:text-ink"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {mobileOpen && (
        <div id="mobile-menu" className="border-t border-line bg-paper md:hidden">
          <div className="space-y-3 px-4 py-3">
            {mobileGroups.map((group) => (
              <div key={group.heading}>
                <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-ink-muted">{group.heading}</p>
                <ul>
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        aria-current={pathname === link.href ? 'page' : undefined}
                        className={`block rounded-md px-3 py-3 text-base ${
                          pathname === link.href ? 'bg-white text-brand-700' : 'text-ink'
                        }`}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}

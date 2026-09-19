import './globals.css';
import React from 'react';
import { Source_Sans_3, Source_Serif_4 } from 'next/font/google';
import { SessionProvider } from '@/components/auth/SessionProvider';
import { NavBar } from '@/components/NavBar';
import { StickyDisclaimer } from '@/components/StickyDisclaimer';
import Link from 'next/link';

const sans = Source_Sans_3({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const serif = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

const title = 'Irish take-home pay | MyIrishTax';
const description =
  'Free Irish PAYE, USC and PRSI calculator for 2025 and 2026. Based on published Irish tax bands; not advice.';

export const metadata = {
  metadataBase: new URL('https://myirishtax.com'),
  title,
  description,
  alternates: {
    canonical: 'https://myirishtax.com',
  },
  openGraph: {
    title,
    description,
    url: 'https://myirishtax.com',
    siteName: 'MyIrishTax',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'MyIrishTax — Irish take-home pay calculator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: ['/og-image.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body className="flex min-h-screen flex-col bg-paper font-sans text-ink">
        <SessionProvider>
          <NavBar />
          <div className="flex-1">{children}</div>
          <footer className="border-t border-line bg-white">
            <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
              <div className="grid gap-10 sm:grid-cols-3">
                <div>
                  <Link href="/" className="font-serif text-lg text-brand-700">
                    MyIrishTax
                  </Link>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                    Irish take-home pay estimates from published tax bands.
                  </p>
                  <p className="mt-3 text-sm text-ink-muted">
                    <a href="mailto:support@myirishtax.com" className="hover:text-ink">
                      support@myirishtax.com
                    </a>
                  </p>
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Tools</h3>
                  <ul className="mt-3 space-y-2 text-sm text-ink">
                    <li><Link href="/" className="hover:text-brand-700">PAYE take-home</Link></li>
                    <li><Link href="/contractor-calculator" className="hover:text-brand-700">Contractor</Link></li>
                    <li><Link href="/rent-tax-credit" className="hover:text-brand-700">Rent tax credit</Link></li>
                    <li><Link href="/redundancy-calculator" className="hover:text-brand-700">Redundancy</Link></li>
                    <li><Link href="/auto-enrolment-calculator" className="hover:text-brand-700">Auto-enrolment</Link></li>
                    <li><Link href="/rental-calculator" className="text-ink-muted hover:text-brand-700">Rental (coming soon)</Link></li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Site</h3>
                  <ul className="mt-3 space-y-2 text-sm text-ink">
                    <li><Link href="/about" className="hover:text-brand-700">About</Link></li>
                    <li><Link href="/privacy" className="hover:text-brand-700">Privacy</Link></li>
                    <li><Link href="/terms" className="hover:text-brand-700">Terms</Link></li>
                    <li><Link href="/cookies" className="hover:text-brand-700">Cookies</Link></li>
                    <li><Link href="/disclaimer" className="hover:text-brand-700">Disclaimer</Link></li>
                  </ul>
                  <h3 className="mt-6 text-xs font-semibold uppercase tracking-wider text-ink-muted">Sister sites</h3>
                  <ul className="mt-3 space-y-2 text-sm text-ink">
                    <li>
                      <a href="https://wealthmodeler.com" className="hover:text-brand-700" rel="noopener noreferrer">
                        Wealth Modeler
                      </a>
                    </li>
                    <li>
                      <a href="https://longevitymodeler.com" className="hover:text-brand-700" rel="noopener noreferrer">
                        Longevity Modeler
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
              <p className="mt-10 border-t border-line pt-6 text-xs text-ink-muted">
                © {new Date().getFullYear()} MyIrishTax. Registered company details on request.
              </p>
            </div>
          </footer>
          <StickyDisclaimer />
        </SessionProvider>
      </body>
    </html>
  );
}

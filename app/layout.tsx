import './globals.css';
import React from 'react';
import { SessionProvider } from '@/components/auth/SessionProvider';
import { AppShell } from '@/components/AppShell';

export const metadata = {
  title: 'MyIrishTax - Free Irish Tax Calculators | PAYE, USC, PRSI, Contractor, Rental',
  description:
    'Free Irish tax calculators built by an ACCA qualified accountant. Calculate PAYE, USC, PRSI, contractor tax, rental income tax, rent tax credit, and auto-enrolment pension contributions for 2026.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 flex flex-col min-h-screen">
        <SessionProvider>
          <AppShell>{children}</AppShell>
        </SessionProvider>
      </body>
    </html>
  );
}

'use client';

import Link from 'next/link';
import { Workbook } from '@/components/workbook/Workbook';

export default function LedgerPage() {
  return (
    <div className="paper-ledger" suppressHydrationWarning>
      <div className="no-print flex h-9 items-center gap-2 border-b border-border bg-card px-3 text-xs text-muted-foreground">
        <Link href="/" className="font-medium text-foreground hover:underline">
          MyIrishTax
        </Link>
        <span aria-hidden="true">/</span>
        <span>Paper Ledger</span>
        <span className="ml-auto hidden sm:inline">Books stay in this browser. Export a JSON backup before you change computers.</span>
      </div>
      <Workbook />
    </div>
  );
}

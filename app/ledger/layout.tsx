import type { Metadata } from 'next';
import '../ledger.css';

export const metadata: Metadata = {
  title: 'Paper Ledger | MyIrishTax',
  description:
    'Books for a small business — register, P&L, follow-ups, assets, tax working paper, and a real Excel file. Tuition & Coaching / Kumon is the flagship kit.',
};

export default function LedgerLayout({ children }: { children: React.ReactNode }) {
  return children;
}

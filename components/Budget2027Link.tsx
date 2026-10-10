import Link from 'next/link';
import { BUDGET_2027 } from '@/lib/config/taxYear2027';

const link = 'text-ink underline decoration-line underline-offset-2 hover:text-brand-700';

/** In-text link to /budget-2027, shown only once the Budget 2027 figures are marked confirmed. */
export function Budget2027Link({ before = '', after = '' }: { before?: string; after?: string }) {
  if (BUDGET_2027.status !== 'confirmed') return null;
  return (
    <>
      {before}
      <Link href="/budget-2027" className={link}>
        Check your take-home pay with Budget 2027
      </Link>
      {after}
    </>
  );
}

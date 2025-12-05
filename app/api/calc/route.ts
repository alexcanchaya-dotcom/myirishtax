import { NextResponse } from 'next/server';
import { z } from 'zod';
import { calculateNetIncome } from '../../../lib/taxEngine';

const schema = z.object({
  income: z.number(),
  period: z.enum(['annual', 'monthly', 'weekly']),
  maritalStatus: z.enum(['single', 'married']),
  pensionContribution: z.number().optional(),
  additionalCredits: z.number().optional(),
  taxYear: z.number(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const breakdown = calculateNetIncome(parsed.data);
  return NextResponse.json({ breakdown });
}

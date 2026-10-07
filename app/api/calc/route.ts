import { NextResponse } from 'next/server';
import { z } from 'zod';
import { calculateNetIncome } from '../../../lib/taxEngine';
import { listSupportedYears } from '../../../lib/config/taxYearConfig';

const SUPPORTED_YEARS = listSupportedYears();

const schema = z.object({
  income: z.number().finite().min(0, 'Income cannot be negative'),
  period: z.enum(['annual', 'monthly', 'weekly']),
  maritalStatus: z.enum(['single', 'married']),
  pensionContribution: z.number().finite().min(0).optional(),
  age: z.number().int().min(16).max(120).optional(),
  additionalCredits: z.number().finite().min(0).optional(),
  taxYear: z
    .number()
    .int()
    .refine((y) => SUPPORTED_YEARS.includes(y), { message: `Supported tax years: ${SUPPORTED_YEARS.join(', ')}` }),
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

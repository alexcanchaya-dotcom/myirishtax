import { NextResponse } from 'next/server';
import { z } from 'zod';
import { computeFullTaxReturn } from '../../../../lib/taxEngine/fullReturn';
import { NormalisedTransaction } from '../../../../lib/normalisers/types';

const schema = z.object({
  income: z.number(),
  period: z.enum(['annual', 'monthly', 'weekly']),
  maritalStatus: z.enum(['single', 'married']),
  pensionContribution: z.number().optional(),
  additionalCredits: z.number().optional(),
  taxYear: z.number(),
  transactions: z.array(
    z.object({
      id: z.string(),
      date: z.string(),
      type: z.string(),
      amount: z.number().optional(),
      costBasis: z.number().optional(),
      currency: z.string().optional(),
      source: z.string().optional(),
    })
  ),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const result = computeFullTaxReturn(
    {
      income: parsed.data.income,
      period: parsed.data.period,
      maritalStatus: parsed.data.maritalStatus,
      pensionContribution: parsed.data.pensionContribution,
      additionalCredits: parsed.data.additionalCredits,
      taxYear: parsed.data.taxYear,
    },
    parsed.data.transactions as NormalisedTransaction[]
  );

  return NextResponse.json({ result });
}

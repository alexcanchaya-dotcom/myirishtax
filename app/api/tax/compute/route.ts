import { NextResponse } from 'next/server';
import { z } from 'zod';
import { computeFullTaxReturn } from '../../../../lib/taxEngine/fullReturn';
import { NormalisedTransaction } from '../../../../lib/normalisers/types';
import { isSingleOnlyYear, listSupportedYears } from '../../../../lib/config/taxYearConfig';

const SUPPORTED_YEARS = listSupportedYears();

const schema = z.object({
  income: z.number().finite().min(0, 'Income cannot be negative'),
  period: z.enum(['annual', 'monthly', 'weekly']),
  maritalStatus: z.enum(['single', 'married']),
  pensionContribution: z.number().finite().min(0).optional(),
  additionalCredits: z.number().finite().min(0).optional(),
  taxYear: z
    .number()
    .int()
    .refine((y) => SUPPORTED_YEARS.includes(y), { message: `Supported tax years: ${SUPPORTED_YEARS.join(', ')}` }),
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
  if (isSingleOnlyYear(parsed.data.taxYear)) {
    const d = parsed.data as { maritalStatus: string; singleParent?: boolean; homeCarer?: boolean; spouseIncome?: number };
    if (d.maritalStatus !== 'single' || d.singleParent === true || d.homeCarer === true || (d.spouseIncome ?? 0) > 0) {
      return NextResponse.json(
        { error: `${parsed.data.taxYear} is available for single people only. Couples and single parents: added once the Finance Bill confirms the figures.` },
        { status: 400 },
      );
    }
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

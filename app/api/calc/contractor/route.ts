import { NextResponse } from 'next/server';
import { z } from 'zod';
import { calculateContractorTax } from '@/lib/taxEngine/contractorCalculator';

const schema = z.object({
  grossIncome: z.number().min(0),
  expenses: z.number().min(0),
  pensionContribution: z.number().min(0).optional(),
  taxYear: z.number().min(2023).max(2026),
  maritalStatus: z.enum(['single', 'married']),
  previousYearTax: z.number().min(0).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const breakdown = calculateContractorTax(parsed.data);

    return NextResponse.json({ breakdown });
  } catch (error) {
    console.error('Contractor calculation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

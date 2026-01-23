import { NextResponse } from 'next/server';
import { z } from 'zod';
import { calculateContractorTax } from '@/lib/taxEngine/contractorCalculator';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';

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
    // Check authentication and premium access
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user has Premium or Professional subscription
    const tier = session.user.subscriptionTier;
    if (tier === 'FREE' || session.user.subscriptionStatus !== 'active') {
      return NextResponse.json(
        { error: 'Premium subscription required for contractor calculator' },
        { status: 403 }
      );
    }

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

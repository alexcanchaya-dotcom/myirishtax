import { NextResponse } from 'next/server';
import { z } from 'zod';
import { calculateRentalTax } from '@/lib/taxEngine/rentalCalculator';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';

const schema = z.object({
  grossRentalIncome: z.number().min(0),
  mortgageInterest: z.number().min(0),
  insurancePremiums: z.number().min(0),
  repairs: z.number().min(0),
  managementFees: z.number().min(0),
  accountingFees: z.number().min(0),
  legalFees: z.number().min(0),
  advertisingCosts: z.number().min(0),
  lptPropertyTax: z.number().min(0),
  otherExpenses: z.number().min(0),
  preLettingExpenses: z.number().min(0),
  otherIncome: z.number().min(0).optional(),
  maritalStatus: z.enum(['single', 'married']),
  taxYear: z.number().min(2023).max(2026),
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
        { error: 'Premium subscription required for rental calculator' },
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

    const breakdown = calculateRentalTax(parsed.data);

    return NextResponse.json({ breakdown });
  } catch (error) {
    console.error('Rental calculation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

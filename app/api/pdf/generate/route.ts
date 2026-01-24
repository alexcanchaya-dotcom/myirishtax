import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { z } from 'zod';
import { generateTaxPdf } from '../../../../lib/pdf/generator';
import { FullTaxComputation } from '../../../../lib/taxEngine/fullReturn';

const schema = z.object({
  result: z.any(),
  user: z.object({ name: z.string().optional() }).optional(),
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

    // Check if user has premium or professional subscription
    const tier = session.user.subscriptionTier;
    if (tier === 'FREE' || session.user.subscriptionStatus !== 'active') {
      return NextResponse.json(
        { error: 'Premium subscription required for PDF exports' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    // Generate PDF with user info from session
    const pdf = await generateTaxPdf(
      parsed.data.result as FullTaxComputation,
      { name: session.user.name || undefined }
    );

    return new NextResponse(pdf, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="myirishtax-report-${new Date().toISOString().split('T')[0]}.pdf"`,
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { z } from 'zod';
import { chatWithAssistant } from '../../../../lib/ai/chat';

const schema = z.object({
  message: z.string().min(1).max(1000),
  context: z.record(z.any()).optional(),
});

const SYSTEM_PROMPT = `You are an expert Irish tax assistant for myIrishtax.com. You help users understand Irish tax law and calculations.

Key responsibilities:
1. Answer questions about Irish PAYE, USC, PRSI, self-employed tax, rental income tax, and redundancy payments
2. Explain Irish tax credits, deductions, and relief schemes
3. Help users understand their tax calculations
4. Provide guidance on tax deadlines and filing requirements
5. Explain Irish Revenue rules and regulations

Important guidelines:
- Always reference Irish tax law (not UK or other countries)
- Use current tax rates for 2024-2026 (20% standard rate, 40% higher rate)
- Mention USC rates: 0.5%, 2%, 4.5%, 8%
- PRSI for employees: 4%, for self-employed (Class S): 4%
- Be clear that you provide information, not professional tax advice
- Recommend consulting a qualified accountant for complex situations
- Be concise but thorough - users appreciate clear, actionable answers
- Always cite Irish Revenue (revenue.ie) as the authoritative source

Current context (if provided): The user may have shared calculation data from our calculators.`;

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user has Professional subscription
    const tier = session.user.subscriptionTier;
    if (tier !== 'PROFESSIONAL' || session.user.subscriptionStatus !== 'active') {
      return NextResponse.json(
        { error: 'Professional subscription required for AI tax assistant' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid message format' }, { status: 400 });
    }

    const reply = await chatWithAssistant(parsed.data.message, SYSTEM_PROMPT, parsed.data.context);
    return NextResponse.json({ reply });
  } catch (error) {
    console.error('AI chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { chatWithAssistant } from '../../../../lib/ai/chat';

const schema = z.object({
  message: z.string(),
  context: z.record(z.any()).optional(),
});

const SYSTEM_PROMPT =
  'You are an Irish tax assistant. You are NOT a replacement for professional advice. Provide clear, concise explanations using Irish Revenue rules.';

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const reply = await chatWithAssistant(`${SYSTEM_PROMPT}\n\n${parsed.data.message}`, parsed.data.context);
  return NextResponse.json({ reply });
}

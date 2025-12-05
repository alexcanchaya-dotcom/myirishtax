import { NextResponse } from 'next/server';
import { z } from 'zod';
import { parseCsvBySource } from '../../../../lib/csvParsers/parsers';
import { normaliseTransactions } from '../../../../lib/normalisers';

const schema = z.object({
  csv: z.string(),
  source: z.string().optional(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const raw = parseCsvBySource(parsed.data.csv, parsed.data.source as any);
  const normalised = normaliseTransactions(raw);
  return NextResponse.json({ raw, normalised });
}

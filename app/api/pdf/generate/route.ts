import { NextResponse } from 'next/server';
import { z } from 'zod';
import { generateTaxPdf } from '../../../../lib/pdf/generator';
import { FullTaxComputation } from '../../../../lib/taxEngine/fullReturn';

const schema = z.object({
  result: z.any(),
  user: z.object({ name: z.string().optional() }).optional(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const pdf = await generateTaxPdf(parsed.data.result as FullTaxComputation, parsed.data.user);
  return new NextResponse(pdf, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="tax.pdf"',
    },
  });
}

import { PDFDocument, StandardFonts } from 'pdf-lib';
import { FullTaxComputation } from '../taxEngine/fullReturn';

export async function generateTaxPdf(result: FullTaxComputation, user?: { name?: string }) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const drawText = (text: string, y: number) => {
    page.drawText(text, { x: 50, y, size: 12, font });
  };

  let cursor = 780;
  drawText(`MyIrishTax Summary for ${user?.name ?? 'guest'}`, cursor);
  cursor -= 20;
  drawText(`Tax Year: ${result.paye ? 'Configured' : 'Unknown'}`, cursor);
  cursor -= 20;
  drawText(`PAYE/USC/PRSI: €${result.paye.totalTax.toFixed(2)}`, cursor);
  cursor -= 20;
  drawText(`Dividends: €${result.dividendTax.toFixed(2)}`, cursor);
  cursor -= 20;
  drawText(`Interest: €${result.interestTax.toFixed(2)}`, cursor);
  cursor -= 20;
  drawText(`CGT: €${result.cgt.toFixed(2)}`, cursor);
  cursor -= 20;
  drawText(`Foreign Tax Credit: €${result.foreignCredit.toFixed(2)}`, cursor);
  cursor -= 20;
  drawText(`Final Liability/Refund: €${result.finalLiability.toFixed(2)}`, cursor);

  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
}

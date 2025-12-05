import { detectCsvSource } from '../../lib/csvParsers/detect';
import { parseCsvBySource } from '../../lib/csvParsers/parsers';
import { normaliseTransactions } from '../../lib/normalisers';

describe('csv parsing', () => {
  const csv = 'degiro header\n1,2024-01-01,Dividend,100,EUR';
  it('detects source', () => {
    expect(detectCsvSource(csv)).toBe('degiro');
  });
  it('parses and normalises', () => {
    const raw = parseCsvBySource(csv);
    const norm = normaliseTransactions(raw);
    expect(norm[0].type).toBeDefined();
  });
});

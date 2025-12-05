export type CsvSource = 'degiro' | 'revolut' | 'coinbase' | 'generic' | 'trading212' | 'binance' | 'bank' | 'employer';

export function detectCsvSource(csv: string): CsvSource {
  const header = csv.split(/\r?\n/)[0].toLowerCase();
  if (header.includes('degiro')) return 'degiro';
  if (header.includes('trading212')) return 'trading212';
  if (header.includes('revolut')) return 'revolut';
  if (header.includes('coinbase') || header.includes('binance')) return 'coinbase';
  if (header.includes('employer') || header.includes('payslip')) return 'employer';
  if (header.includes('bank')) return 'bank';
  return 'generic';
}

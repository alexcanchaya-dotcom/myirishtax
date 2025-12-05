import { detectCsvSource, CsvSource } from './detect';
import { NormalisedTransaction, RawTransaction } from '../normalisers/types';

function parseCSV(csv: string): string[][] {
  return csv
    .trim()
    .split(/\r?\n/)
    .map((line) => line.split(',').map((cell) => cell.trim()));
}

function toRawTransactions(rows: string[][], mapper: (row: string[]) => RawTransaction | null): RawTransaction[] {
  return rows
    .slice(1)
    .map(mapper)
    .filter((item): item is RawTransaction => Boolean(item));
}

export function parseDegiro(csv: string): RawTransaction[] {
  const rows = parseCSV(csv);
  return toRawTransactions(rows, (row) => ({
    id: row[0],
    date: row[1],
    description: row[2],
    amount: Number(row[3]),
    currency: row[4] ?? 'EUR',
    source: 'degiro',
  }));
}

export function parseRevolut(csv: string): RawTransaction[] {
  const rows = parseCSV(csv);
  return toRawTransactions(rows, (row) => ({
    id: row[0] ?? crypto.randomUUID(),
    date: row[1],
    description: row[2],
    amount: Number(row[3]),
    currency: row[4] ?? 'EUR',
    source: 'revolut',
  }));
}

export function parseGeneric(csv: string): RawTransaction[] {
  const rows = parseCSV(csv);
  return toRawTransactions(rows, (row) => ({
    id: row[0] ?? crypto.randomUUID(),
    date: row[1],
    description: row[2],
    amount: Number(row[3] ?? 0),
    currency: row[4] ?? 'EUR',
    source: 'generic',
  }));
}

export function parseCsvBySource(csv: string, forcedSource?: CsvSource): RawTransaction[] {
  const source = forcedSource ?? detectCsvSource(csv);
  switch (source) {
    case 'degiro':
      return parseDegiro(csv);
    case 'revolut':
      return parseRevolut(csv);
    default:
      return parseGeneric(csv);
  }
}

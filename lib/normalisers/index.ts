import { NormalisedTransaction, RawTransaction } from './types';

export function normaliseTransaction(raw: RawTransaction): NormalisedTransaction {
  const description = raw.description?.toLowerCase() ?? '';
  if (description.includes('dividend')) {
    return { ...raw, type: 'dividend' };
  }
  if (description.includes('interest')) {
    return { ...raw, type: 'interest' };
  }
  if (description.includes('salary') || description.includes('payslip')) {
    return { ...raw, type: 'employment_income' };
  }
  if (description.includes('etf')) {
    return { ...raw, type: 'etf_trade' };
  }
  if (description.includes('btc') || description.includes('eth')) {
    return { ...raw, type: 'crypto_trade' };
  }
  return { ...raw, type: 'stock_trade' };
}

export function normaliseTransactions(raw: RawTransaction[]): NormalisedTransaction[] {
  return raw.map(normaliseTransaction);
}

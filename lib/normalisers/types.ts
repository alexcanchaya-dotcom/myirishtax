export interface RawTransaction {
  id: string;
  date: string;
  description?: string;
  amount?: number;
  quantity?: number;
  price?: number;
  costBasis?: number;
  currency?: string;
  source?: string;
}

export interface NormalisedTransaction {
  id: string;
  date: string;
  type:
    | 'employment_income'
    | 'dividend'
    | 'interest'
    | 'stock_trade'
    | 'etf_trade'
    | 'crypto_trade'
    | 'rental_income'
    | 'foreign_income'
    | 'pension_contribution';
  amount?: number;
  quantity?: number;
  price?: number;
  costBasis?: number;
  currency?: string;
  source?: string;
}

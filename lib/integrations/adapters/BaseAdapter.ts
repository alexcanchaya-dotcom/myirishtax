/**
 * Base adapter class with common functionality for all exchanges
 */

import { ExchangeAdapter, ExchangeCredentials, ExchangeTransaction, ExchangeBalance, ExchangeMetadata } from '../types';

export abstract class BaseAdapter implements ExchangeAdapter {
  abstract metadata: ExchangeMetadata;

  /**
   * Make HTTP request with proper error handling and rate limiting
   */
  protected async makeRequest<T>(
    url: string,
    options: RequestInit,
    retries = 3
  ): Promise<T> {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
        });

        // Handle rate limiting
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : (attempt + 1) * 2000;
          console.log(`Rate limited. Waiting ${waitTime}ms before retry...`);
          await this.sleep(waitTime);
          continue;
        }

        // Handle errors
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        return await response.json();
      } catch (error) {
        if (attempt === retries - 1) {
          throw error;
        }
        // Exponential backoff
        await this.sleep((attempt + 1) * 1000);
      }
    }

    throw new Error('Max retries exceeded');
  }

  /**
   * Sleep for specified milliseconds
   */
  protected sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Convert price to EUR if needed
   * Override this in adapters that need currency conversion
   */
  protected async convertToEUR(amount: number, currency: string): Promise<number> {
    if (currency === 'EUR') {
      return amount;
    }

    // For now, use a simple conversion API
    // In production, you'd want to cache rates and use a reliable API
    try {
      const response = await fetch(
        `https://api.exchangerate-api.com/v4/latest/${currency}`
      );
      const data = await response.json();
      return amount * data.rates.EUR;
    } catch (error) {
      console.error(`Failed to convert ${currency} to EUR:`, error);
      // Fallback: return original amount
      return amount;
    }
  }

  /**
   * Normalize transaction data to common format
   * Override in specific adapters to handle exchange-specific formats
   */
  protected normalizeTransaction(raw: any): ExchangeTransaction {
    throw new Error('normalizeTransaction must be implemented by subclass');
  }

  /**
   * Test connection - must be implemented by subclass
   */
  abstract testConnection(credentials: ExchangeCredentials): Promise<boolean>;

  /**
   * Fetch transactions - must be implemented by subclass
   */
  abstract fetchTransactions(
    credentials: ExchangeCredentials,
    fromDate: Date,
    toDate: Date
  ): Promise<ExchangeTransaction[]>;

  /**
   * Fetch balances - must be implemented by subclass
   */
  abstract fetchBalances(credentials: ExchangeCredentials): Promise<ExchangeBalance[]>;
}

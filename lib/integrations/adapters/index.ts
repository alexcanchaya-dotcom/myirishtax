/**
 * Exchange Adapter Registry
 * Central place to get adapters for different exchanges
 */

import { ExchangeAdapter } from '../types';
import { BinanceAdapter } from './BinanceAdapter';
import { CoinbaseAdapter } from './CoinbaseAdapter';

/**
 * Registry of all available exchange adapters
 */
const adapters: Map<string, ExchangeAdapter> = new Map();

// Register adapters
adapters.set('binance', new BinanceAdapter());
adapters.set('coinbase', new CoinbaseAdapter());

// TODO: Add more adapters
// adapters.set('revolut', new RevolutAdapter());
// adapters.set('kraken', new KrakenAdapter());
// adapters.set('trading212', new Trading212Adapter());
// adapters.set('degiro', new DegiroAdapter());
// adapters.set('ibkr', new IBKRAdapter());

/**
 * Get adapter for a specific exchange
 * @param exchangeId - Exchange ID (e.g., "binance", "coinbase")
 * @returns Exchange adapter instance
 */
export function getAdapter(exchangeId: string): ExchangeAdapter {
  const adapter = adapters.get(exchangeId.toLowerCase());
  if (!adapter) {
    throw new Error(`No adapter found for exchange: ${exchangeId}`);
  }
  return adapter;
}

/**
 * Check if an exchange is supported
 */
export function isSupported(exchangeId: string): boolean {
  return adapters.has(exchangeId.toLowerCase());
}

/**
 * Get list of all supported exchange IDs
 */
export function getSupportedExchanges(): string[] {
  return Array.from(adapters.keys());
}

/**
 * Get adapters by type
 */
export function getAdaptersByType(type: 'crypto' | 'stock' | 'both'): ExchangeAdapter[] {
  return Array.from(adapters.values()).filter(adapter => {
    return adapter.metadata.type === type || adapter.metadata.type === 'both';
  });
}

/**
 * Binance Exchange Adapter
 * Documentation: https://binance-docs.github.io/apidocs/spot/en/
 */

import crypto from 'crypto';
import { BaseAdapter } from './BaseAdapter';
import {
  ExchangeMetadata,
  ExchangeCredentials,
  ExchangeTransaction,
  ExchangeBalance,
} from '../types';

const BASE_URL = 'https://api.binance.com';

interface BinanceOrder {
  symbol: string;
  orderId: number;
  orderListId: number;
  price: string;
  origQty: string;
  executedQty: string;
  cummulativeQuoteQty: string;
  status: string;
  timeInForce: string;
  type: string;
  side: 'BUY' | 'SELL';
  time: number;
  updateTime: number;
  isIsolated: boolean;
  commission: string;
  commissionAsset: string;
}

interface BinanceBalance {
  asset: string;
  free: string;
  locked: string;
}

export class BinanceAdapter extends BaseAdapter {
  metadata: ExchangeMetadata = {
    id: 'binance',
    name: 'Binance',
    type: 'crypto',
    supportsOAuth: false,
    supportsApiKey: true,
    supportsWebhooks: true,
    requiresPassphrase: false,
    websiteUrl: 'https://www.binance.com',
    documentationUrl: 'https://binance-docs.github.io/apidocs',
    limits: {
      rateLimit: 1200,
      maxTransactionsPerRequest: 1000,
    },
  };

  /**
   * Sign request with API secret
   */
  private signRequest(queryString: string, apiSecret: string): string {
    return crypto
      .createHmac('sha256', apiSecret)
      .update(queryString)
      .digest('hex');
  }

  /**
   * Build authenticated request URL
   */
  private buildAuthenticatedUrl(
    endpoint: string,
    params: Record<string, any>,
    apiSecret: string
  ): string {
    // Add timestamp
    const timestamp = Date.now();
    const queryParams = {
      ...params,
      timestamp,
      recvWindow: 5000,
    };

    // Build query string
    const queryString = Object.entries(queryParams)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

    // Sign
    const signature = this.signRequest(queryString, apiSecret);

    return `${BASE_URL}${endpoint}?${queryString}&signature=${signature}`;
  }

  async testConnection(credentials: ExchangeCredentials): Promise<boolean> {
    if (!credentials.apiKey || !credentials.apiSecret) {
      return false;
    }

    try {
      const url = this.buildAuthenticatedUrl(
        '/api/v3/account',
        {},
        credentials.apiSecret
      );

      await this.makeRequest(url, {
        method: 'GET',
        headers: {
          'X-MBX-APIKEY': credentials.apiKey,
        },
      });

      return true;
    } catch (error) {
      console.error('Binance connection test failed:', error);
      return false;
    }
  }

  async fetchTransactions(
    credentials: ExchangeCredentials,
    fromDate: Date,
    toDate: Date
  ): Promise<ExchangeTransaction[]> {
    if (!credentials.apiKey || !credentials.apiSecret) {
      throw new Error('API key and secret required for Binance');
    }

    const transactions: ExchangeTransaction[] = [];

    try {
      // Get all trading pairs
      const symbols = await this.getTradingPairs(credentials);

      // Fetch trades for each symbol
      for (const symbol of symbols) {
        const trades = await this.getTradesForSymbol(
          credentials,
          symbol,
          fromDate,
          toDate
        );
        transactions.push(...trades);
      }

      return transactions;
    } catch (error) {
      console.error('Error fetching Binance transactions:', error);
      throw error;
    }
  }

  async fetchBalances(credentials: ExchangeCredentials): Promise<ExchangeBalance[]> {
    if (!credentials.apiKey || !credentials.apiSecret) {
      throw new Error('API key and secret required for Binance');
    }

    try {
      const url = this.buildAuthenticatedUrl(
        '/api/v3/account',
        {},
        credentials.apiSecret
      );

      const response = await this.makeRequest<{ balances: BinanceBalance[] }>(url, {
        method: 'GET',
        headers: {
          'X-MBX-APIKEY': credentials.apiKey,
        },
      });

      const balances: ExchangeBalance[] = [];

      for (const balance of response.balances) {
        const total = parseFloat(balance.free) + parseFloat(balance.locked);
        if (total > 0) {
          // Get current price
          const price = await this.getAssetPrice(balance.asset);

          balances.push({
            symbol: balance.asset,
            assetName: balance.asset,
            assetType: 'crypto',
            quantity: total,
            price,
            value: total * price,
          });
        }
      }

      return balances;
    } catch (error) {
      console.error('Error fetching Binance balances:', error);
      throw error;
    }
  }

  /**
   * Get list of trading pairs user has traded
   */
  private async getTradingPairs(credentials: ExchangeCredentials): Promise<string[]> {
    const url = this.buildAuthenticatedUrl(
      '/api/v3/account',
      {},
      credentials.apiSecret!
    );

    const response = await this.makeRequest<{ balances: BinanceBalance[] }>(url, {
      method: 'GET',
      headers: {
        'X-MBX-APIKEY': credentials.apiKey!,
      },
    });

    // Get symbols that have non-zero balances
    const assets = response.balances
      .filter(b => parseFloat(b.free) + parseFloat(b.locked) > 0)
      .map(b => b.asset);

    // Common trading pairs
    const quoteCurrencies = ['USDT', 'EUR', 'BTC', 'ETH'];
    const symbols: string[] = [];

    for (const asset of assets) {
      for (const quote of quoteCurrencies) {
        if (asset !== quote) {
          symbols.push(`${asset}${quote}`);
        }
      }
    }

    return symbols;
  }

  /**
   * Get trades for a specific symbol
   */
  private async getTradesForSymbol(
    credentials: ExchangeCredentials,
    symbol: string,
    fromDate: Date,
    toDate: Date
  ): Promise<ExchangeTransaction[]> {
    try {
      const url = this.buildAuthenticatedUrl(
        '/api/v3/myTrades',
        {
          symbol,
          startTime: fromDate.getTime(),
          endTime: toDate.getTime(),
          limit: 1000,
        },
        credentials.apiSecret!
      );

      const trades = await this.makeRequest<any[]>(url, {
        method: 'GET',
        headers: {
          'X-MBX-APIKEY': credentials.apiKey!,
        },
      });

      return trades.map(trade => this.normalizeBinanceTrade(trade, symbol));
    } catch (error: any) {
      // Symbol might not exist, skip it
      if (error.message.includes('Invalid symbol')) {
        return [];
      }
      throw error;
    }
  }

  /**
   * Normalize Binance trade to common format
   */
  private normalizeBinanceTrade(trade: any, symbol: string): ExchangeTransaction {
    // Parse symbol (e.g., "BTCUSDT" -> base: "BTC", quote: "USDT")
    const baseAsset = symbol.replace(/USDT|EUR|BTC|ETH|BUSD$/, '');
    const quoteAsset = symbol.replace(baseAsset, '');

    const quantity = parseFloat(trade.qty);
    const price = parseFloat(trade.price);
    const fee = parseFloat(trade.commission || 0);
    const isBuy = trade.isBuyer;

    return {
      type: isBuy ? 'buy' : 'sell',
      date: new Date(trade.time),
      exchangeTxId: `binance_${trade.id}`,
      symbol: baseAsset,
      assetName: baseAsset,
      assetType: 'crypto',
      quantity,
      price,
      fee,
      totalCost: quantity * price + fee,
    };
  }

  /**
   * Get current price for an asset
   */
  private async getAssetPrice(symbol: string): Promise<number> {
    try {
      // Try USDT pair first
      const response = await this.makeRequest<{ price: string }>(
        `${BASE_URL}/api/v3/ticker/price?symbol=${symbol}USDT`,
        { method: 'GET' }
      );

      const usdtPrice = parseFloat(response.price);
      // Convert USDT to EUR (rough estimate, should use real rates)
      return await this.convertToEUR(usdtPrice, 'USD');
    } catch (error) {
      // If symbol doesn't exist or is a stablecoin, return 1
      if (['USDT', 'BUSD', 'EUR'].includes(symbol)) {
        return symbol === 'EUR' ? 1 : await this.convertToEUR(1, 'USD');
      }
      return 0;
    }
  }
}

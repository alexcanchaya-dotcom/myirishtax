/**
 * Coinbase Exchange Adapter
 * Documentation: https://docs.cloud.coinbase.com/sign-in-with-coinbase/docs
 */

import { BaseAdapter } from './BaseAdapter';
import {
  ExchangeMetadata,
  ExchangeCredentials,
  ExchangeTransaction,
  ExchangeBalance,
} from '../types';

const BASE_URL = 'https://api.coinbase.com/v2';
const OAUTH_URL = 'https://www.coinbase.com/oauth';

interface CoinbaseAccount {
  id: string;
  name: string;
  balance: {
    amount: string;
    currency: string;
  };
  currency: {
    code: string;
    name: string;
  };
  type: string;
}

interface CoinbaseTransaction {
  id: string;
  type: 'buy' | 'sell' | 'send' | 'receive' | 'trade' | 'fiat_deposit' | 'fiat_withdrawal';
  status: string;
  amount: {
    amount: string;
    currency: string;
  };
  native_amount: {
    amount: string;
    currency: string;
  };
  created_at: string;
  updated_at: string;
  resource: string;
  resource_path: string;
  network?: {
    status: string;
    hash: string;
  };
  buy?: any;
  sell?: any;
}

export class CoinbaseAdapter extends BaseAdapter {
  metadata: ExchangeMetadata = {
    id: 'coinbase',
    name: 'Coinbase',
    type: 'crypto',
    supportsOAuth: true,
    supportsApiKey: true,
    supportsWebhooks: true,
    requiresPassphrase: false,
    websiteUrl: 'https://www.coinbase.com',
    documentationUrl: 'https://docs.cloud.coinbase.com',
    limits: {
      rateLimit: 10,
    },
  };

  /**
   * Get OAuth authorization URL
   */
  getAuthUrl(redirectUri: string, state: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: process.env.COINBASE_CLIENT_ID || '',
      redirect_uri: redirectUri,
      state,
      scope: 'wallet:accounts:read,wallet:transactions:read,wallet:buys:read,wallet:sells:read',
    });

    return `${OAUTH_URL}/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(
    code: string,
    redirectUri: string
  ): Promise<ExchangeCredentials> {
    const response = await fetch(`${OAUTH_URL}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        client_id: process.env.COINBASE_CLIENT_ID,
        client_secret: process.env.COINBASE_CLIENT_SECRET,
        redirect_uri: redirectUri,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const data = await response.json();

    return {
      type: 'oauth',
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      tokenExpiresAt: new Date(Date.now() + data.expires_in * 1000),
    };
  }

  /**
   * Refresh OAuth token
   */
  async refreshToken(credentials: ExchangeCredentials): Promise<ExchangeCredentials> {
    if (!credentials.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${OAUTH_URL}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        refresh_token: credentials.refreshToken,
        client_id: process.env.COINBASE_CLIENT_ID,
        client_secret: process.env.COINBASE_CLIENT_SECRET,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();

    return {
      type: 'oauth',
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      tokenExpiresAt: new Date(Date.now() + data.expires_in * 1000),
    };
  }

  async testConnection(credentials: ExchangeCredentials): Promise<boolean> {
    if (!credentials.accessToken) {
      return false;
    }

    try {
      await this.makeRequest(`${BASE_URL}/user`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${credentials.accessToken}`,
        },
      });

      return true;
    } catch (error) {
      console.error('Coinbase connection test failed:', error);
      return false;
    }
  }

  async fetchTransactions(
    credentials: ExchangeCredentials,
    fromDate: Date,
    toDate: Date
  ): Promise<ExchangeTransaction[]> {
    if (!credentials.accessToken) {
      throw new Error('Access token required for Coinbase');
    }

    const transactions: ExchangeTransaction[] = [];

    try {
      // Get all accounts
      const accounts = await this.getAccounts(credentials);

      // Fetch transactions for each account
      for (const account of accounts) {
        const accountTxs = await this.getAccountTransactions(
          credentials,
          account.id,
          fromDate,
          toDate
        );
        transactions.push(...accountTxs);
      }

      return transactions;
    } catch (error) {
      console.error('Error fetching Coinbase transactions:', error);
      throw error;
    }
  }

  async fetchBalances(credentials: ExchangeCredentials): Promise<ExchangeBalance[]> {
    if (!credentials.accessToken) {
      throw new Error('Access token required for Coinbase');
    }

    try {
      const accounts = await this.getAccounts(credentials);
      const balances: ExchangeBalance[] = [];

      for (const account of accounts) {
        const balance = parseFloat(account.balance.amount);
        if (balance > 0) {
          // Get current price
          const price = await this.getAssetPrice(account.currency.code);

          balances.push({
            symbol: account.currency.code,
            assetName: account.currency.name,
            assetType: account.currency.code === 'EUR' || account.currency.code === 'USD' ? 'fiat' : 'crypto',
            quantity: balance,
            price,
            value: balance * price,
          });
        }
      }

      return balances;
    } catch (error) {
      console.error('Error fetching Coinbase balances:', error);
      throw error;
    }
  }

  /**
   * Get all user accounts (wallets)
   */
  private async getAccounts(credentials: ExchangeCredentials): Promise<CoinbaseAccount[]> {
    const response = await this.makeRequest<{ data: CoinbaseAccount[] }>(
      `${BASE_URL}/accounts`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${credentials.accessToken}`,
        },
      }
    );

    return response.data;
  }

  /**
   * Get transactions for a specific account
   */
  private async getAccountTransactions(
    credentials: ExchangeCredentials,
    accountId: string,
    fromDate: Date,
    toDate: Date
  ): Promise<ExchangeTransaction[]> {
    const response = await this.makeRequest<{ data: CoinbaseTransaction[] }>(
      `${BASE_URL}/accounts/${accountId}/transactions`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${credentials.accessToken}`,
        },
      }
    );

    // Filter by date range and normalize
    return response.data
      .filter(tx => {
        const txDate = new Date(tx.created_at);
        return txDate >= fromDate && txDate <= toDate;
      })
      .map(tx => this.normalizeCoinbaseTransaction(tx));
  }

  /**
   * Normalize Coinbase transaction to common format
   */
  private normalizeCoinbaseTransaction(tx: CoinbaseTransaction): ExchangeTransaction {
    const amount = parseFloat(tx.amount.amount);
    const nativeAmount = parseFloat(tx.native_amount.amount);
    const price = nativeAmount / amount;

    // Map Coinbase types to our types
    let type: ExchangeTransaction['type'];
    switch (tx.type) {
      case 'buy':
        type = 'buy';
        break;
      case 'sell':
        type = 'sell';
        break;
      case 'send':
        type = 'transfer_out';
        break;
      case 'receive':
        type = 'transfer_in';
        break;
      case 'trade':
        type = 'trade';
        break;
      case 'fiat_deposit':
        type = 'deposit';
        break;
      case 'fiat_withdrawal':
        type = 'withdrawal';
        break;
      default:
        type = 'fee';
    }

    return {
      type,
      date: new Date(tx.created_at),
      exchangeTxId: `coinbase_${tx.id}`,
      symbol: tx.amount.currency,
      assetName: tx.amount.currency,
      assetType: 'crypto',
      quantity: Math.abs(amount),
      price,
      fee: 0, // Coinbase includes fees separately
      totalCost: Math.abs(nativeAmount),
      walletAddress: tx.network?.hash,
    };
  }

  /**
   * Get current price for an asset
   */
  private async getAssetPrice(symbol: string): Promise<number> {
    try {
      const response = await this.makeRequest<{
        data: { amount: string; currency: string };
      }>(`${BASE_URL}/prices/${symbol}-EUR/spot`, {
        method: 'GET',
      });

      return parseFloat(response.data.amount);
    } catch (error) {
      // If price not available, assume it's fiat and return 1 for EUR
      if (symbol === 'EUR') {
        return 1;
      }
      return 0;
    }
  }
}

/**
 * Common types for exchange/broker API integrations
 */

export interface ExchangeCredentials {
  type: 'oauth' | 'api_key';
  accessToken?: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
  apiKey?: string;
  apiSecret?: string;
  apiPassphrase?: string;
}

export interface ExchangeTransaction {
  // Transaction basics
  type: 'buy' | 'sell' | 'trade' | 'transfer_in' | 'transfer_out' | 'dividend' | 'interest' | 'fee' | 'deposit' | 'withdrawal';
  date: Date;
  exchangeTxId: string; // Unique ID from the exchange

  // Asset information
  symbol: string;
  assetName?: string;
  assetType: 'crypto' | 'stock' | 'etf' | 'bond' | 'fiat';

  // Quantities and prices (in EUR)
  quantity: number;
  price: number; // Price per unit
  fee: number;
  totalCost: number; // Total including fees

  // For trades/swaps
  toSymbol?: string;
  toQuantity?: number;
  toPrice?: number;

  // Metadata
  walletAddress?: string;
  notes?: string;
}

export interface ExchangeBalance {
  symbol: string;
  assetName: string;
  assetType: 'crypto' | 'stock' | 'etf' | 'fiat';
  quantity: number;
  value: number; // Current value in EUR
  price: number; // Current price per unit
}

export interface SyncResult {
  success: boolean;
  transactionsFound: number;
  transactionsNew: number;
  transactionsUpdated: number;
  balances?: ExchangeBalance[];
  error?: string;
  fromDate?: Date;
  toDate?: Date;
}

export interface ExchangeMetadata {
  id: string; // Unique exchange ID (e.g., "revolut", "binance")
  name: string; // Display name
  type: 'crypto' | 'stock' | 'both';
  supportsOAuth: boolean;
  supportsApiKey: boolean;
  supportsWebhooks: boolean;
  requiresPassphrase: boolean;
  websiteUrl: string;
  documentationUrl?: string;
  limits?: {
    rateLimit: number; // Requests per minute
    maxTransactionsPerRequest?: number;
  };
}

/**
 * Base interface that all exchange adapters must implement
 */
export interface ExchangeAdapter {
  metadata: ExchangeMetadata;

  /**
   * Test if credentials are valid and working
   */
  testConnection(credentials: ExchangeCredentials): Promise<boolean>;

  /**
   * Fetch transactions for a date range
   * @param credentials - API credentials
   * @param fromDate - Start date (inclusive)
   * @param toDate - End date (inclusive)
   */
  fetchTransactions(
    credentials: ExchangeCredentials,
    fromDate: Date,
    toDate: Date
  ): Promise<ExchangeTransaction[]>;

  /**
   * Fetch current balances/holdings
   */
  fetchBalances(credentials: ExchangeCredentials): Promise<ExchangeBalance[]>;

  /**
   * Refresh OAuth token if needed
   * @returns New credentials with refreshed token
   */
  refreshToken?(credentials: ExchangeCredentials): Promise<ExchangeCredentials>;

  /**
   * Get OAuth authorization URL
   * @param redirectUri - Where to redirect after authorization
   * @param state - Random state for CSRF protection
   */
  getAuthUrl?(redirectUri: string, state: string): string;

  /**
   * Exchange authorization code for access token
   * @param code - Authorization code from OAuth callback
   * @param redirectUri - Must match the one used in getAuthUrl
   */
  exchangeCodeForToken?(code: string, redirectUri: string): Promise<ExchangeCredentials>;
}

/**
 * Registry of all supported exchanges
 */
export const SUPPORTED_EXCHANGES: ExchangeMetadata[] = [
  {
    id: 'revolut',
    name: 'Revolut',
    type: 'both',
    supportsOAuth: true,
    supportsApiKey: false,
    supportsWebhooks: true,
    requiresPassphrase: false,
    websiteUrl: 'https://www.revolut.com',
    documentationUrl: 'https://developer.revolut.com/docs',
    limits: {
      rateLimit: 60,
    },
  },
  {
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
  },
  {
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
  },
  {
    id: 'coinbase_pro',
    name: 'Coinbase Pro',
    type: 'crypto',
    supportsOAuth: false,
    supportsApiKey: true,
    supportsWebhooks: true,
    requiresPassphrase: true,
    websiteUrl: 'https://pro.coinbase.com',
    documentationUrl: 'https://docs.pro.coinbase.com',
    limits: {
      rateLimit: 10,
    },
  },
  {
    id: 'kraken',
    name: 'Kraken',
    type: 'crypto',
    supportsOAuth: false,
    supportsApiKey: true,
    supportsWebhooks: false,
    requiresPassphrase: false,
    websiteUrl: 'https://www.kraken.com',
    documentationUrl: 'https://docs.kraken.com',
    limits: {
      rateLimit: 20,
    },
  },
  {
    id: 'degiro',
    name: 'Degiro',
    type: 'stock',
    supportsOAuth: false,
    supportsApiKey: false, // Degiro doesn't have official API
    supportsWebhooks: false,
    requiresPassphrase: false,
    websiteUrl: 'https://www.degiro.ie',
    limits: {
      rateLimit: 10,
    },
  },
  {
    id: 'trading212',
    name: 'Trading 212',
    type: 'stock',
    supportsOAuth: false,
    supportsApiKey: true,
    supportsWebhooks: false,
    requiresPassphrase: false,
    websiteUrl: 'https://www.trading212.com',
    documentationUrl: 'https://trading212.com/api',
    limits: {
      rateLimit: 60,
    },
  },
  {
    id: 'ibkr',
    name: 'Interactive Brokers',
    type: 'stock',
    supportsOAuth: true,
    supportsApiKey: false,
    supportsWebhooks: false,
    requiresPassphrase: false,
    websiteUrl: 'https://www.interactivebrokers.com',
    documentationUrl: 'https://ibkrcampus.com/ibkr-api-page',
    limits: {
      rateLimit: 50,
    },
  },
];

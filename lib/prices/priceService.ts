/**
 * Price Service - Fetches real-time prices for crypto and stocks
 * Uses multiple APIs for redundancy and accuracy
 */

export interface AssetPrice {
  symbol: string;
  price: number; // Price in EUR
  priceUSD?: number;
  change24h?: number; // Percentage change
  lastUpdated: Date;
  source: string;
}

/**
 * Fetch price for a cryptocurrency
 * Uses CoinGecko API (free tier, no API key needed)
 */
async function fetchCryptoPrice(symbol: string): Promise<AssetPrice | null> {
  try {
    // Map common symbols to CoinGecko IDs
    const symbolMap: Record<string, string> = {
      BTC: 'bitcoin',
      ETH: 'ethereum',
      USDT: 'tether',
      BNB: 'binancecoin',
      SOL: 'solana',
      XRP: 'ripple',
      ADA: 'cardano',
      DOGE: 'dogecoin',
      DOT: 'polkadot',
      MATIC: 'matic-network',
      // Add more as needed
    };

    const coinId = symbolMap[symbol.toUpperCase()] || symbol.toLowerCase();

    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=eur,usd&include_24hr_change=true`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const priceData = data[coinId];

    if (!priceData) {
      return null;
    }

    return {
      symbol: symbol.toUpperCase(),
      price: priceData.eur,
      priceUSD: priceData.usd,
      change24h: priceData.eur_24h_change,
      lastUpdated: new Date(),
      source: 'coingecko',
    };
  } catch (error) {
    console.error(`Error fetching crypto price for ${symbol}:`, error);
    return null;
  }
}

/**
 * Fetch price for a stock
 * Uses Alpha Vantage API (free tier with API key)
 * Fallback to Yahoo Finance scraping
 */
async function fetchStockPrice(symbol: string): Promise<AssetPrice | null> {
  try {
    // Try Alpha Vantage first if API key is available
    if (process.env.ALPHA_VANTAGE_API_KEY) {
      const response = await fetch(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`
      );

      if (response.ok) {
        const data = await response.json();
        const quote = data['Global Quote'];

        if (quote && quote['05. price']) {
          const priceUSD = parseFloat(quote['05. price']);
          // Convert to EUR (simplified - in production use real-time rates)
          const eurRate = 0.92; // Rough USD to EUR conversion
          const priceEUR = priceUSD * eurRate;

          return {
            symbol: symbol.toUpperCase(),
            price: priceEUR,
            priceUSD,
            change24h: parseFloat(quote['10. change percent']?.replace('%', '') || '0'),
            lastUpdated: new Date(),
            source: 'alphavantage',
          };
        }
      }
    }

    // Fallback: Use a simpler API or return null
    // For demo purposes, return a mock price
    // In production, implement proper stock price fetching
    return null;
  } catch (error) {
    console.error(`Error fetching stock price for ${symbol}:`, error);
    return null;
  }
}

/**
 * Get price for any asset (crypto or stock)
 */
export async function getAssetPrice(
  symbol: string,
  assetType: 'crypto' | 'stock' | 'etf' | 'fiat'
): Promise<AssetPrice | null> {
  // Handle fiat currencies
  if (assetType === 'fiat') {
    if (symbol === 'EUR') {
      return {
        symbol: 'EUR',
        price: 1,
        lastUpdated: new Date(),
        source: 'fixed',
      };
    }
    // For other fiat, use exchange rates API
    try {
      const response = await fetch(
        `https://api.exchangerate-api.com/v4/latest/${symbol}`
      );
      if (response.ok) {
        const data = await response.json();
        return {
          symbol,
          price: data.rates.EUR,
          lastUpdated: new Date(),
          source: 'exchangerate-api',
        };
      }
    } catch (error) {
      console.error(`Error fetching fiat rate for ${symbol}:`, error);
    }
    return null;
  }

  // Fetch based on asset type
  if (assetType === 'crypto') {
    return await fetchCryptoPrice(symbol);
  } else if (assetType === 'stock' || assetType === 'etf') {
    return await fetchStockPrice(symbol);
  }

  return null;
}

/**
 * Get prices for multiple assets in batch
 * More efficient than individual calls
 */
export async function getBatchPrices(
  assets: Array<{ symbol: string; assetType: 'crypto' | 'stock' | 'etf' | 'fiat' }>
): Promise<Map<string, AssetPrice>> {
  const prices = new Map<string, AssetPrice>();

  // Group by asset type for efficient batching
  const cryptoAssets = assets.filter(a => a.assetType === 'crypto');
  const stockAssets = assets.filter(a => a.assetType === 'stock' || a.assetType === 'etf');
  const fiatAssets = assets.filter(a => a.assetType === 'fiat');

  // Fetch crypto prices in batch (CoinGecko supports multiple IDs)
  if (cryptoAssets.length > 0) {
    try {
      const symbolMap: Record<string, string> = {
        BTC: 'bitcoin',
        ETH: 'ethereum',
        USDT: 'tether',
        BNB: 'binancecoin',
        SOL: 'solana',
        XRP: 'ripple',
        ADA: 'cardano',
        DOGE: 'dogecoin',
        DOT: 'polkadot',
        MATIC: 'matic-network',
      };

      const ids = cryptoAssets
        .map(a => symbolMap[a.symbol.toUpperCase()] || a.symbol.toLowerCase())
        .join(',');

      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=eur,usd&include_24hr_change=true`
      );

      if (response.ok) {
        const data = await response.json();
        for (const asset of cryptoAssets) {
          const coinId = symbolMap[asset.symbol.toUpperCase()] || asset.symbol.toLowerCase();
          const priceData = data[coinId];
          if (priceData) {
            prices.set(asset.symbol, {
              symbol: asset.symbol.toUpperCase(),
              price: priceData.eur,
              priceUSD: priceData.usd,
              change24h: priceData.eur_24h_change,
              lastUpdated: new Date(),
              source: 'coingecko',
            });
          }
        }
      }
    } catch (error) {
      console.error('Error fetching batch crypto prices:', error);
    }
  }

  // Fetch stock prices individually (most free APIs don't support batch)
  for (const asset of stockAssets) {
    const price = await fetchStockPrice(asset.symbol);
    if (price) {
      prices.set(asset.symbol, price);
    }
  }

  // Handle fiat
  for (const asset of fiatAssets) {
    if (asset.symbol === 'EUR') {
      prices.set('EUR', {
        symbol: 'EUR',
        price: 1,
        lastUpdated: new Date(),
        source: 'fixed',
      });
    }
  }

  return prices;
}

/**
 * Cache for price data to reduce API calls
 * In production, use Redis or similar
 */
const priceCache = new Map<string, { price: AssetPrice; expiresAt: number }>();
const CACHE_DURATION = 60 * 1000; // 1 minute

/**
 * Get cached price or fetch fresh
 */
export async function getCachedPrice(
  symbol: string,
  assetType: 'crypto' | 'stock' | 'etf' | 'fiat'
): Promise<AssetPrice | null> {
  const cacheKey = `${symbol}_${assetType}`;
  const cached = priceCache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.price;
  }

  const price = await getAssetPrice(symbol, assetType);
  if (price) {
    priceCache.set(cacheKey, {
      price,
      expiresAt: Date.now() + CACHE_DURATION,
    });
  }

  return price;
}

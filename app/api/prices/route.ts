/**
 * Prices API
 * Fetch current prices for assets
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { getAssetPrice, getBatchPrices, getCachedPrice } from '@/lib/prices/priceService';

/**
 * GET /api/prices?symbol=BTC&type=crypto
 * or
 * GET /api/prices?symbols=BTC,ETH,AAPL
 */
export async function GET(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const type = searchParams.get('type') as 'crypto' | 'stock' | 'etf' | 'fiat';
    const symbolsParam = searchParams.get('symbols');

    // Batch request
    if (symbolsParam) {
      const symbols = symbolsParam.split(',').map(s => s.trim());
      const assetsParam = searchParams.get('types')?.split(',') || [];

      const assets = symbols.map((sym, idx) => ({
        symbol: sym,
        assetType: (assetsParam[idx] || 'crypto') as 'crypto' | 'stock' | 'etf' | 'fiat',
      }));

      const pricesMap = await getBatchPrices(assets);
      const prices: Record<string, any> = {};

      pricesMap.forEach((price, sym) => {
        prices[sym] = price;
      });

      return NextResponse.json({ prices });
    }

    // Single request
    if (!symbol || !type) {
      return NextResponse.json(
        { error: 'Symbol and type required' },
        { status: 400 }
      );
    }

    const price = await getCachedPrice(symbol, type);

    if (!price) {
      return NextResponse.json(
        { error: 'Price not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ price });
  } catch (error: any) {
    console.error('Prices API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prices' },
      { status: 500 }
    );
  }
}

/**
 * Portfolio Summary API
 * Returns portfolio summary with real-time prices and CGT calculations
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { PrismaClient } from '@prisma/client';
import { getBatchPrices } from '@/lib/prices/priceService';
import { calculatePortfolioHoldings, calculateCGT } from '@/lib/taxEngine/investmentCGT';

const prisma = new PrismaClient();

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

    // Get year from query params
    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());

    // Fetch all transactions for user
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Convert to Investment format for CGT calculation
    const investments = transactions.map(tx => ({
      type: tx.type === 'buy' ? 'acquisition' as const : 'disposal' as const,
      date: tx.date,
      symbol: tx.symbol,
      assetType: tx.assetType,
      quantity: tx.quantity,
      pricePerUnit: tx.price,
      totalCost: tx.totalCost,
      fees: tx.fee,
    }));

    // Get unique assets
    const uniqueAssets = Array.from(
      new Set(transactions.map(tx => tx.symbol))
    ).map(symbol => {
      const tx = transactions.find(t => t.symbol === symbol);
      return {
        symbol,
        assetType: tx?.assetType || 'crypto',
      };
    });

    // Fetch current prices for all assets
    const pricesMap = await getBatchPrices(
      uniqueAssets.map(a => ({
        symbol: a.symbol,
        assetType: a.assetType as 'crypto' | 'stock' | 'etf' | 'fiat',
      }))
    );

    // Calculate current holdings with real-time prices
    const currentPrices = new Map<string, number>();
    pricesMap.forEach((price, symbol) => {
      currentPrices.set(symbol, price.price);
    });

    const holdings = calculatePortfolioHoldings(investments, currentPrices);

    // Calculate CGT for the selected year
    const cgtResult = calculateCGT(investments, year);

    // Calculate summary metrics
    const totalValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
    const totalCost = holdings.reduce((sum, h) => sum + h.costBasis, 0);
    const totalGain = totalValue - totalCost;
    const totalGainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

    const summary = {
      totalValue,
      totalCost,
      totalGain,
      totalGainPercent,
      realizedGains: cgtResult.totalGains,
      unrealizedGains: totalGain,
      cgtDue: cgtResult.taxDue,
    };

    // Format holdings for response
    const formattedHoldings = holdings.map(h => ({
      symbol: h.symbol,
      name: h.symbol,
      type: uniqueAssets.find(a => a.symbol === h.symbol)?.assetType || 'crypto',
      quantity: h.quantity,
      avgCost: h.costBasis / h.quantity,
      currentPrice: h.currentPrice,
      value: h.currentValue,
      gain: h.unrealizedGain,
      gainPercent: (h.unrealizedGain / h.costBasis) * 100,
    }));

    return NextResponse.json({
      summary,
      holdings: formattedHoldings,
      year,
    });
  } catch (error: any) {
    console.error('Portfolio summary error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate portfolio summary' },
      { status: 500 }
    );
  }
}

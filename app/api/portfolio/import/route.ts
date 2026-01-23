import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { parseExchangeCSV } from '@/lib/csvParsers/exchangeParsers';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user has Professional subscription (required for CSV imports)
    const tier = session.user.subscriptionTier;
    if (tier !== 'PROFESSIONAL' || session.user.subscriptionStatus !== 'active') {
      return NextResponse.json(
        { error: 'Professional subscription required for CSV imports' },
        { status: 403 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const exchange = formData.get('exchange') as string;

    if (!file || !exchange) {
      return NextResponse.json(
        { error: 'File and exchange selection required' },
        { status: 400 }
      );
    }

    // Read CSV content
    const csvContent = await file.text();

    // Parse transactions
    let transactions;
    try {
      transactions = parseExchangeCSV(csvContent, exchange);
    } catch (error: any) {
      return NextResponse.json(
        { error: `Failed to parse CSV: ${error.message}` },
        { status: 400 }
      );
    }

    if (transactions.length === 0) {
      return NextResponse.json(
        { error: 'No transactions found in CSV file' },
        { status: 400 }
      );
    }

    // Store transactions in database
    // For now, we'll save them as a JSON blob in SavedCalculation
    // In production, you'd want a dedicated Transaction table
    const saved = await prisma.savedCalculation.create({
      data: {
        userId: session.user.id,
        name: `${exchange} Import - ${new Date().toLocaleDateString()}`,
        type: 'INVESTMENT_IMPORT',
        data: JSON.stringify({
          exchange,
          importDate: new Date().toISOString(),
          transactions,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      transactionsImported: transactions.length,
      importId: saved.id,
    });
  } catch (error: any) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: 'Failed to import transactions' },
      { status: 500 }
    );
  }
}

/**
 * Sync API Endpoint
 * Triggers transaction sync for exchange connections
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { syncTransactions, syncAllUserConnections } from '@/lib/integrations/syncService';

/**
 * Trigger sync for a specific connection or all connections
 */
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

    // Parse request body
    const body = await request.json();
    const { connectionId, type = 'incremental_sync', fromDate, toDate, syncAll } = body;

    // Sync all connections
    if (syncAll) {
      const results = await syncAllUserConnections(session.user.id);
      const successCount = results.filter(r => r.success).length;
      const totalTransactions = results.reduce((sum, r) => sum + r.transactionsNew, 0);

      return NextResponse.json({
        success: true,
        message: `Synced ${successCount} connections`,
        totalTransactions,
        results,
      });
    }

    // Sync specific connection
    if (!connectionId) {
      return NextResponse.json(
        { error: 'Connection ID required' },
        { status: 400 }
      );
    }

    const result = await syncTransactions({
      userId: session.user.id,
      exchangeConnectionId: connectionId,
      type,
      fromDate: fromDate ? new Date(fromDate) : undefined,
      toDate: toDate ? new Date(toDate) : undefined,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Sync failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      transactionsFound: result.transactionsFound,
      transactionsNew: result.transactionsNew,
      transactionsUpdated: result.transactionsUpdated,
    });
  } catch (error: any) {
    console.error('Sync API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sync transactions' },
      { status: 500 }
    );
  }
}

/**
 * Get sync status for connections
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

    // Get connection ID from query (optional)
    const { searchParams } = new URL(request.url);
    const connectionId = searchParams.get('connectionId');

    // Import Prisma
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    if (connectionId) {
      // Get sync jobs for specific connection
      const syncJobs = await prisma.syncJob.findMany({
        where: {
          userId: session.user.id,
          exchangeConnectionId: connectionId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      });

      return NextResponse.json({ syncJobs });
    } else {
      // Get recent sync jobs for all connections
      const syncJobs = await prisma.syncJob.findMany({
        where: {
          userId: session.user.id,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 20,
        include: {
          exchangeConnection: {
            select: {
              exchangeName: true,
              accountName: true,
            },
          },
        },
      });

      return NextResponse.json({ syncJobs });
    }
  } catch (error: any) {
    console.error('Error fetching sync status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sync status' },
      { status: 500 }
    );
  }
}

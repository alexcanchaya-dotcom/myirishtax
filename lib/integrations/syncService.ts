/**
 * Sync Service - Orchestrates transaction syncing from exchanges
 */

import { PrismaClient } from '@prisma/client';
import { getAdapter } from './adapters';
import { decrypt } from './encryption';
import { ExchangeCredentials, ExchangeTransaction, SyncResult } from './types';

const prisma = new PrismaClient();

export interface SyncOptions {
  userId: string;
  exchangeConnectionId: string;
  type?: 'full_sync' | 'incremental_sync';
  fromDate?: Date;
  toDate?: Date;
}

/**
 * Sync transactions from an exchange
 */
export async function syncTransactions(options: SyncOptions): Promise<SyncResult> {
  const { userId, exchangeConnectionId, type = 'incremental_sync' } = options;

  // Create sync job
  const syncJob = await prisma.syncJob.create({
    data: {
      userId,
      exchangeConnectionId,
      status: 'running',
      type,
      startedAt: new Date(),
      syncFromDate: options.fromDate,
      syncToDate: options.toDate,
    },
  });

  try {
    // Get exchange connection
    const connection = await prisma.exchangeConnection.findUnique({
      where: { id: exchangeConnectionId },
    });

    if (!connection) {
      throw new Error('Exchange connection not found');
    }

    if (connection.userId !== userId) {
      throw new Error('Unauthorized access to exchange connection');
    }

    // Get adapter
    const adapter = getAdapter(connection.exchangeId);

    // Decrypt credentials
    const credentials = decryptCredentials(connection);

    // Test connection first
    const isConnected = await adapter.testConnection(credentials);
    if (!isConnected) {
      throw new Error('Failed to connect to exchange. Please reconnect your account.');
    }

    // Determine date range
    const toDate = options.toDate || new Date();
    let fromDate = options.fromDate;

    if (!fromDate) {
      if (type === 'incremental_sync' && connection.lastSyncAt) {
        // For incremental sync, start from last sync
        fromDate = connection.lastSyncAt;
      } else {
        // For full sync, go back 1 year
        fromDate = new Date();
        fromDate.setFullYear(fromDate.getFullYear() - 1);
      }
    }

    // Fetch transactions
    console.log(`Fetching transactions for ${connection.exchangeName} from ${fromDate} to ${toDate}`);
    const transactions = await adapter.fetchTransactions(credentials, fromDate, toDate);

    console.log(`Found ${transactions.length} transactions`);

    // Store transactions in database
    const result = await storeTransactions(userId, exchangeConnectionId, transactions);

    // Update sync job
    await prisma.syncJob.update({
      where: { id: syncJob.id },
      data: {
        status: 'completed',
        completedAt: new Date(),
        transactionsFound: transactions.length,
        transactionsNew: result.new,
        transactionsUpdated: result.updated,
        transactionsSkipped: result.skipped,
      },
    });

    // Update exchange connection
    await prisma.exchangeConnection.update({
      where: { id: exchangeConnectionId },
      data: {
        lastSyncAt: new Date(),
        lastSyncStatus: 'success',
      },
    });

    return {
      success: true,
      transactionsFound: transactions.length,
      transactionsNew: result.new,
      transactionsUpdated: result.updated,
      fromDate,
      toDate,
    };
  } catch (error: any) {
    console.error('Sync error:', error);

    // Update sync job with error
    await prisma.syncJob.update({
      where: { id: syncJob.id },
      data: {
        status: 'failed',
        completedAt: new Date(),
        error: error.message,
        retryCount: syncJob.retryCount + 1,
      },
    });

    // Update exchange connection
    await prisma.exchangeConnection.update({
      where: { id: exchangeConnectionId },
      data: {
        lastSyncStatus: 'error',
      },
    });

    return {
      success: false,
      transactionsFound: 0,
      transactionsNew: 0,
      transactionsUpdated: 0,
      error: error.message,
    };
  }
}

/**
 * Store transactions in database with deduplication
 */
async function storeTransactions(
  userId: string,
  exchangeConnectionId: string,
  transactions: ExchangeTransaction[]
): Promise<{ new: number; updated: number; skipped: number }> {
  let newCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;

  for (const tx of transactions) {
    try {
      // Check if transaction already exists
      const existing = await prisma.transaction.findFirst({
        where: {
          userId,
          exchangeTxId: tx.exchangeTxId,
        },
      });

      if (existing) {
        // Update if different
        const hasChanges =
          existing.quantity !== tx.quantity ||
          existing.price !== tx.price ||
          existing.fee !== tx.fee;

        if (hasChanges) {
          await prisma.transaction.update({
            where: { id: existing.id },
            data: {
              type: tx.type,
              date: tx.date,
              symbol: tx.symbol,
              assetName: tx.assetName,
              assetType: tx.assetType,
              quantity: tx.quantity,
              price: tx.price,
              fee: tx.fee,
              totalCost: tx.totalCost,
              toSymbol: tx.toSymbol,
              toQuantity: tx.toQuantity,
              toPrice: tx.toPrice,
              walletAddress: tx.walletAddress,
              notes: tx.notes,
            },
          });
          updatedCount++;
        } else {
          skippedCount++;
        }
      } else {
        // Create new transaction
        await prisma.transaction.create({
          data: {
            userId,
            exchangeConnectionId,
            type: tx.type,
            date: tx.date,
            symbol: tx.symbol,
            assetName: tx.assetName,
            assetType: tx.assetType,
            quantity: tx.quantity,
            price: tx.price,
            fee: tx.fee,
            totalCost: tx.totalCost,
            toSymbol: tx.toSymbol,
            toQuantity: tx.toQuantity,
            toPrice: tx.toPrice,
            exchangeTxId: tx.exchangeTxId,
            walletAddress: tx.walletAddress,
            notes: tx.notes,
            isManual: false,
          },
        });
        newCount++;
      }
    } catch (error) {
      console.error(`Error storing transaction ${tx.exchangeTxId}:`, error);
      // Continue with other transactions
    }
  }

  return { new: newCount, updated: updatedCount, skipped: skippedCount };
}

/**
 * Decrypt exchange credentials from database
 */
function decryptCredentials(connection: any): ExchangeCredentials {
  const credentials: ExchangeCredentials = {
    type: connection.connectionType as 'oauth' | 'api_key',
  };

  if (connection.accessToken) {
    credentials.accessToken = decrypt(connection.accessToken);
  }

  if (connection.refreshToken) {
    credentials.refreshToken = decrypt(connection.refreshToken);
  }

  if (connection.tokenExpiresAt) {
    credentials.tokenExpiresAt = connection.tokenExpiresAt;
  }

  if (connection.apiKey) {
    credentials.apiKey = decrypt(connection.apiKey);
  }

  if (connection.apiSecret) {
    credentials.apiSecret = decrypt(connection.apiSecret);
  }

  if (connection.apiPassphrase) {
    credentials.apiPassphrase = decrypt(connection.apiPassphrase);
  }

  return credentials;
}

/**
 * Sync all active connections for a user
 */
export async function syncAllUserConnections(userId: string): Promise<SyncResult[]> {
  const connections = await prisma.exchangeConnection.findMany({
    where: {
      userId,
      status: 'active',
      autoSync: true,
    },
  });

  const results: SyncResult[] = [];

  for (const connection of connections) {
    const result = await syncTransactions({
      userId,
      exchangeConnectionId: connection.id,
      type: 'incremental_sync',
    });
    results.push(result);
  }

  return results;
}

/**
 * Retry failed sync jobs
 */
export async function retryFailedSyncs(): Promise<void> {
  const failedJobs = await prisma.syncJob.findMany({
    where: {
      status: 'failed',
      retryCount: {
        lt: 3,
      },
    },
    include: {
      exchangeConnection: true,
    },
  });

  for (const job of failedJobs) {
    await syncTransactions({
      userId: job.userId,
      exchangeConnectionId: job.exchangeConnectionId,
      type: job.type as 'full_sync' | 'incremental_sync',
      fromDate: job.syncFromDate || undefined,
      toDate: job.syncToDate || undefined,
    });
  }
}

/**
 * API Key Connection Endpoint
 * For exchanges that use API keys instead of OAuth
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { getAdapter } from '@/lib/integrations/adapters';
import { encrypt } from '@/lib/integrations/encryption';
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

    // Check subscription tier (API connections require Professional)
    if (session.user.subscriptionTier !== 'PROFESSIONAL' || session.user.subscriptionStatus !== 'active') {
      return NextResponse.json(
        { error: 'Professional subscription required for API connections' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { exchangeId, apiKey, apiSecret, apiPassphrase, accountName } = body;

    if (!exchangeId || !apiKey || !apiSecret) {
      return NextResponse.json(
        { error: 'Exchange ID, API key, and API secret required' },
        { status: 400 }
      );
    }

    // Get adapter
    let adapter;
    try {
      adapter = getAdapter(exchangeId);
    } catch (error) {
      return NextResponse.json(
        { error: 'Unsupported exchange' },
        { status: 400 }
      );
    }

    // Check if exchange supports API keys
    if (!adapter.metadata.supportsApiKey) {
      return NextResponse.json(
        { error: 'Exchange does not support API key authentication' },
        { status: 400 }
      );
    }

    // Test connection with provided credentials
    const credentials = {
      type: 'api_key' as const,
      apiKey,
      apiSecret,
      apiPassphrase,
    };

    const isConnected = await adapter.testConnection(credentials);
    if (!isConnected) {
      return NextResponse.json(
        { error: 'Connection test failed. Please check your API credentials.' },
        { status: 400 }
      );
    }

    // Encrypt credentials
    const encryptedApiKey = encrypt(apiKey);
    const encryptedApiSecret = encrypt(apiSecret);
    const encryptedApiPassphrase = apiPassphrase ? encrypt(apiPassphrase) : null;

    // Check if connection already exists
    const existingConnection = await prisma.exchangeConnection.findFirst({
      where: {
        userId: session.user.id,
        exchangeId,
      },
    });

    let connection;

    if (existingConnection) {
      // Update existing connection
      connection = await prisma.exchangeConnection.update({
        where: { id: existingConnection.id },
        data: {
          apiKey: encryptedApiKey,
          apiSecret: encryptedApiSecret,
          apiPassphrase: encryptedApiPassphrase,
          accountName: accountName || null,
          connectionType: 'api_key',
          status: 'active',
        },
      });
    } else {
      // Create new connection
      connection = await prisma.exchangeConnection.create({
        data: {
          userId: session.user.id,
          exchangeId,
          exchangeName: adapter.metadata.name,
          accountName: accountName || null,
          apiKey: encryptedApiKey,
          apiSecret: encryptedApiSecret,
          apiPassphrase: encryptedApiPassphrase,
          connectionType: 'api_key',
          status: 'active',
        },
      });
    }

    return NextResponse.json({
      success: true,
      connectionId: connection.id,
      exchangeName: adapter.metadata.name,
    });
  } catch (error: any) {
    console.error('API key connection error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to connect exchange' },
      { status: 500 }
    );
  }
}

/**
 * Get all connections for current user
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

    // Fetch all connections
    const connections = await prisma.exchangeConnection.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        exchangeId: true,
        exchangeName: true,
        accountName: true,
        connectionType: true,
        status: true,
        autoSync: true,
        lastSyncAt: true,
        lastSyncStatus: true,
        syncFrequency: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ connections });
  } catch (error: any) {
    console.error('Error fetching connections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch connections' },
      { status: 500 }
    );
  }
}

/**
 * Delete a connection
 */
export async function DELETE(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get connection ID from query
    const { searchParams } = new URL(request.url);
    const connectionId = searchParams.get('id');

    if (!connectionId) {
      return NextResponse.json(
        { error: 'Connection ID required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const connection = await prisma.exchangeConnection.findUnique({
      where: { id: connectionId },
    });

    if (!connection) {
      return NextResponse.json(
        { error: 'Connection not found' },
        { status: 404 }
      );
    }

    if (connection.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Delete connection
    await prisma.exchangeConnection.delete({
      where: { id: connectionId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting connection:', error);
    return NextResponse.json(
      { error: 'Failed to delete connection' },
      { status: 500 }
    );
  }
}

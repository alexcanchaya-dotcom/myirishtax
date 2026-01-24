/**
 * OAuth Callback Endpoint
 * Handles OAuth redirect from exchange after user authorization
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { getAdapter } from '@/lib/integrations/adapters';
import { encrypt } from '@/lib/integrations/encryption';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/auth/login?error=unauthorized`);
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const exchangeId = searchParams.get('exchange') || 'coinbase'; // Should be embedded in state
    const error = searchParams.get('error');

    // Handle OAuth errors
    if (error) {
      console.error('OAuth error:', error);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/portfolio/connections?error=${encodeURIComponent(error)}`
      );
    }

    if (!code) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/portfolio/connections?error=no_code`
      );
    }

    // TODO: Verify state token for CSRF protection
    // In production, retrieve the stored state and compare

    // Get adapter
    const adapter = getAdapter(exchangeId);

    if (!adapter.exchangeCodeForToken) {
      throw new Error('Exchange does not support OAuth');
    }

    // Exchange code for token
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/oauth/callback`;
    const credentials = await adapter.exchangeCodeForToken(code, redirectUri);

    // Test connection
    const isConnected = await adapter.testConnection(credentials);
    if (!isConnected) {
      throw new Error('Connection test failed');
    }

    // Encrypt sensitive credentials
    const encryptedData: any = {
      connectionType: 'oauth',
    };

    if (credentials.accessToken) {
      encryptedData.accessToken = encrypt(credentials.accessToken);
    }

    if (credentials.refreshToken) {
      encryptedData.refreshToken = encrypt(credentials.refreshToken);
    }

    if (credentials.tokenExpiresAt) {
      encryptedData.tokenExpiresAt = credentials.tokenExpiresAt;
    }

    // Check if connection already exists
    const existingConnection = await prisma.exchangeConnection.findFirst({
      where: {
        userId: session.user.id,
        exchangeId,
      },
    });

    if (existingConnection) {
      // Update existing connection
      await prisma.exchangeConnection.update({
        where: { id: existingConnection.id },
        data: {
          ...encryptedData,
          status: 'active',
        },
      });
    } else {
      // Create new connection
      await prisma.exchangeConnection.create({
        data: {
          userId: session.user.id,
          exchangeId,
          exchangeName: adapter.metadata.name,
          ...encryptedData,
          status: 'active',
        },
      });
    }

    // Redirect to connections page with success message
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/portfolio/connections?success=connected`
    );
  } catch (error: any) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/portfolio/connections?error=${encodeURIComponent(error.message)}`
    );
  }
}

/**
 * OAuth Authorization Endpoint
 * Initiates OAuth flow for exchange connections
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { getAdapter } from '@/lib/integrations/adapters';
import { generateState } from '@/lib/integrations/encryption';

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

    // Get exchange from query params
    const { searchParams } = new URL(request.url);
    const exchangeId = searchParams.get('exchange');

    if (!exchangeId) {
      return NextResponse.json(
        { error: 'Exchange ID required' },
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

    // Check if exchange supports OAuth
    if (!adapter.metadata.supportsOAuth || !adapter.getAuthUrl) {
      return NextResponse.json(
        { error: 'Exchange does not support OAuth' },
        { status: 400 }
      );
    }

    // Generate CSRF state token
    const state = generateState();

    // Store state in session or temporary storage
    // In production, you'd want to store this in Redis or database
    // For now, we'll pass it through and verify on callback

    // Build redirect URI
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/oauth/callback`;

    // Get authorization URL
    const authUrl = adapter.getAuthUrl(redirectUri, state);

    // Return the URL or redirect directly
    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    console.error('OAuth authorization error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate OAuth flow' },
      { status: 500 }
    );
  }
}

/**
 * MFA Verification API Route
 * POST - Verify MFA code for sensitive operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../[...nextauth]/options';
import { forwardAuthenticatedRequest } from '@/lib/auth/server-auth';
import { logger } from '@/lib/logger';

const BACKEND_URL = process.env.REPLAY_API_URL || 'http://localhost:8080';

/**
 * POST /api/auth/mfa/verify
 * Verify an MFA code
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { code, action } = body;

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'MFA code is required' },
        { status: 400 }
      );
    }

    // Forward to backend to verify MFA code
    const response = await forwardAuthenticatedRequest(
      `${BACKEND_URL}/auth/mfa/verify`,
      {
        method: 'POST',
        body: JSON.stringify({ code, action }),
      },
      session
    );

    const data = await response.json();

    if (!response.ok) {
      logger.error('[API /api/auth/mfa/verify] Verification failed', { status: response.status, error: data });
      return NextResponse.json(
        { success: false, error: data.error || data.message || 'Invalid MFA code' },
        { status: response.status }
      );
    }

    logger.info('[API /api/auth/mfa/verify] MFA verified', { action });

    return NextResponse.json({
      success: true,
      verified: true,
      token: data.token, // Short-lived token for the verified action
      expiresAt: data.expires_at,
    });
  } catch (error) {
    logger.error('[API /api/auth/mfa/verify] Error verifying MFA', error);
    return NextResponse.json(
      { success: false, error: (error instanceof Error ? error.message : 'Failed to verify MFA') },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/auth/mfa/verify
 * Request a new MFA code to be sent (for email-based MFA)
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action } = body;

    // Forward to backend to send MFA code
    const response = await forwardAuthenticatedRequest(
      `${BACKEND_URL}/auth/mfa/send`,
      {
        method: 'POST',
        body: JSON.stringify({ action }),
      },
      session
    );

    const data = await response.json();

    if (!response.ok) {
      logger.error('[API /api/auth/mfa/verify] Send code failed', { status: response.status, error: data });
      return NextResponse.json(
        { success: false, error: data.error || data.message || 'Failed to send MFA code' },
        { status: response.status }
      );
    }

    logger.info('[API /api/auth/mfa/verify] MFA code sent', { action });

    return NextResponse.json({
      success: true,
      message: 'MFA code sent',
      expiresAt: data.expires_at,
    });
  } catch (error) {
    logger.error('[API /api/auth/mfa/verify] Error sending MFA code', error);
    return NextResponse.json(
      { success: false, error: (error instanceof Error ? error.message : 'Failed to send MFA code') },
      { status: 500 }
    );
  }
}

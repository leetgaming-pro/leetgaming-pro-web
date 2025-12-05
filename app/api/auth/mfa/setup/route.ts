/**
 * MFA Setup API Route
 * POST - Enable MFA for the user
 * DELETE - Disable MFA for the user
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../[...nextauth]/options';
import { forwardAuthenticatedRequest } from '@/lib/auth/server-auth';
import { logger } from '@/lib/logger';

const BACKEND_URL = process.env.REPLAY_API_URL || 'http://localhost:8080';

/**
 * POST /api/auth/mfa/setup
 * Enable MFA and get backup codes
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
    const { method = 'email' } = body; // 'email' or 'totp'

    // Forward to backend to enable MFA
    const response = await forwardAuthenticatedRequest(
      `${BACKEND_URL}/auth/mfa/enable`,
      {
        method: 'POST',
        body: JSON.stringify({ method }),
      },
      session
    );

    const data = await response.json();

    if (!response.ok) {
      logger.error('[API /api/auth/mfa/setup] Backend error', { status: response.status, error: data });
      return NextResponse.json(
        { success: false, error: data.error || data.message || 'Failed to enable MFA' },
        { status: response.status }
      );
    }

    logger.info('[API /api/auth/mfa/setup] MFA enabled', { method });

    return NextResponse.json({
      success: true,
      message: 'MFA enabled successfully',
      backupCodes: data.backup_codes,
      totpSecret: data.totp_secret, // Only if method is 'totp'
      totpQrCode: data.totp_qr_code, // Only if method is 'totp'
    });
  } catch (error) {
    logger.error('[API /api/auth/mfa/setup] Error enabling MFA', error);
    return NextResponse.json(
      { success: false, error: (error instanceof Error ? error.message : 'Failed to enable MFA') },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/auth/mfa/setup
 * Disable MFA (requires verification)
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { code } = body; // Verification code required to disable

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Verification code required to disable MFA' },
        { status: 400 }
      );
    }

    // Forward to backend to disable MFA
    const response = await forwardAuthenticatedRequest(
      `${BACKEND_URL}/auth/mfa/disable`,
      {
        method: 'POST',
        body: JSON.stringify({ code }),
      },
      session
    );

    const data = await response.json();

    if (!response.ok) {
      logger.error('[API /api/auth/mfa/setup] Backend error', { status: response.status, error: data });
      return NextResponse.json(
        { success: false, error: data.error || data.message || 'Failed to disable MFA' },
        { status: response.status }
      );
    }

    logger.info('[API /api/auth/mfa/setup] MFA disabled');

    return NextResponse.json({
      success: true,
      message: 'MFA disabled successfully',
    });
  } catch (error) {
    logger.error('[API /api/auth/mfa/setup] Error disabling MFA', error);
    return NextResponse.json(
      { success: false, error: (error instanceof Error ? error.message : 'Failed to disable MFA') },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/mfa/setup
 * Get MFA status for current user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Forward to backend to get MFA status
    const response = await forwardAuthenticatedRequest(
      `${BACKEND_URL}/auth/mfa/status`,
      { method: 'GET' },
      session
    );

    const data = await response.json();

    if (!response.ok) {
      logger.error('[API /api/auth/mfa/setup] Backend error', { status: response.status, error: data });
      return NextResponse.json(
        { success: false, error: data.error || data.message || 'Failed to get MFA status' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      enabled: data.enabled,
      method: data.method,
      backupCodesRemaining: data.backup_codes_remaining,
    });
  } catch (error) {
    logger.error('[API /api/auth/mfa/setup] Error getting MFA status', error);
    return NextResponse.json(
      { success: false, error: (error instanceof Error ? error.message : 'Failed to get MFA status') },
      { status: 500 }
    );
  }
}

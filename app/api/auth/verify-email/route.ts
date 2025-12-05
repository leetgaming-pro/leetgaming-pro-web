/**
 * Email Verification API Routes
 * POST - Send verification code
 * PUT - Verify code
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../[...nextauth]/options';
import { forwardAuthenticatedRequest } from '@/lib/auth/server-auth';
import { logger } from '@/lib/logger';

const BACKEND_URL = process.env.REPLAY_API_URL || 'http://localhost:8080';

/**
 * POST /api/auth/verify-email
 * Request a new verification code to be sent
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
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Forward to backend to send verification email
    const response = await forwardAuthenticatedRequest(
      `${BACKEND_URL}/auth/verify-email/send`,
      {
        method: 'POST',
        body: JSON.stringify({ email }),
      },
      session
    );

    const data = await response.json();

    if (!response.ok) {
      logger.error('[API /api/auth/verify-email] Backend error', { status: response.status, error: data });
      return NextResponse.json(
        { success: false, error: data.error || data.message || 'Failed to send verification email' },
        { status: response.status }
      );
    }

    logger.info('[API /api/auth/verify-email] Verification email sent', { email });

    return NextResponse.json({
      success: true,
      message: 'Verification email sent',
      expiresAt: data.expires_at,
    });
  } catch (error) {
    logger.error('[API /api/auth/verify-email] Error sending verification email', error);
    return NextResponse.json(
      { success: false, error: (error instanceof Error ? error.message : 'Failed to send verification email') },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/auth/verify-email
 * Verify the email with the provided code
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
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json(
        { success: false, error: 'Email and verification code are required' },
        { status: 400 }
      );
    }

    // Forward to backend to verify email
    const response = await forwardAuthenticatedRequest(
      `${BACKEND_URL}/auth/verify-email/confirm`,
      {
        method: 'POST',
        body: JSON.stringify({ email, code }),
      },
      session
    );

    const data = await response.json();

    if (!response.ok) {
      logger.error('[API /api/auth/verify-email] Verification failed', { status: response.status, error: data });
      return NextResponse.json(
        { success: false, error: data.error || data.message || 'Invalid or expired verification code' },
        { status: response.status }
      );
    }

    logger.info('[API /api/auth/verify-email] Email verified successfully', { email });

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
      verified: true,
    });
  } catch (error) {
    logger.error('[API /api/auth/verify-email] Error verifying email', error);
    return NextResponse.json(
      { success: false, error: (error instanceof Error ? error.message : 'Failed to verify email') },
      { status: 500 }
    );
  }
}

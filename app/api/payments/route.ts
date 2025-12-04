/**
 * Payments API Routes
 * POST - Create a payment intent
 * GET - Get user's payments
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { logger } from '@/lib/logger';
import { ReplayApiSettingsMock } from '@/types/replay-api/settings';
import { getAuthHeadersFromCookies } from '@/lib/auth/server-auth';

export const dynamic = 'force-dynamic';

/**
 * POST /api/payments - Create a payment intent
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required',
      }, { status: 401 });
    }

    const body = await request.json();
    const authHeaders = getAuthHeadersFromCookies();

    // Validate required fields
    if (!body.amount || body.amount <= 0) {
      return NextResponse.json({
        success: false,
        error: 'Amount must be positive',
      }, { status: 400 });
    }

    if (!body.wallet_id) {
      return NextResponse.json({
        success: false,
        error: 'wallet_id is required',
      }, { status: 400 });
    }

    // Forward request to replay-api backend with auth headers
    const response = await fetch(`${ReplayApiSettingsMock.baseUrl}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
      },
      body: JSON.stringify({
        wallet_id: body.wallet_id,
        amount: body.amount,
        currency: body.currency || 'usd',
        payment_type: body.payment_type || 'deposit',
        provider: body.provider || 'stripe',
        metadata: body.metadata,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to create payment intent' }));
      logger.error('[API /api/payments] Backend error', { status: response.status, error });
      return NextResponse.json({
        success: false,
        error: error.message || error.error || 'Failed to create payment intent',
      }, { status: response.status });
    }

    const data = await response.json();
    logger.info('[API /api/payments] Payment intent created', { payment_id: data.payment_id });

    return NextResponse.json({
      success: true,
      data,
    }, { status: 201 });
  } catch (error) {
    logger.error('[API /api/payments] Error creating payment intent', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create payment intent';
    return NextResponse.json({
      success: false,
      error: errorMessage,
    }, { status: 500 });
  }
}

/**
 * GET /api/payments - Get user's payments
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required',
      }, { status: 401 });
    }

    const authHeaders = getAuthHeadersFromCookies();

    // Forward request to replay-api backend with auth headers
    const response = await fetch(`${ReplayApiSettingsMock.baseUrl}/payments`, {
      method: 'GET',
      headers: {
        ...authHeaders,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to get payments' }));
      logger.error('[API /api/payments] Backend error', { status: response.status, error });
      return NextResponse.json({
        success: false,
        error: error.message || error.error || 'Failed to get payments',
      }, { status: response.status });
    }

    const data = await response.json();
    logger.info('[API /api/payments] Retrieved user payments');

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    logger.error('[API /api/payments] Error getting payments', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to get payments';
    return NextResponse.json({
      success: false,
      error: errorMessage,
    }, { status: 500 });
  }
}

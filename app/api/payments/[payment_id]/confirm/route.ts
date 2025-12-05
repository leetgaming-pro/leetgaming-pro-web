/**
 * Confirm Payment API Route
 * POST - Confirm a payment with payment method
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { logger } from '@/lib/logger';
import { ReplayApiSettingsMock } from '@/types/replay-api/settings';
import { getAuthHeadersFromCookies } from '@/lib/auth/server-auth';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { payment_id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required',
      }, { status: 401 });
    }

    const { payment_id } = params;
    const body = await request.json();
    const authHeaders = getAuthHeadersFromCookies();

    // Forward request to replay-api backend with auth headers
    const response = await fetch(`${ReplayApiSettingsMock.baseUrl}/payments/${payment_id}/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
      },
      body: JSON.stringify({
        payment_method_id: body.payment_method_id,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to confirm payment' }));
      logger.error('[API /api/payments/:payment_id/confirm] Backend error', { status: response.status, error, payment_id });
      return NextResponse.json({
        success: false,
        error: error.message || error.error || 'Failed to confirm payment',
      }, { status: response.status });
    }

    const data = await response.json();
    logger.info('[API /api/payments/:payment_id/confirm] Payment confirmed', { payment_id });

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    logger.error(`[API /api/payments/${params.payment_id}/confirm] Error confirming payment`, error);
    return NextResponse.json({
      success: false,
      error: (error instanceof Error ? error.message : 'Failed to confirm payment'),
    }, { status: 500 });
  }
}

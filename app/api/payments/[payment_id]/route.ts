/**
 * Payment Details API Route
 * GET - Get a specific payment
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { logger } from '@/lib/logger';
import { ReplayApiSettingsMock } from '@/types/replay-api/settings';
import { getAuthHeadersFromCookies } from '@/lib/auth/server-auth';

export const dynamic = 'force-dynamic';

export async function GET(
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
    const authHeaders = getAuthHeadersFromCookies();

    // Forward request to replay-api backend with auth headers
    const response = await fetch(`${ReplayApiSettingsMock.baseUrl}/payments/${payment_id}`, {
      method: 'GET',
      headers: {
        ...authHeaders,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to get payment' }));
      logger.error('[API /api/payments/:payment_id] Backend error', { status: response.status, error, payment_id });
      return NextResponse.json({
        success: false,
        error: error.message || error.error || 'Failed to get payment',
      }, { status: response.status });
    }

    const data = await response.json();
    logger.info('[API /api/payments/:payment_id] Retrieved payment', { payment_id });

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    logger.error(`[API /api/payments/${params.payment_id}] Error getting payment`, error);
    return NextResponse.json({
      success: false,
      error: (error instanceof Error ? error.message : 'Failed to get payment'),
    }, { status: 500 });
  }
}

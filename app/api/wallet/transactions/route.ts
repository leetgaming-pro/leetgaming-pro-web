/**
 * Wallet Transactions API Route
 * GET - Get user's transaction history
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { logger } from '@/lib/logger';
import { ReplayApiSettingsMock } from '@/types/replay-api/settings';
import { getAuthHeadersFromCookies } from '@/lib/auth/server-auth';
import type { TransactionHistoryResponse } from '@/types/replay-api/wallet.types';

export const dynamic = 'force-dynamic';

/**
 * GET /api/wallet/transactions - Get user's transaction history
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const authHeaders = getAuthHeadersFromCookies();

    // Get query parameters
    const { searchParams } = request.nextUrl;
    const limit = searchParams.get('limit') || '50';
    const offset = searchParams.get('offset') || '0';
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const currency = searchParams.get('currency');

    // Build query string
    const queryParams = new URLSearchParams();
    queryParams.set('limit', limit);
    queryParams.set('offset', offset);
    if (type) queryParams.set('type', type);
    if (status) queryParams.set('status', status);
    if (currency) queryParams.set('currency', currency);

    logger.info('[API /api/wallet/transactions] Fetching transaction history', {
      limit,
      offset,
      type,
      status,
    });

    // Forward request to replay-api backend
    const response = await fetch(
      `${ReplayApiSettingsMock.baseUrl}/wallet/transactions?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to get transactions' }));
      logger.error('[API /api/wallet/transactions] Backend error', {
        status: response.status,
        error: errorData,
      });

      return NextResponse.json(
        {
          success: false,
          error: errorData.message || 'Failed to get transactions',
        },
        { status: response.status }
      );
    }

    const data: TransactionHistoryResponse = await response.json();

    logger.info('[API /api/wallet/transactions] Transactions retrieved', {
      count: data.transactions?.length || 0,
      total: data.total_count,
    });

    return NextResponse.json(data);
  } catch (error) {
    logger.error('[API /api/wallet/transactions] Error getting transactions', error);
    return NextResponse.json(
      {
        success: false,
        error: (error instanceof Error ? error.message : 'Failed to get transactions'),
      },
      { status: 500 }
    );
  }
}

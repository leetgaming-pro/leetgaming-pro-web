/**
 * Wallet Balance API Route
 * GET - Get user's wallet balance
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { logger } from '@/lib/logger';
import { ReplayApiSettingsMock } from '@/types/replay-api/settings';
import { getAuthHeadersFromCookies } from '@/lib/auth/server-auth';
import type { UserWallet } from '@/types/replay-api/wallet.types';

export const dynamic = 'force-dynamic';

/**
 * GET /api/wallet/balance - Get user's wallet balance
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

    logger.info('[API /api/wallet/balance] Fetching wallet balance');

    // Forward request to replay-api backend
    const response = await fetch(`${ReplayApiSettingsMock.baseUrl}/wallet/balance`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to get wallet balance' }));
      logger.error('[API /api/wallet/balance] Backend error', {
        status: response.status,
        error: errorData,
      });

      return NextResponse.json(
        {
          success: false,
          error: errorData.message || 'Failed to get wallet balance',
        },
        { status: response.status }
      );
    }

    const data: UserWallet = await response.json();

    logger.info('[API /api/wallet/balance] Wallet balance retrieved', {
      wallet_id: data.id,
    });

    return NextResponse.json(data);
  } catch (error) {
    logger.error('[API /api/wallet/balance] Error getting wallet balance', error);
    return NextResponse.json(
      {
        success: false,
        error: (error instanceof Error ? error.message : 'Failed to get wallet balance'),
      },
      { status: 500 }
    );
  }
}

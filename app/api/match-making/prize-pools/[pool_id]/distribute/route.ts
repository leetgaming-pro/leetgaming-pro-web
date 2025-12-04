/**
 * Distribute Prize Pool API Route
 * POST - Distribute prizes to winners
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { ReplayAPISDK } from '@/types/replay-api/sdk';
import { ReplayApiSettingsMock } from '@/types/replay-api/settings';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { pool_id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required',
      }, { status: 401 });
    }

    const { pool_id } = params;
    const body = await request.json();

    const sdk = new ReplayAPISDK(ReplayApiSettingsMock, logger);
    const result = await sdk.prizePools.distributePrizePool({
      pool_id,
      ...body,
    });

    if (!result) {
      return NextResponse.json({
        success: false,
        error: 'Failed to distribute prize pool',
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error(`[API /api/matchmaking/prize-pools/${params.pool_id}/distribute] Error distributing prizes`, error);
    return NextResponse.json({
      success: false,
      error: (error instanceof Error ? error.message : 'Failed to distribute prize pool'),
    }, { status: 500 });
  }
}

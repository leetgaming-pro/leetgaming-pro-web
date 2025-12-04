/**
 * Prize Pools API Routes
 * GET - Get prize pool by ID or lobby ID
 */

import { NextRequest, NextResponse } from 'next/server';
import { ReplayAPISDK } from '@/types/replay-api/sdk';
import { ReplayApiSettingsMock } from '@/types/replay-api/settings';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const sdk = new ReplayAPISDK(ReplayApiSettingsMock, logger);
    const result = await sdk.prizePools.getPrizePool({
      pool_id: searchParams.get('pool_id') || undefined,
      lobby_id: searchParams.get('lobby_id') || undefined,
      game_id: searchParams.get('game_id') || undefined,
      region: searchParams.get('region') || undefined,
    });

    if (!result) {
      return NextResponse.json({
        success: false,
        error: 'Prize pool not found',
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: result,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=10',
      },
    });
  } catch (error) {
    logger.error('[API /api/matchmaking/prize-pools] Error fetching prize pool', error);
    return NextResponse.json({
      success: false,
      error: (error instanceof Error ? error.message : 'Failed to fetch prize pool'),
    }, { status: 500 });
  }
}

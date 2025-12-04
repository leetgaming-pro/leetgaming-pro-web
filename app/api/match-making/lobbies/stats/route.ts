/**
 * Lobby Statistics API Route
 * GET - Get lobby statistics for a game/region
 */

import { NextRequest, NextResponse } from 'next/server';
import { ReplayAPISDK } from '@/types/replay-api/sdk';
import { ReplayApiSettingsMock } from '@/types/replay-api/settings';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('game_id') || undefined;
    const region = searchParams.get('region') || undefined;

    const sdk = new ReplayAPISDK(ReplayApiSettingsMock, logger);
    const stats = await sdk.lobbies.getLobbyStats(gameId, region);

    if (!stats) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch lobby statistics',
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: stats,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    logger.error('[API /api/matchmaking/lobbies/stats] Error fetching statistics', error);
    return NextResponse.json({
      success: false,
      error: (error instanceof Error ? error.message : 'Failed to fetch lobby statistics'),
    }, { status: 500 });
  }
}

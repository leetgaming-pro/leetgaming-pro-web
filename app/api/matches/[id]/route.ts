/**
 * Match Detail API Route
 * Get specific match by ID
 */

import { NextRequest, NextResponse } from 'next/server';
import { ReplayAPISDK } from '@/types/replay-api/sdk';
import { ReplayApiSettingsMock } from '@/types/replay-api/settings';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('gameId') || 'cs2';
    
    const sdk = new ReplayAPISDK(ReplayApiSettingsMock, logger);
    
    // Fetch match details
    const match = await sdk.matches.getMatch(gameId, id);
    
    if (!match) {
      return NextResponse.json({
        success: false,
        error: 'Match not found',
      }, {
        status: 404,
      });
    }
    
    return NextResponse.json({
      success: true,
      data: match,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
    
  } catch (error) {
    logger.error('[API /api/matches/[id]] Error fetching match', error);
    
    return NextResponse.json({
      success: false,
      error: (error instanceof Error ? error.message : 'Failed to fetch match'),
    }, {
      status: 500,
    });
  }
}

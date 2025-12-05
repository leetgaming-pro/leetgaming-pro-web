/**
 * Get Matchmaking Pool Stats API Route
 * GET - Get statistics for a matchmaking pool
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { ReplayApiSettingsMock } from '@/types/replay-api/settings';
import { getAuthHeadersFromCookies } from '@/lib/auth/server-auth';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { game_id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const { game_id } = params;
    const game_mode = searchParams.get('game_mode');
    const region = searchParams.get('region');

    const authHeaders = getAuthHeadersFromCookies();

    // Build query string
    const queryParams = new URLSearchParams();
    if (game_mode) queryParams.set('game_mode', game_mode);
    if (region) queryParams.set('region', region);

    // Forward request to replay-api backend with auth headers
    const url = `${ReplayApiSettingsMock.baseUrl}/match-making/pools/${game_id}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...authHeaders,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to get pool stats' }));
      logger.error('[API /api/match-making/pools/:game_id] Backend error', { status: response.status, error, game_id });
      return NextResponse.json({
        success: false,
        error: (error instanceof Error ? error.message : 'Failed to get pool stats'),
      }, { status: response.status });
    }

    const data = await response.json();
    logger.info('[API /api/match-making/pools/:game_id] Retrieved pool stats', { game_id, game_mode, region });

    return NextResponse.json({
      success: true,
      data,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=10',
      },
    });
  } catch (error) {
    logger.error(`[API /api/match-making/pools/${params.game_id}] Error getting pool stats`, error);
    return NextResponse.json({
      success: false,
      error: (error instanceof Error ? error.message : 'Failed to get pool stats'),
    }, { status: 500 });
  }
}

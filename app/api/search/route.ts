/**
 * Global Search API Route
 * GET /api/search - Search across all entities
 */

import { NextRequest, NextResponse } from 'next/server';
import { ReplayAPISDK } from '@/types/replay-api/sdk';
import { ReplayApiSettingsMock } from '@/types/replay-api/settings';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * GET /api/search
 * Global search across players, teams, replays, tournaments
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category') || undefined;
    const limit = parseInt(searchParams.get('limit') || '5', 10);

    if (query.length < 2) {
      return NextResponse.json({
        success: true,
        data: { groups: [], total: 0 },
      });
    }

    const sdk = new ReplayAPISDK(ReplayApiSettingsMock, logger);
    const result = await sdk.search.search(query, { category, limit });

    return NextResponse.json({
      success: true,
      data: {
        groups: result.groups || [],
        total: result.total || 0,
      },
    });
  } catch (error) {
    logger.error('[API] Search error:', error);
    // Return empty results on error
    return NextResponse.json({
      success: true,
      data: { groups: [], total: 0 },
    });
  }
}

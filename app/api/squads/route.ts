/**
 * Squads API Routes
 * GET - Search/list squads
 * POST - Create a new squad
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { ReplayAPISDK } from '@/types/replay-api/sdk';
import { ReplayApiSettingsMock } from '@/types/replay-api/settings';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const sdk = new ReplayAPISDK(ReplayApiSettingsMock, logger);
    const squads = await sdk.squads.searchSquads({
      game_id: searchParams.get('game_id') || 'cs2',
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
    });

    return NextResponse.json({
      success: true,
      data: squads || [],
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    logger.error('[API /api/squads] Error searching squads', error);
    return NextResponse.json({
      success: false,
      error: (error instanceof Error ? error.message : 'Failed to search squads'),
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required',
      }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.name || body.name.trim() === '') {
      return NextResponse.json({
        success: false,
        error: 'Squad name is required',
      }, { status: 400 });
    }

    const sdk = new ReplayAPISDK(ReplayApiSettingsMock, logger);
    const squad = await sdk.squads.createSquad({
      game_id: body.game_id || 'cs2',
      name: body.name,
      description: body.description || '',
      visibility_type: body.visibility_type || 'public',
    });

    if (!squad) {
      return NextResponse.json({
        success: false,
        error: 'Failed to create squad',
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: squad,
    }, { status: 201 });
  } catch (error) {
    logger.error('[API /api/squads] Error creating squad', error);
    return NextResponse.json({
      success: false,
      error: (error instanceof Error ? error.message : 'Failed to create squad'),
    }, { status: 500 });
  }
}

/**
 * Squads API Routes
 * GET - Search/list squads (public)
 * POST - Create a new squad (authenticated)
 * 
 * Properly forwards auth context to backend SDK
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ReplayAPISDK } from '@/types/replay-api/sdk';
import { ReplayApiSettingsMock } from '@/types/replay-api/settings';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * Cookie names for RID token authentication
 */
const RID_TOKEN_COOKIE = 'rid_token';
const RID_METADATA_COOKIE = 'rid_metadata';

/**
 * Create SDK with auth headers from cookies
 */
function createAuthenticatedSDK(request: NextRequest): { sdk: ReplayAPISDK; isAuthenticated: boolean } {
  const cookieStore = cookies();
  const ridToken = cookieStore.get(RID_TOKEN_COOKIE)?.value;
  const ridMetadata = cookieStore.get(RID_METADATA_COOKIE)?.value;
  
  // Create SDK with auth token if available
  const settings = {
    ...ReplayApiSettingsMock,
    authToken: ridToken,
  };
  
  const sdk = new ReplayAPISDK(settings, logger);
  
  // If we have auth token, set it on the client
  if (ridToken) {
    // The SDK client will include the auth token in requests
    logger.info('[API /api/squads] Using authenticated SDK', { hasToken: true });
  }
  
  return { 
    sdk, 
    isAuthenticated: !!ridToken && !!ridMetadata,
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { sdk } = createAuthenticatedSDK(request);

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
    const { sdk, isAuthenticated } = createAuthenticatedSDK(request);
    
    if (!isAuthenticated) {
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

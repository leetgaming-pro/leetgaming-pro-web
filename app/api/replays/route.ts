/**
 * Replays API Route
 * Server-side replay fetching with caching and authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { ReplayAPISDK } from '@/types/replay-api/sdk';
import { ReplayApiSettingsMock } from '@/types/replay-api/settings';
import { SearchBuilder } from '@/types/replay-api/search-builder';
import { logger } from '@/lib/logger';
import { getUserIdFromToken } from '@/lib/auth/server-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const gameId = searchParams.get('gameId') || 'cs2';
    const visibility = searchParams.get('visibility') || 'public';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    // Get user session for authenticated requests
    const session = await getServerSession();
    
    // Initialize SDK
    const sdk = new ReplayAPISDK(ReplayApiSettingsMock, logger);
    
    // Build search query
    const searchBuilder = new SearchBuilder()
      .withGameIds(gameId)
      .paginate(page, limit);
    
    // Apply sorting
    if (sortOrder === 'desc') {
      searchBuilder.sortDesc(sortBy);
    } else {
      searchBuilder.sortAsc(sortBy);
    }
    
    // Apply visibility filter
    type VisibilityType = 'public' | 'private' | 'shared' | 'unlisted';
    const validVisibilities: VisibilityType[] = ['public', 'private', 'shared', 'unlisted'];
    if (visibility !== 'all' && validVisibilities.includes(visibility as VisibilityType)) {
      searchBuilder.withResourceVisibilities(visibility as VisibilityType);
    }
    
    // Apply user filter if authenticated and requesting private replays
    // Private replays require authentication and filter by owner
    if (visibility === 'private') {
      if (!session?.user) {
        return NextResponse.json({
          success: false,
          error: 'Authentication required for private replays',
        }, {
          status: 401,
        });
      }
      const userId = getUserIdFromToken();
      if (userId) {
        searchBuilder.withResourceOwners(userId);
      }
    }
    
    const search = searchBuilder.build();
    
    // Fetch replays
    const replays = await sdk.replayFiles.searchReplayFiles(search.filters);
    
    // Return response with caching headers
    return NextResponse.json({
      success: true,
      data: replays,
      pagination: {
        page,
        limit,
        hasMore: replays.length === limit,
      },
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
    
  } catch (error) {
    logger.error('[API /api/replays] Error fetching replays', error);
    
    return NextResponse.json({
      success: false,
      error: (error instanceof Error ? error.message : 'Failed to fetch replays'),
    }, {
      status: 500,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get user session - auth required for creating replays
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required',
      }, {
        status: 401,
      });
    }
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.gameId || !body.file) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: gameId, file',
      }, {
        status: 400,
      });
    }
    
    // TODO: Implement replay upload logic
    // This would typically handle file upload to storage and create replay metadata
    
    return NextResponse.json({
      success: true,
      message: 'Upload endpoint - to be implemented with file handling',
    });
    
  } catch (error) {
    logger.error('[API /api/replays] Error creating replay', error);
    
    return NextResponse.json({
      success: false,
      error: (error instanceof Error ? error.message : 'Failed to create replay'),
    }, {
      status: 500,
    });
  }
}

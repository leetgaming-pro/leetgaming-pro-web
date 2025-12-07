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
    
    // Get form data with file
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const gameId = formData.get('gameId') as string || 'cs2';
    const visibility = formData.get('visibility') as string || 'private';
    
    // Validate required fields
    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'Missing required field: file',
      }, {
        status: 400,
      });
    }
    
    // Validate file type
    const validExtensions = ['.dem', '.replay'];
    const fileName = file.name.toLowerCase();
    if (!validExtensions.some(ext => fileName.endsWith(ext))) {
      return NextResponse.json({
        success: false,
        error: 'Invalid file type. Accepted: .dem, .replay',
      }, {
        status: 400,
      });
    }
    
    // Get user ID for upload
    const userId = getUserIdFromToken();
    
    // Proxy to backend API
    const backendUrl = process.env.REPLAY_API_URL || 'http://replay-api-service:8080';
    const uploadUrl = `${backendUrl}/games/${gameId}/replays`;
    
    // Create new FormData for backend
    const backendFormData = new FormData();
    backendFormData.append('file', file);
    backendFormData.append('visibility', visibility);
    
    const backendResponse = await fetch(uploadUrl, {
      method: 'POST',
      body: backendFormData,
      headers: {
        'X-Resource-Owner-ID': userId || '',
      },
    });
    
    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      logger.error('[API /api/replays] Backend upload failed', { status: backendResponse.status, error: errorText });
      return NextResponse.json({
        success: false,
        error: `Upload failed: ${backendResponse.statusText}`,
      }, {
        status: backendResponse.status,
      });
    }
    
    const result = await backendResponse.json();
    
    return NextResponse.json({
      success: true,
      data: result,
      message: 'Replay uploaded successfully',
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

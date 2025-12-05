/**
 * Replay Detail API Route
 * Get specific replay by ID
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { ReplayApiSettingsMock } from '@/types/replay-api/settings';
import { logger } from '@/lib/logger';
import { getAuthHeadersFromCookies, getUserIdFromToken } from '@/lib/auth/server-auth';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('gameId') || 'cs2';

    const authHeaders = getAuthHeadersFromCookies();

    // Fetch replay file details from backend
    const response = await fetch(
      `${ReplayApiSettingsMock.baseUrl}/games/${gameId}/replay-files/${id}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({
          success: false,
          error: 'Replay not found',
        }, {
          status: 404,
        });
      }
      const error = await response.json().catch(() => ({ message: 'Failed to fetch replay' }));
      logger.error('[API /api/replays/[id]] Backend error', { status: response.status, error });
      return NextResponse.json({
        success: false,
        error: error.message || 'Failed to fetch replay',
      }, {
        status: response.status,
      });
    }

    const replay = await response.json();

    return NextResponse.json({
      success: true,
      data: replay,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });

  } catch (error) {
    logger.error('[API /api/replays/[id]] Error fetching replay', error);

    return NextResponse.json({
      success: false,
      error: (error instanceof Error ? error.message : 'Failed to fetch replay'),
    }, {
      status: 500,
    });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication required for delete operations
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required',
      }, {
        status: 401,
      });
    }

    const { id } = params;
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('gameId') || 'cs2';

    const authHeaders = getAuthHeadersFromCookies();
    const userId = getUserIdFromToken();

    // Forward delete request to backend with auth headers
    // Backend handles resource ownership verification
    const response = await fetch(
      `${ReplayApiSettingsMock.baseUrl}/games/${gameId}/replay-files/${id}`,
      {
        method: 'DELETE',
        headers: {
          ...authHeaders,
          ...(userId && { 'X-User-ID': userId }),
        },
      }
    );

    if (!response.ok) {
      if (response.status === 403) {
        return NextResponse.json({
          success: false,
          error: 'You do not have permission to delete this replay',
        }, {
          status: 403,
        });
      }
      if (response.status === 404) {
        return NextResponse.json({
          success: false,
          error: 'Replay not found',
        }, {
          status: 404,
        });
      }
      const error = await response.json().catch(() => ({ message: 'Failed to delete replay' }));
      logger.error('[API /api/replays/[id]] Backend error on delete', { status: response.status, error });
      return NextResponse.json({
        success: false,
        error: error.message || 'Failed to delete replay',
      }, {
        status: response.status,
      });
    }

    logger.info('[API /api/replays/[id]] Replay deleted', { id, gameId, userId });

    return NextResponse.json({
      success: true,
      message: 'Replay deleted successfully',
    });

  } catch (error) {
    logger.error('[API /api/replays/[id]] Error deleting replay', error);

    return NextResponse.json({
      success: false,
      error: (error instanceof Error ? error.message : 'Failed to delete replay'),
    }, {
      status: 500,
    });
  }
}

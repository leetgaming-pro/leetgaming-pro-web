/**
 * Leave Matchmaking Queue API Route
 * DELETE - Leave the matchmaking queue by session ID
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { logger } from '@/lib/logger';
import { ReplayApiSettingsMock } from '@/types/replay-api/settings';
import { getAuthHeadersFromCookies } from '@/lib/auth/server-auth';

export const dynamic = 'force-dynamic';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { session_id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required',
      }, { status: 401 });
    }

    const { session_id } = params;
    const authHeaders = getAuthHeadersFromCookies();

    // Forward request to replay-api backend with auth headers
    // Backend handles session ownership verification
    const response = await fetch(
      `${ReplayApiSettingsMock.baseUrl}/match-making/queue/${session_id}`,
      {
        method: 'DELETE',
        headers: {
          ...authHeaders,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 403) {
        return NextResponse.json({
          success: false,
          error: 'You do not have permission to leave this queue session',
        }, { status: 403 });
      }
      if (response.status === 404) {
        return NextResponse.json({
          success: false,
          error: 'Queue session not found',
        }, { status: 404 });
      }
      const error = await response.json().catch(() => ({ message: 'Failed to leave queue' }));
      logger.error('[API /api/matchmaking/queue/:session_id] Backend error', {
        status: response.status,
        error,
        session_id
      });
      return NextResponse.json({
        success: false,
        error: error.message || 'Failed to leave queue',
      }, { status: response.status });
    }

    logger.info('[API /api/matchmaking/queue/:session_id] Player left queue', { session_id });

    return NextResponse.json({
      success: true,
      message: 'Successfully left queue',
    });
  } catch (error) {
    logger.error(`[API /api/matchmaking/queue/${params.session_id}] Error leaving queue`, error);
    return NextResponse.json({
      success: false,
      error: (error instanceof Error ? error.message : 'Failed to leave queue'),
    }, { status: 500 });
  }
}

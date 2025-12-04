/**
 * Matchmaking Session Status API Route
 * GET - Get session status for matchmaking queue polling
 * DELETE - Cancel/leave the matchmaking session
 *
 * Used by the wizard to poll for match found status
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { ReplayApiSettingsMock, getRegionApiUrl } from '@/types/replay-api/settings';
import { logger } from '@/lib/logger';
import { getAuthHeadersFromCookies } from '@/lib/auth/server-auth';

export const dynamic = 'force-dynamic';

interface SessionStatusResponse {
  session_id: string;
  status: 'queued' | 'matching' | 'matched' | 'cancelled' | 'expired';
  queue_position?: number;
  estimated_wait?: number;
  elapsed_time?: number;
  match_id?: string;
  lobby_id?: string;
  players_found?: number;
  players_required?: number;
  region?: string;
  game_mode?: string;
}

/**
 * GET /api/match-making/session/[session_id] - Get matchmaking session status
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { session_id: string } }
) {
  try {
    const { session_id } = params;

    if (!session_id) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const authHeaders = getAuthHeadersFromCookies();
    const region = request.nextUrl.searchParams.get('region');
    const apiUrl = region ? getRegionApiUrl(region) : ReplayApiSettingsMock.baseUrl;

    logger.info('[API /api/match-making/session] Fetching session status', {
      session_id,
      region,
      apiUrl,
    });

    // Forward request to replay-api backend
    const response = await fetch(`${apiUrl}/match-making/session/${session_id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-Region': region || 'auto',
        ...authHeaders,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to get session status' }));
      logger.error('[API /api/match-making/session] Backend error', {
        status: response.status,
        error: errorData,
        session_id,
      });

      return NextResponse.json(
        {
          success: false,
          error: errorData.message || 'Failed to get session status',
        },
        { status: response.status }
      );
    }

    const data: SessionStatusResponse = await response.json();

    logger.info('[API /api/match-making/session] Session status retrieved', {
      session_id,
      status: data.status,
      queue_position: data.queue_position,
    });

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    logger.error('[API /api/match-making/session] Error getting session status', error);
    return NextResponse.json(
      {
        success: false,
        error: (error instanceof Error ? error.message : 'Failed to get session status'),
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/match-making/session/[session_id] - Cancel/leave matchmaking session
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { session_id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { session_id } = params;

    if (!session_id) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const authHeaders = getAuthHeadersFromCookies();

    logger.info('[API /api/match-making/session] Cancelling session', {
      session_id,
    });

    // Forward request to replay-api backend
    const response = await fetch(`${ReplayApiSettingsMock.baseUrl}/match-making/session/${session_id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to cancel session' }));
      logger.error('[API /api/match-making/session] Backend error on cancel', {
        status: response.status,
        error: errorData,
        session_id,
      });

      return NextResponse.json(
        {
          success: false,
          error: errorData.message || 'Failed to cancel session',
        },
        { status: response.status }
      );
    }

    logger.info('[API /api/match-making/session] Session cancelled', {
      session_id,
    });

    return NextResponse.json({
      success: true,
      message: 'Session cancelled successfully',
    });
  } catch (error) {
    logger.error('[API /api/match-making/session] Error cancelling session', error);
    return NextResponse.json(
      {
        success: false,
        error: (error instanceof Error ? error.message : 'Failed to cancel session'),
      },
      { status: 500 }
    );
  }
}

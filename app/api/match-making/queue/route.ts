/**
 * Join Matchmaking Queue API Route
 * POST - Join the matchmaking queue
 * DELETE - Leave the matchmaking queue
 *
 * Supports multi-region matchmaking with region-aware routing
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { logger } from '@/lib/logger';
import { ReplayApiSettingsMock, getRegionApiUrl } from '@/types/replay-api/settings';
import { getAuthHeadersFromCookies } from '@/lib/auth/server-auth';

export const dynamic = 'force-dynamic';

/**
 * POST /api/match-making/queue - Join matchmaking queue
 */
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
    const authHeaders = getAuthHeadersFromCookies();

    // Use region-specific API URL if region is specified in the request
    // This enables multi-region matchmaking with lowest latency
    const region = body.region || body.preferred_region;
    const apiUrl = region ? getRegionApiUrl(region) : ReplayApiSettingsMock.baseUrl;

    logger.info('[API /api/match-making/queue] Routing to region', { region, apiUrl });

    // Forward request to replay-api backend with auth headers
    const response = await fetch(`${apiUrl}/match-making/queue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-Region': region || 'auto',
        ...authHeaders,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to join queue' }));
      logger.error('[API /api/match-making/queue] Backend error', { status: response.status, error });
      return NextResponse.json({
        success: false,
        error: (error instanceof Error ? error.message : 'Failed to join queue'),
      }, { status: response.status });
    }

    const data = await response.json();
    logger.info('[API /api/match-making/queue] Player joined queue', { session_id: data.session_id });

    return NextResponse.json({
      success: true,
      data,
    }, { status: 201 });
  } catch (error) {
    logger.error('[API /api/match-making/queue] Error joining queue', error);
    return NextResponse.json({
      success: false,
      error: (error instanceof Error ? error.message : 'Failed to join queue'),
    }, { status: 500 });
  }
}

/**
 * DELETE /api/match-making/queue?session_id=xxx - Leave matchmaking queue
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required',
      }, { status: 401 });
    }

    const sessionId = request.nextUrl.searchParams.get('session_id');
    if (!sessionId) {
      return NextResponse.json({
        success: false,
        error: 'session_id is required',
      }, { status: 400 });
    }

    const authHeaders = getAuthHeadersFromCookies();

    // Forward request to replay-api backend with auth headers
    const response = await fetch(`${ReplayApiSettingsMock.baseUrl}/match-making/queue/${sessionId}`, {
      method: 'DELETE',
      headers: {
        ...authHeaders,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to leave queue' }));
      logger.error('[API /api/match-making/queue] Backend error', { status: response.status, error, session_id: sessionId });
      return NextResponse.json({
        success: false,
        error: (error instanceof Error ? error.message : 'Failed to leave queue'),
      }, { status: response.status });
    }

    logger.info('[API /api/match-making/queue] Player left queue', { session_id: sessionId });

    return NextResponse.json({
      success: true,
      message: 'Left queue successfully',
    }, { status: 200 });
  } catch (error) {
    logger.error('[API /api/match-making/queue] Error leaving queue', error);
    return NextResponse.json({
      success: false,
      error: (error instanceof Error ? error.message : 'Failed to leave queue'),
    }, { status: 500 });
  }
}

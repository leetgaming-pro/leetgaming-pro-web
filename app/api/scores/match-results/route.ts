/**
 * Scores / Match Results API Route
 * POST - Submit a new match result
 * GET - List match results with filters
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { logger } from '@/lib/logger';
import { ReplayApiSettingsMock } from '@/types/replay-api/settings';
import { getAuthHeadersFromCookies } from '@/lib/auth/server-auth';

export const dynamic = 'force-dynamic';

/**
 * POST /api/scores/match-results - Submit new match result
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const authHeaders = getAuthHeadersFromCookies();

    const response = await fetch(`${ReplayApiSettingsMock.baseUrl}/scores/match-results`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to submit match result' }));
      logger.error('[API /api/scores/match-results] Backend error', { status: response.status, error });
      return NextResponse.json({ success: false, error: error?.message || 'Failed to submit match result' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    logger.error('[API /api/scores/match-results] Error submitting match result', error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/scores/match-results - List match results
 */
export async function GET(request: NextRequest) {
  try {
    const authHeaders = getAuthHeadersFromCookies();
    const queryString = request.nextUrl.searchParams.toString();
    const url = queryString
      ? `${ReplayApiSettingsMock.baseUrl}/scores/match-results?${queryString}`
      : `${ReplayApiSettingsMock.baseUrl}/scores/match-results`;

    const response = await fetch(url, {
      method: 'GET',
      headers: { ...authHeaders },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch match results' }));
      logger.error('[API /api/scores/match-results] Backend error', { status: response.status, error });
      return NextResponse.json({ success: false, error: error?.message || 'Failed to fetch match results' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    logger.error('[API /api/scores/match-results] Error fetching match results', error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
  }
}

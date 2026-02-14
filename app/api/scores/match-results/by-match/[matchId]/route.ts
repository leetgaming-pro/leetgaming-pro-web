/**
 * Match Result by Match ID API Route
 * GET - Get match result for a specific match
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { ReplayApiSettingsMock } from '@/types/replay-api/settings';
import { getAuthHeadersFromCookies } from '@/lib/auth/server-auth';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { matchId: string } }
) {
  try {
    const authHeaders = getAuthHeadersFromCookies();

    const response = await fetch(
      `${ReplayApiSettingsMock.baseUrl}/scores/match-results/by-match/${params.matchId}`,
      { method: 'GET', headers: { ...authHeaders } }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Match result not found' }));
      return NextResponse.json({ success: false, error: error?.message || 'Match result not found' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    logger.error('[API /api/scores/match-results/by-match/[matchId]] Error', error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
  }
}

/**
 * Single Match Result API Route
 * GET - Get match result by ID
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { ReplayApiSettingsMock } from '@/types/replay-api/settings';
import { getAuthHeadersFromCookies } from '@/lib/auth/server-auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/scores/match-results/[id] - Get match result by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeaders = getAuthHeadersFromCookies();

    const response = await fetch(
      `${ReplayApiSettingsMock.baseUrl}/scores/match-results/${params.id}`,
      { method: 'GET', headers: { ...authHeaders } }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Match result not found' }));
      return NextResponse.json({ success: false, error: error?.message || 'Match result not found' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    logger.error('[API /api/scores/match-results/[id]] Error', error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
  }
}

/**
 * Verify Match Result API Route
 * PUT - Verify a match result (admin/automated verification)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { logger } from '@/lib/logger';
import { ReplayApiSettingsMock } from '@/types/replay-api/settings';
import { getAuthHeadersFromCookies } from '@/lib/auth/server-auth';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const authHeaders = getAuthHeadersFromCookies();

    const response = await fetch(
      `${ReplayApiSettingsMock.baseUrl}/scores/match-results/${params.id}/verify`,
      { method: 'PUT', headers: { 'Content-Type': 'application/json', ...authHeaders }, body: JSON.stringify(body) }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to verify match result' }));
      return NextResponse.json({ success: false, error: error?.message || 'Failed to verify' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    logger.error('[API /api/scores/match-results/[id]/verify] Error', error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
  }
}

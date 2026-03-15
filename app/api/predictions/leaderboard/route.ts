/**
 * Prediction Leaderboard API
 * GET /api/predictions/leaderboard — Get betting leaderboard
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { getBackendUrl } from '@/lib/api/backend-url';
import { getAuthHeadersFromCookies } from '@/lib/auth/server-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ entries: [], limit: 20 }, { status: 200 });
    }

    const authHeaders = getAuthHeadersFromCookies();
    const backendUrl = getBackendUrl();
    const searchParams = request.nextUrl.searchParams.toString();
    const qs = searchParams ? `?${searchParams}` : '';

    const response = await fetch(`${backendUrl}/predictions/leaderboard${qs}`, {
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      cache: 'no-store',
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[API predictions/leaderboard] GET error:', error);
    return NextResponse.json({ entries: [], limit: 20 }, { status: 200 });
  }
}

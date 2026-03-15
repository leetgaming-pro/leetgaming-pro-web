/**
 * Match Comments API
 * GET /api/matches/[matchId]/comments — List comments for a match
 * POST /api/matches/[matchId]/comments — Create a comment
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { getBackendUrl } from '@/lib/api/backend-url';
import { getAuthHeadersFromCookies } from '@/lib/auth/server-auth';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { matchId: string } },
) {
  try {
    const authHeaders = getAuthHeadersFromCookies();
    const backendUrl = getBackendUrl();
    const searchParams = request.nextUrl.searchParams.toString();
    const qs = searchParams ? `?${searchParams}` : '';

    const response = await fetch(
      `${backendUrl}/matches/${params.matchId}/comments${qs}`,
      {
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        cache: 'no-store',
      },
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[API /api/matches/[matchId]/comments] GET error:', error);
    return NextResponse.json(
      { comments: [], total_count: 0, limit: 20, offset: 0 },
      { status: 200 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { matchId: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const authHeaders = getAuthHeadersFromCookies();
    const backendUrl = getBackendUrl();
    const body = await request.json();

    const response = await fetch(
      `${backendUrl}/matches/${params.matchId}/comments`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify(body),
      },
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[API /api/matches/[matchId]/comments] POST error:', error);
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
}

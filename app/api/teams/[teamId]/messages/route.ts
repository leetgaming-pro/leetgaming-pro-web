/**
 * Team Messages API
 * GET /api/teams/[teamId]/messages — List team messages
 * POST /api/teams/[teamId]/messages — Send a team message
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { getBackendUrl } from '@/lib/api/backend-url';
import { getAuthHeadersFromCookies } from '@/lib/auth/server-auth';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { teamId: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const authHeaders = getAuthHeadersFromCookies();
    const backendUrl = getBackendUrl();
    const searchParams = request.nextUrl.searchParams.toString();
    const qs = searchParams ? `?${searchParams}` : '';

    const response = await fetch(
      `${backendUrl}/teams/${params.teamId}/messages${qs}`,
      {
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        cache: 'no-store',
      },
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[API team messages] GET error:', error);
    return NextResponse.json(
      { messages: [], total_count: 0, limit: 50, offset: 0 },
      { status: 200 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { teamId: string } },
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
      `${backendUrl}/teams/${params.teamId}/messages`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify(body),
      },
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[API team messages] POST error:', error);
    return NextResponse.json({ error: 'Failed to send team message' }, { status: 500 });
  }
}

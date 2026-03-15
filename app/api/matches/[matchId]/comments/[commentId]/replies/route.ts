/**
 * Comment Replies API
 * GET /api/matches/[matchId]/comments/[commentId]/replies
 */

import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/api/backend-url';
import { getAuthHeadersFromCookies } from '@/lib/auth/server-auth';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { matchId: string; commentId: string } },
) {
  try {
    const authHeaders = getAuthHeadersFromCookies();
    const backendUrl = getBackendUrl();
    const searchParams = request.nextUrl.searchParams.toString();
    const qs = searchParams ? `?${searchParams}` : '';

    const response = await fetch(
      `${backendUrl}/matches/${params.matchId}/comments/${params.commentId}/replies${qs}`,
      {
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        cache: 'no-store',
      },
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[API comment replies] GET error:', error);
    return NextResponse.json(
      { comments: [], total_count: 0, limit: 20, offset: 0 },
      { status: 200 },
    );
  }
}

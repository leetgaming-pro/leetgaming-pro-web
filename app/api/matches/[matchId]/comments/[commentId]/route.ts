/**
 * Comment Detail API
 * GET /api/matches/[matchId]/comments/[commentId]  — Get a single comment
 * PUT /api/matches/[matchId]/comments/[commentId]  — Edit a comment
 * DELETE /api/matches/[matchId]/comments/[commentId] — Delete a comment
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { getBackendUrl } from '@/lib/api/backend-url';
import { getAuthHeadersFromCookies } from '@/lib/auth/server-auth';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: { matchId: string; commentId: string } },
) {
  try {
    const authHeaders = getAuthHeadersFromCookies();
    const backendUrl = getBackendUrl();

    const response = await fetch(
      `${backendUrl}/matches/${params.matchId}/comments/${params.commentId}`,
      {
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        cache: 'no-store',
      },
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[API comment detail] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch comment' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { matchId: string; commentId: string } },
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
      `${backendUrl}/matches/${params.matchId}/comments/${params.commentId}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify(body),
      },
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[API comment detail] PUT error:', error);
    return NextResponse.json({ error: 'Failed to edit comment' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { matchId: string; commentId: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const authHeaders = getAuthHeadersFromCookies();
    const backendUrl = getBackendUrl();

    const response = await fetch(
      `${backendUrl}/matches/${params.matchId}/comments/${params.commentId}`,
      {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
      },
    );

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API comment detail] DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
  }
}

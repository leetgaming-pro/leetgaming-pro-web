/**
 * Market Bets API
 * GET /api/predictions/markets/[marketId]/bets — List bets on a market
 * POST /api/predictions/markets/[marketId]/bets — Place a bet
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { getBackendUrl } from '@/lib/api/backend-url';
import { getAuthHeadersFromCookies } from '@/lib/auth/server-auth';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { marketId: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ bets: [], total_count: 0 }, { status: 200 });
    }

    const authHeaders = getAuthHeadersFromCookies();
    const backendUrl = getBackendUrl();
    const searchParams = request.nextUrl.searchParams.toString();
    const qs = searchParams ? `?${searchParams}` : '';

    const response = await fetch(
      `${backendUrl}/predictions/markets/${params.marketId}/bets${qs}`,
      {
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        cache: 'no-store',
      },
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[API predictions/markets/bets] GET error:', error);
    return NextResponse.json({ bets: [], total_count: 0 }, { status: 200 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { marketId: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'unauthorized' }, { status: 401 });
    }

    const authHeaders = getAuthHeadersFromCookies();
    const backendUrl = getBackendUrl();
    const body = await request.json();

    const response = await fetch(
      `${backendUrl}/predictions/markets/${params.marketId}/bets`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify(body),
      },
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[API predictions/markets/bets] POST error:', error);
    return NextResponse.json({ success: false, error: 'internal error' }, { status: 500 });
  }
}

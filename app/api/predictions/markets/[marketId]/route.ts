/**
 * Prediction Market Detail API
 * GET /api/predictions/markets/[marketId] — Get single market
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
      return NextResponse.json(null, { status: 200 });
    }

    const authHeaders = getAuthHeadersFromCookies();
    const backendUrl = getBackendUrl();

    const response = await fetch(
      `${backendUrl}/predictions/markets/${params.marketId}`,
      {
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        cache: 'no-store',
      },
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[API predictions/markets/[marketId]] GET error:', error);
    return NextResponse.json(null, { status: 200 });
  }
}

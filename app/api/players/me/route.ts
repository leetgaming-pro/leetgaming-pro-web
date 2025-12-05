/**
 * Current User Player Profile API Route
 * GET /api/players/me - Get current user's player profile
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/options';
import { forwardAuthenticatedRequest } from '@/lib/auth/server-auth';

export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.REPLAY_API_URL || 'http://localhost:30800';

/**
 * GET /api/players/me
 * Get current user's player profile
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const response = await forwardAuthenticatedRequest(
      `${BACKEND_URL}/players/me`,
      {
        method: 'GET',
      },
      session
    );

    if (response.status === 404) {
      return NextResponse.json(
        { success: true, data: null },
        { status: 200 }
      );
    }

    const data = await response.json();

    return NextResponse.json(
      { success: response.ok, data },
      { status: response.status }
    );
  } catch (error) {
    console.error('[API] Get my player profile error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get player profile' },
      { status: 500 }
    );
  }
}

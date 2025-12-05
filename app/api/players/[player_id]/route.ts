/**
 * Individual Player API Route Handler
 * GET /api/players/:player_id - Get player profile
 * PATCH /api/players/:player_id - Update player profile
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/options';
import { forwardAuthenticatedRequest } from '@/lib/auth/server-auth';

const BACKEND_URL = process.env.REPLAY_API_URL || 'http://localhost:30800';

interface RouteParams {
  params: {
    player_id: string;
  };
}

/**
 * GET /api/players/:player_id
 * Get a player profile by ID
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { player_id } = params;

    const response = await fetch(`${BACKEND_URL}/players/${player_id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data.error || 'Player not found' },
        { status: response.status }
      );
    }

    return NextResponse.json(
      { success: true, data },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API] Get player error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get player profile' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/players/:player_id
 * Update a player profile (requires authentication and ownership)
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { player_id } = params;
    const body = await request.json();

    const response = await forwardAuthenticatedRequest(
      `${BACKEND_URL}/players/${player_id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(body),
      },
      session
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data.error || 'Failed to update player profile' },
        { status: response.status }
      );
    }

    return NextResponse.json(
      { success: true, data },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API] Update player error:', error);
    return NextResponse.json(
      { success: false, error: (error instanceof Error ? error.message : 'Failed to update player profile') },
      { status: 500 }
    );
  }
}

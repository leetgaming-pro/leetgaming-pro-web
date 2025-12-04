/**
 * Individual Lobby API Routes
 * GET - Get lobby details
 * DELETE - Cancel lobby (creator only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { ReplayAPISDK } from '@/types/replay-api/sdk';
import { ReplayApiSettingsMock } from '@/types/replay-api/settings';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { lobby_id: string } }
) {
  try {
    const { lobby_id } = params;

    const sdk = new ReplayAPISDK(ReplayApiSettingsMock, logger);
    const result = await sdk.lobbies.getLobby(lobby_id);

    if (!result) {
      return NextResponse.json({
        success: false,
        error: 'Lobby not found',
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: result,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=10',
      },
    });
  } catch (error) {
    logger.error(`[API /api/matchmaking/lobbies/${params.lobby_id}] Error fetching lobby`, error);
    return NextResponse.json({
      success: false,
      error: (error instanceof Error ? error.message : 'Failed to fetch lobby'),
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { lobby_id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required',
      }, { status: 401 });
    }

    const { lobby_id } = params;
    const body = await request.json().catch(() => ({}));

    const sdk = new ReplayAPISDK(ReplayApiSettingsMock, logger);
    await sdk.lobbies.cancelLobby(lobby_id, body);

    return NextResponse.json({
      success: true,
      message: 'Lobby cancelled successfully',
    });
  } catch (error) {
    logger.error(`[API /api/matchmaking/lobbies/${params.lobby_id}] Error cancelling lobby`, error);
    return NextResponse.json({
      success: false,
      error: (error instanceof Error ? error.message : 'Failed to cancel lobby'),
    }, { status: 500 });
  }
}

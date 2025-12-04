/**
 * Start Match API Route
 * POST - Start the match (creator only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { ReplayAPISDK } from '@/types/replay-api/sdk';
import { ReplayApiSettingsMock } from '@/types/replay-api/settings';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function POST(
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
    const result = await sdk.lobbies.startMatch(lobby_id, body);

    if (!result) {
      return NextResponse.json({
        success: false,
        error: 'Failed to start match',
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error(`[API /api/matchmaking/lobbies/${params.lobby_id}/start] Error starting match`, error);
    return NextResponse.json({
      success: false,
      error: (error instanceof Error ? error.message : 'Failed to start match'),
    }, { status: 500 });
  }
}

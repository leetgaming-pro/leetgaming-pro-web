/**
 * Squad Detail API Routes
 * GET - Get squad by ID
 * PUT - Update squad
 * DELETE - Delete squad
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { ReplayAPISDK } from '@/types/replay-api/sdk';
import { ReplayApiSettingsMock } from '@/types/replay-api/settings';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sdk = new ReplayAPISDK(ReplayApiSettingsMock, logger);
    const squad = await sdk.squads.getSquad(params.id);

    if (!squad) {
      return NextResponse.json({
        success: false,
        error: 'Squad not found',
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: squad,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    logger.error(`[API /api/squads/${params.id}] Error fetching squad`, error);
    return NextResponse.json({
      success: false,
      error: (error instanceof Error ? error.message : 'Failed to fetch squad'),
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required',
      }, { status: 401 });
    }

    const body = await request.json();

    const sdk = new ReplayAPISDK(ReplayApiSettingsMock, logger);
    const squad = await sdk.squads.updateSquad(params.id, body);

    if (!squad) {
      return NextResponse.json({
        success: false,
        error: 'Failed to update squad',
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: squad,
    });
  } catch (error) {
    logger.error(`[API /api/squads/${params.id}] Error updating squad`, error);
    return NextResponse.json({
      success: false,
      error: (error instanceof Error ? error.message : 'Failed to update squad'),
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required',
      }, { status: 401 });
    }

    const sdk = new ReplayAPISDK(ReplayApiSettingsMock, logger);
    const success = await sdk.squads.deleteSquad(params.id);

    if (!success) {
      return NextResponse.json({
        success: false,
        error: 'Failed to delete squad',
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Squad deleted successfully',
    });
  } catch (error) {
    logger.error(`[API /api/squads/${params.id}] Error deleting squad`, error);
    return NextResponse.json({
      success: false,
      error: (error instanceof Error ? error.message : 'Failed to delete squad'),
    }, { status: 500 });
  }
}

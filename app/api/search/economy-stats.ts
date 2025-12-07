import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Economy Stats API
 * Returns CS2 economy statistics for matches/rounds
 * Note: Full implementation pending GRPC sendtables integration
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const matchId = searchParams.get('matchId');
    const roundNumber = searchParams.get('round');
    
    if (!matchId) {
      return NextResponse.json({
        success: false,
        error: 'matchId is required',
      }, { status: 400 });
    }
    
    // Placeholder economy data structure
    // TODO: Implement actual data fetching from replay-api GRPC service
    const economyStats = {
      match_id: matchId,
      round: roundNumber ? parseInt(roundNumber) : null,
      teams: [
        {
          name: 'CT',
          total_money: 0,
          equipment_value: 0,
          avg_money_per_player: 0,
          economy_state: 'unknown', // 'full_buy', 'force_buy', 'eco', 'semi_eco'
        },
        {
          name: 'T',
          total_money: 0,
          equipment_value: 0,
          avg_money_per_player: 0,
          economy_state: 'unknown',
        },
      ],
      players: [],
      _note: 'Economy data will be available after GRPC sendtables integration',
    };
    
    return NextResponse.json({
      success: true,
      data: economyStats,
    });
    
  } catch (error) {
    logger.error('[API /api/search/economy-stats] Error', error);
    return NextResponse.json({
      success: false,
      error: (error instanceof Error ? error.message : 'Failed to fetch economy stats'),
    }, { status: 500 });
  }
}
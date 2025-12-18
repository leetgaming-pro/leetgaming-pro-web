/**
 * Player Rating API Route
 * Fetches player rating from the Replay API backend
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

const REPLAY_API_URL = process.env.REPLAY_API_URL || 'http://localhost:3001';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ player_id: string }> }
) {
  const resolvedParams = await params;
  const playerId = resolvedParams.player_id;
  const session = await getServerSession(authOptions);
  
  const searchParams = request.nextUrl.searchParams;
  const gameId = searchParams.get('game_id') || 'cs2';
  
  try {
    const apiUrl = `${REPLAY_API_URL}/players/${playerId}/rating?game_id=${gameId}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (session?.user?.rid) {
      headers['Authorization'] = `Bearer ${session.user.rid}`;
    }
    
    const response = await fetch(apiUrl, {
      headers,
      cache: 'no-store',
    });
    
    if (!response.ok) {
      // Return default rating for new players
      if (response.status === 404) {
        return NextResponse.json({
          player_id: playerId,
          game_id: gameId,
          rating: 1500,
          rating_deviation: 350,
          volatility: 0.06,
          rank: 'Unranked',
          wins: 0,
          losses: 0,
          draws: 0,
          games_played: 0,
          streak: 0,
          max_rating: 1500,
          is_provisional: true,
          last_played_at: null,
          confidence_interval: {
            lower: 814,
            upper: 2186,
          },
        });
      }
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Player rating API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch player rating' },
      { status: 500 }
    );
  }
}


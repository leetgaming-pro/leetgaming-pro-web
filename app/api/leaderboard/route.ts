/**
 * Leaderboard API Route
 * Fetches leaderboard data from the Replay API backend
 */

import { NextRequest, NextResponse } from 'next/server';

const REPLAY_API_URL = process.env.REPLAY_API_URL || 'http://localhost:3001';

interface LeaderboardEntry {
  position?: number;
  player_id?: string;
  display_name?: string;
  avatar?: string;
  rating?: number;
  rank?: string;
  wins?: number;
  losses?: number;
  games_played?: number;
  win_rate?: number;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const gameId = searchParams.get('game_id') || 'cs2';
  const limit = searchParams.get('limit') || '100';
  const offset = searchParams.get('offset') || '0';
  
  try {
    const apiUrl = `${REPLAY_API_URL}/leaderboard?game_id=${gameId}&limit=${limit}&offset=${offset}`;
    
    const response = await fetch(apiUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });
    
    if (!response.ok) {
      // Return empty leaderboard for graceful degradation
      return NextResponse.json({
        data: [],
        total: 0,
        game_id: gameId,
      });
    }
    
    const data = await response.json();
    
    // Add position numbers if not present
    const leaderboard = (data.data || data || []).map((entry: LeaderboardEntry, index: number) => ({
      position: entry.position || index + 1 + parseInt(offset),
      player_id: entry.player_id,
      display_name: entry.display_name || 'Unknown Player',
      avatar: entry.avatar,
      rating: entry.rating,
      rank: entry.rank,
      wins: entry.wins || 0,
      losses: entry.losses || 0,
      games_played: entry.games_played || 0,
      win_rate: entry.win_rate || ((entry.games_played ?? 0) > 0 ? ((entry.wins ?? 0) / (entry.games_played ?? 1)) * 100 : 0),
    }));
    
    return NextResponse.json({
      data: leaderboard,
      total: data.total || leaderboard.length,
      game_id: gameId,
    });
  } catch (error) {
    console.error('Leaderboard API error:', error);
    return NextResponse.json({
      data: [],
      total: 0,
      game_id: gameId,
    });
  }
}


/**
 * Matches API Route
 * Proxies match data from the Replay API backend
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/options';

const REPLAY_API_URL = process.env.REPLAY_API_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get('status');
  const game = searchParams.get('game');
  const limit = searchParams.get('limit') || '20';
  const offset = searchParams.get('offset') || '0';
  const playerId = searchParams.get('player_id');
  
  try {
    let apiUrl = `${REPLAY_API_URL}/games/cs2/match`;
    
    // If player_id is provided, use player match history endpoint
    if (playerId) {
      apiUrl = `${REPLAY_API_URL}/matches/player/${playerId}?limit=${limit}&offset=${offset}`;
    } else {
      // Build query params for general match search
      const params = new URLSearchParams();
      params.append('limit', limit);
      params.append('offset', offset);
      if (status && status !== 'all') {
        params.append('status', status);
      }
      if (game && game !== 'all') {
        params.append('game', game);
      }
      apiUrl = `${apiUrl}?${params.toString()}`;
    }
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    // Include auth token if available
    if (session?.user?.rid) {
      headers['Authorization'] = `Bearer ${session.user.rid}`;
    }
    
    const response = await fetch(apiUrl, {
      headers,
      cache: 'no-store',
    });
    
    if (!response.ok) {
      // If API returns error, return empty matches array for graceful degradation
      console.error('Matches API error:', response.status, response.statusText);
      return NextResponse.json({
        data: [],
        total: 0,
        limit: parseInt(limit),
        offset: parseInt(offset),
        next_offset: null,
      });
    }
    
    const data = await response.json();
    
    // Transform backend match format to frontend format if needed
    const matches = (data.data || data || []).map((match: any) => ({
      id: match.id || match._id,
      game: match.game_id || 'Counter-Strike 2',
      gameIcon: getGameIcon(match.game_id),
      map: match.map || 'Unknown',
      mode: match.mode || 'Competitive',
      teams: transformTeams(match),
      status: getMatchStatus(match),
      timestamp: new Date(match.created_at || match.timestamp),
      duration: match.duration,
      tournament: match.tournament?.name,
    }));
    
    return NextResponse.json({
      data: matches,
      total: data.total || matches.length,
      limit: parseInt(limit),
      offset: parseInt(offset),
      next_offset: data.next_offset,
    });
  } catch (error) {
    console.error('Matches API error:', error);
    // Return empty array for graceful degradation
    return NextResponse.json({
      data: [],
      total: 0,
      limit: parseInt(limit),
      offset: parseInt(offset),
      next_offset: null,
    });
  }
}

function getGameIcon(gameId: string): string {
  const gameIcons: Record<string, string> = {
    'cs2': 'simple-icons:counterstrike',
    'cs': 'simple-icons:counterstrike',
    'valorant': 'simple-icons:valorant',
    'lol': 'simple-icons:leagueoflegends',
    'dota2': 'simple-icons:dota2',
    'apex': 'simple-icons:apexlegends',
    'overwatch': 'simple-icons:overwatch',
  };
  return gameIcons[gameId?.toLowerCase()] || 'solar:gameboy-bold';
}

function transformTeams(match: any): any[] {
  if (match.scoreboard?.team_scoreboards) {
    return match.scoreboard.team_scoreboards.map((team: any) => ({
      name: team.name || 'Unknown Team',
      score: team.score || 0,
      players: (team.players || []).map((player: any) => ({
        name: player.display_name || player.name || 'Player',
        avatar: player.avatar,
      })),
    }));
  }
  
  // Fallback for minimal match data
  return [
    { name: 'Team 1', score: 0, players: [] },
    { name: 'Team 2', score: 0, players: [] },
  ];
}

function getMatchStatus(match: any): 'live' | 'completed' | 'upcoming' {
  if (match.status) {
    if (match.status === 'live' || match.status === 'in_progress') return 'live';
    if (match.status === 'completed' || match.status === 'finished') return 'completed';
    if (match.status === 'upcoming' || match.status === 'scheduled') return 'upcoming';
  }
  
  // Infer from match data
  const now = new Date();
  const matchTime = new Date(match.created_at || match.timestamp);
  
  if (match.winner || match.final_score) return 'completed';
  if (matchTime > now) return 'upcoming';
  
  return 'completed';
}


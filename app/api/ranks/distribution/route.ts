/**
 * Rank Distribution API Route
 * Fetches rank distribution data from the Replay API backend
 */

import { NextRequest, NextResponse } from 'next/server';

const REPLAY_API_URL = process.env.REPLAY_API_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const gameId = searchParams.get('game_id') || 'cs2';
  
  try {
    const apiUrl = `${REPLAY_API_URL}/ranks/distribution?game_id=${gameId}`;
    
    const response = await fetch(apiUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });
    
    if (!response.ok) {
      // Return default distribution for graceful degradation
      return NextResponse.json([
        { rank: 'Unranked', count: 0, percentage: 0 },
        { rank: 'Bronze', count: 0, percentage: 0 },
        { rank: 'Silver', count: 0, percentage: 0 },
        { rank: 'Gold', count: 0, percentage: 0 },
        { rank: 'Platinum', count: 0, percentage: 0 },
        { rank: 'Diamond', count: 0, percentage: 0 },
        { rank: 'Master', count: 0, percentage: 0 },
        { rank: 'Grandmaster', count: 0, percentage: 0 },
        { rank: 'Challenger', count: 0, percentage: 0 },
      ]);
    }
    
    const data = await response.json();
    
    // Calculate percentages if not present
    const total = (data || []).reduce((sum: number, entry: any) => sum + (entry.count || 0), 0);
    
    const distribution = (data || []).map((entry: any) => ({
      rank: entry.rank,
      count: entry.count || 0,
      percentage: total > 0 ? Math.round((entry.count || 0) / total * 100 * 10) / 10 : 0,
    }));
    
    return NextResponse.json(distribution);
  } catch (error) {
    console.error('Rank distribution API error:', error);
    return NextResponse.json([]);
  }
}


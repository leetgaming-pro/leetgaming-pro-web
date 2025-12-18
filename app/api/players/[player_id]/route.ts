/**
 * Player Profile API Route
 * Handles player profile CRUD operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

const REPLAY_API_URL = process.env.REPLAY_API_URL || 'http://localhost:3001';

// GET /api/players/[player_id] - Get player profile
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ player_id: string }> }
) {
  const resolvedParams = await params;
  const playerId = resolvedParams.player_id;
  
  try {
    const response = await fetch(`${REPLAY_API_URL}/players/${playerId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Player not found' },
          { status: 404 }
        );
      }
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Player profile GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch player profile' },
      { status: 500 }
    );
  }
}

// PUT /api/players/[player_id] - Update player profile (including avatar)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ player_id: string }> }
) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
  
  const resolvedParams = await params;
  const playerId = resolvedParams.player_id;
  
  try {
    const body = await request.json();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (session.user.rid) {
      headers['Authorization'] = `Bearer ${session.user.rid}`;
    }
    
    const response = await fetch(`${REPLAY_API_URL}/players/${playerId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Player not found' },
          { status: 404 }
        );
      }
      if (response.status === 409) {
        return NextResponse.json(
          { error: 'Nickname or URL already taken' },
          { status: 409 }
        );
      }
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Player profile PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to update player profile' },
      { status: 500 }
    );
  }
}

// DELETE /api/players/[player_id] - Delete player profile
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ player_id: string }> }
) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
  
  const resolvedParams = await params;
  const playerId = resolvedParams.player_id;
  
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (session.user.rid) {
      headers['Authorization'] = `Bearer ${session.user.rid}`;
    }
    
    const response = await fetch(`${REPLAY_API_URL}/players/${playerId}`, {
      method: 'DELETE',
      headers,
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Player not found' },
          { status: 404 }
        );
      }
      throw new Error(`API error: ${response.status}`);
    }
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Player profile DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete player profile' },
      { status: 500 }
    );
  }
}

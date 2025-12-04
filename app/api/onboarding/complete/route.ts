/**
 * Onboarding Complete API Route
 * POST /api/onboarding/complete - Save onboarding data and mark complete
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/options';
import { forwardAuthenticatedRequest } from '@/lib/auth/server-auth';

const BACKEND_URL = process.env.REPLAY_API_URL || 'http://localhost:30800';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { profile, gamingPreferences, selectedPlan } = body;

    // Update user profile
    if (profile) {
      await forwardAuthenticatedRequest(
        `${BACKEND_URL}/players/me`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            display_name: profile.displayName,
            bio: profile.bio,
            country: profile.country,
            avatar_url: profile.avatarUrl,
          }),
        },
        session
      );
    }

    // Update gaming preferences
    if (gamingPreferences) {
      await forwardAuthenticatedRequest(
        `${BACKEND_URL}/players/me/preferences`,
        {
          method: 'PUT',
          body: JSON.stringify({
            games: gamingPreferences.games,
            primary_game: gamingPreferences.primaryGame,
            region: gamingPreferences.region,
            skill_level: gamingPreferences.skillLevel,
            play_style: gamingPreferences.playStyle,
            looking_for_team: gamingPreferences.lookingForTeam,
          }),
        },
        session
      );
    }

    // Mark onboarding as complete
    await forwardAuthenticatedRequest(
      `${BACKEND_URL}/players/me/onboarding`,
      {
        method: 'POST',
        body: JSON.stringify({
          completed: true,
          selected_plan: selectedPlan,
          completed_at: new Date().toISOString(),
        }),
      },
      session
    );

    // If paid plan selected, redirect to checkout would happen on client
    return NextResponse.json({
      success: true,
      data: {
        onboardingComplete: true,
        selectedPlan,
        requiresPayment: selectedPlan !== 'free',
      },
    });
  } catch (error) {
    console.error('[API] Onboarding complete error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to complete onboarding' },
      { status: 500 }
    );
  }
}

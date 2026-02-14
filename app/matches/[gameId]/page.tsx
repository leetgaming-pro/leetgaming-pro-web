"use client";

/**
 * Game-specific Matches Page - Redirects to main matches with game filter
 * Handles routes like /matches/cs2, /matches/valorant etc.
 */

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function GameMatchesPage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.gameId as string;

  useEffect(() => {
    // Redirect to main matches page with game filter
    // The main matches page will handle the game filter via query params
    router.replace(`/matches?game=${gameId}`);
  }, [gameId, router]);

  // Show nothing while redirecting
  return null;
}

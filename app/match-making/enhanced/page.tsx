/**
 * Enhanced Matchmaking - REDIRECTED
 * This page has been merged into the main match-making page.
 * Keeping this file for backward compatibility - it redirects to the main page.
 */

import { redirect } from "next/navigation";

export default function EnhancedMatchmakingPage() {
  // Redirect to the main matchmaking wizard which now includes tier selection
  redirect("/match-making");
}

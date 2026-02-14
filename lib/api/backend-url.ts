/**
 * Centralized Backend URL Resolution
 *
 * ALL API routes MUST use this module to get backend URLs.
 * This eliminates inconsistent fallbacks (30800, 3001, api.leetgaming.pro)
 * and ensures a single source of truth for backend connectivity.
 *
 * Priority order:
 *   1. REPLAY_API_URL env var (explicit server-side config)
 *   2. NEXT_PUBLIC_REPLAY_API_URL env var (shared config)
 *   3. http://localhost:8080 (local development default)
 *
 * For the match-making microservice:
 *   1. MATCH_MAKING_API_URL env var
 *   2. http://localhost:4991 (local development default)
 */

/**
 * Get the replay-api backend URL for server-side API route proxying.
 * Use this in ALL API routes instead of inline fallback URLs.
 */
export function getBackendUrl(): string {
  return (
    process.env.REPLAY_API_URL ||
    process.env.NEXT_PUBLIC_REPLAY_API_URL ||
    "http://localhost:8080"
  );
}

/**
 * Get the match-making-api microservice URL.
 * This is a separate service from replay-api.
 */
export function getMatchMakingApiUrl(): string {
  return process.env.MATCH_MAKING_API_URL || "http://localhost:4991";
}

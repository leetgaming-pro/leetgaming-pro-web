/**
 * Global Search Hook
 * Unified search across all entities: Replays, Players, Teams, Matches
 *
 * Features:
 * - Progressive loading: shows results as they arrive (no waiting for all)
 * - Dynamic fields: uses search schema from backend (cached)
 * - Parallel searches: queries all entity types simultaneously
 * - Smart defaults: uses default_search_fields from schema
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { useSDK } from "@/contexts/sdk-context";
import { logger } from "@/lib/logger";
import { ReplayFile } from "@/types/replay-api/replay-file";
import {
  EntitySearchSchema,
  EntityTypes,
} from "@/types/replay-api/search-schema.sdk";
import { ApiError } from "@/types/replay-api/replay-api.client";

export interface GlobalSearchResult {
  type: "replay" | "player" | "team" | "match";
  id: string;
  title: string;
  description: string;
  href: string;
  metadata?: Record<string, unknown>;
}

export interface UseGlobalSearchResult {
  results: GlobalSearchResult[];
  loading: boolean;
  error: string | null;
  schemaLoaded: boolean;
  search: (query: string) => Promise<void>;
  clear: () => void;
}

// Search configuration per entity type (reserved for future use when
// SDK search is refactored to a config-driven approach)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface EntitySearchConfig {
  type: GlobalSearchResult["type"];
  entityType: string;
  searchFn: (term: string, fields: string[]) => Promise<unknown[]>;
  transformFn: (items: unknown[]) => GlobalSearchResult[];
  maxResults: number;
}

/**
 * Transform replay files to search results
 */
function transformReplays(replays: unknown[]): GlobalSearchResult[] {
  return (replays as any[]).map((replay) => {
    const networkId = replay.network_id || replay.networkId;
    const gameId = replay.game_id || replay.gameId || "cs2";
    const createdAt = replay.created_at || replay.createdAt;
    return {
      type: "replay" as const,
      id: replay.id,
      title: `Replay: ${networkId || replay.id?.substring(0, 8)}`,
      description: `${gameId.toUpperCase()} • ${
        replay.status || "Processed"
      } • ${createdAt ? new Date(createdAt).toLocaleDateString() : "N/A"}`,
      href: `/matches/${gameId}/${replay.id}`,
      metadata: {
        gameId,
        networkId,
        status: replay.status,
        createdAt,
      },
    };
  });
}

interface PlayerSearchItem {
  id?: string;
  user_id?: string;
  steam_name?: string;
  username?: string;
  nickname?: string;
  steam_id?: string;
  profiles?: unknown[];
}

/**
 * Transform player profiles to search results
 */
function transformPlayers(players: unknown[]): GlobalSearchResult[] {
  return (players as PlayerSearchItem[]).map((player) => ({
    type: "player" as const,
    id: player.id || player.user_id || "",
    title:
      player.nickname ||
      player.steam_name ||
      player.username ||
      "Unknown Player",
    description: `Steam ID: ${player.steam_id || "N/A"} • ${
      player.profiles?.length || 0
    } profiles`,
    href: `/players/${player.id || player.user_id}`,
    metadata: {
      steamId: player.steam_id,
      profiles: player.profiles,
    },
  }));
}

import { Squad } from "@/types/replay-api/entities.types";

/**
 * Transform squads/teams to search results
 */
function transformTeams(teams: unknown[]): GlobalSearchResult[] {
  return (teams as Squad[]).map((team) => ({
    type: "team" as const,
    id: team.id,
    title: team.name || "Unnamed Team",
    description: `${team.symbol ? `[${team.symbol}]` : ""} ${
      team.membership?.length || 0
    } members • Created ${
      team.created_at ? new Date(team.created_at).toLocaleDateString() : "N/A"
    }`,
    href: `/teams/${team.id}`,
    metadata: {
      symbol: team.symbol,
      membership: team.membership,
      createdAt: team.created_at,
    },
  }));
}

interface MatchSearchItem {
  id?: string;
  match_id?: string;
  title?: string;
  game_id?: string;
  map_name?: string;
  status?: string;
  played_at?: string;
}

/**
 * Transform matches to search results
 */
function transformMatches(matches: unknown[]): GlobalSearchResult[] {
  return (matches as MatchSearchItem[]).map((match) => ({
    type: "match" as const,
    id: match.id || match.match_id || "",
    title:
      match.title ||
      match.map_name ||
      `Match ${match.id?.substring(0, 8) || "Unknown"}`,
    description: `${match.game_id?.toUpperCase() || "CS2"} • ${
      match.status || "Completed"
    } • ${
      match.played_at ? new Date(match.played_at).toLocaleDateString() : "N/A"
    }`,
    href: `/matches/${match.game_id || "cs2"}/${match.id || match.match_id}`,
    metadata: {
      gameId: match.game_id,
      mapName: match.map_name,
      status: match.status,
      playedAt: match.played_at,
    },
  }));
}

/**
 * Global search hook with progressive loading and dynamic schema
 * Results appear as each API responds - no waiting for all
 */
export function useGlobalSearch(): UseGlobalSearchResult {
  const { sdk } = useSDK();
  const [results, setResults] = useState<GlobalSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [schemaLoaded, setSchemaLoaded] = useState(false);
  const [entitySchemas, setEntitySchemas] = useState<
    Record<string, EntitySearchSchema>
  >({});

  const abortRef = useRef<AbortController | null>(null);
  const searchIdRef = useRef<number>(0);

  // Load search schema on mount
  useEffect(() => {
    const loadSchema = async () => {
      try {
        const schema = await sdk.searchSchema.getSchema();
        if (schema) {
          setEntitySchemas(schema.entities);
          setSchemaLoaded(true);
          logger.info(
            "[useGlobalSearch] Schema loaded:",
            Object.keys(schema.entities)
          );
        }
      } catch (err) {
        logger.warn(
          "[useGlobalSearch] Failed to load schema, using fallback:",
          err
        );
        // Use fallback defaults if schema fetch fails
        setSchemaLoaded(true);
      }
    };
    loadSchema();
  }, [sdk]);

  // Get default search fields for an entity type
  const getSearchFields = useCallback(
    (entityType: string): string[] => {
      const schema = entitySchemas[entityType];
      if (schema?.default_search_fields?.length) {
        return schema.default_search_fields;
      }
      // Fallback defaults if schema not loaded
      const fallbacks: Record<string, string[]> = {
        players: ["Nickname", "Description"],
        teams: ["Name", "Tag", "Description"],
        replays: ["Header"],
        matches: ["MapName"],
      };
      return fallbacks[entityType] || [];
    },
    [entitySchemas]
  );

  const search = useCallback(
    async (query: string) => {
      if (!query || query.trim().length < 2) {
        setResults([]);
        return;
      }

      // Increment search ID to track this search session
      const currentSearchId = ++searchIdRef.current;

      setLoading(true);
      setError(null);
      setResults([]); // Clear previous results

      // Abort previous in-flight requests
      if (abortRef.current) {
        abortRef.current.abort();
      }
      const controller = new AbortController();
      abortRef.current = controller;

      const searchTerm = query.trim();
      let completedCount = 0;
      let rateLimitHit = false;
      let rateLimitRetryAfter = 0;
      const totalSearches = 4; // players, teams, replays, matches

      // Helper to add results progressively
      const addResults = (newResults: GlobalSearchResult[]) => {
        // Only update if this is still the current search
        if (currentSearchId !== searchIdRef.current) return;
        if (newResults.length > 0) {
          setResults((prev) => [...prev, ...newResults]);
        }
      };

      // Helper to handle API errors with proper user feedback
      const handleError = (
        err: ApiError | Error | unknown,
        entityType: string
      ) => {
        if ((err as Error)?.name === "AbortError") return;

        const apiError = err as ApiError;

        // Check for rate limiting
        if (apiError?.isRateLimited || apiError?.status === 429) {
          rateLimitHit = true;
          rateLimitRetryAfter = apiError?.retryAfterSeconds || 60;
          logger.warn(
            `[useGlobalSearch] Rate limited on ${entityType}, retry after ${rateLimitRetryAfter}s`
          );
          return;
        }

        // Log other errors but don't show to user (partial search results are still useful)
        if (apiError?.isValidationError) {
          logger.warn(
            `[useGlobalSearch] Validation error for ${entityType}:`,
            apiError.message
          );
        } else if (apiError?.isAuthError) {
          logger.warn(
            `[useGlobalSearch] Auth error for ${entityType}:`,
            apiError.message
          );
        } else {
          logger.warn(
            `[useGlobalSearch] Search failed for ${entityType}:`,
            err
          );
        }
      };

      // Helper to mark a search as complete
      const markComplete = () => {
        completedCount++;
        if (
          completedCount >= totalSearches &&
          currentSearchId === searchIdRef.current
        ) {
          setLoading(false);

          // Show rate limit error to user if any search was rate limited
          if (rateLimitHit) {
            setError(
              `Too many searches. Please wait ${rateLimitRetryAfter} seconds before searching again.`
            );
          }
        }
      };

      // Build search params with dynamic fields
      const buildParams = (
        entityType: string,
        additionalFilters?: Record<string, string>
      ) => {
        const params = new URLSearchParams();
        params.append("q", searchTerm);
        const fields = getSearchFields(entityType);
        if (fields.length > 0) {
          params.append("search_fields", fields.join(","));
        }
        params.append("limit", "5");
        if (additionalFilters) {
          Object.entries(additionalFilters).forEach(([k, v]) =>
            params.append(k, v)
          );
        }
        return params.toString();
      };

      // Search players - using dynamic fields
      sdk.client
        .get<PlayerSearchItem[]>(`/players?${buildParams(EntityTypes.PLAYERS)}`)
        .then((response) => {
          if (response.error) {
            handleError(response.error, "players");
            return;
          }
          if (response.data?.length) {
            addResults(transformPlayers(response.data.slice(0, 5)));
          }
        })
        .catch((err) => handleError(err, "players"))
        .finally(markComplete);

      // Search teams/squads - using dynamic fields
      sdk.client
        .get<Squad[]>(`/teams?${buildParams(EntityTypes.TEAMS)}`)
        .then((response) => {
          if (response.error) {
            handleError(response.error, "teams");
            return;
          }
          if (response.data?.length) {
            addResults(transformTeams(response.data.slice(0, 5)));
          }
        })
        .catch((err) => handleError(err, "teams"))
        .finally(markComplete);

      // Search replays - using dynamic fields from schema
      sdk.client
        .get<ReplayFile[]>(
          `/games/cs2/replays?${buildParams(EntityTypes.REPLAYS)}`
        )
        .then((response) => {
          if (response.error) {
            handleError(response.error, "replays");
            return;
          }
          if (response.data?.length) {
            addResults(transformReplays(response.data.slice(0, 5)));
          }
        })
        .catch((err) => handleError(err, "replays"))
        .finally(markComplete);

      // Search matches - using dynamic fields from schema
      sdk.client
        .get<MatchSearchItem[]>(
          `/games/cs2/matches?${buildParams(EntityTypes.MATCHES)}`
        )
        .then((response) => {
          if (response.error) {
            handleError(response.error, "matches");
            return;
          }
          if (response.data?.length) {
            addResults(transformMatches(response.data.slice(0, 5)));
          }
        })
        .catch((err) => handleError(err, "matches"))
        .finally(markComplete);
    },
    [sdk, getSearchFields]
  );

  const clear = useCallback(() => {
    setResults([]);
    setError(null);
    if (abortRef.current) {
      abortRef.current.abort();
    }
  }, []);

  return {
    results,
    loading,
    error,
    schemaLoaded,
    search,
    clear,
  };
}

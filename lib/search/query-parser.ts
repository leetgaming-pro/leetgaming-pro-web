/**
 * @fileoverview Intelligent Search Query Parser
 * @module lib/search/query-parser
 *
 * Parses search queries to extract:
 * - Game type filtering (valorant, cs2, lol, etc.)
 * - Entity type hints (player, team, match, replay)
 * - Clean search terms
 *
 * Supports natural language patterns like:
 * - "valorant teams"
 * - "cs2 NightHawk"
 * - "apex legends players"
 * - "counter-strike matches"
 */

import type { GameId } from "@/types/games";

/**
 * Game aliases for fuzzy matching
 * Maps common variations to canonical game IDs
 */
export const GAME_ALIASES: Record<string, GameId> = {
  // Counter-Strike 2
  cs2: "cs2",
  cs: "cs2",
  csgo: "cs2",
  "counter-strike": "cs2",
  "counter strike": "cs2",
  counterstrike: "cs2",

  // Valorant
  valorant: "valorant",
  val: "valorant",
  valo: "valorant",

  // League of Legends
  lol: "lol",
  league: "lol",
  "league of legends": "lol",
  leagueoflegends: "lol",

  // Apex Legends
  apex: "apex",
  "apex legends": "apex",
  apexlegends: "apex",

  // Fortnite
  fortnite: "fortnite",
  fn: "fortnite",
  fort: "fortnite",

  // Overwatch 2
  overwatch2: "overwatch2",
  overwatch: "overwatch2",
  ow: "overwatch2",
  ow2: "overwatch2",

  // PUBG
  pubg: "pubg",
  battlegrounds: "pubg",
  playerunknown: "pubg",

  // Dota 2
  dota2: "dota2",
  dota: "dota2",

  // Rainbow Six
  r6: "r6",
  rainbow: "r6",
  "rainbow six": "r6",
  rainbowsix: "r6",
  siege: "r6",

  // Free Fire
  freefire: "freefire",
  "free fire": "freefire",
  ff: "freefire",
  garena: "freefire",

  // Tibia
  tibia: "tibia",
};

/**
 * Entity type keywords for filtering
 */
export const ENTITY_KEYWORDS: Record<
  string,
  "replay" | "player" | "team" | "match"
> = {
  // Replay
  replay: "replay",
  replays: "replay",
  demo: "replay",
  demos: "replay",
  recording: "replay",
  recordings: "replay",
  vod: "replay",
  vods: "replay",

  // Player
  player: "player",
  players: "player",
  user: "player",
  users: "player",
  pro: "player",
  pros: "player",
  gamer: "player",
  gamers: "player",

  // Team
  team: "team",
  teams: "team",
  squad: "team",
  squads: "team",
  clan: "team",
  clans: "team",
  org: "team",
  organization: "team",
  roster: "team",

  // Match
  match: "match",
  matches: "match",
  game: "match",
  games: "match",
  scrim: "match",
  scrims: "match",
  tournament: "match",
};

/**
 * Game display configuration for UI
 */
export const GAME_DISPLAY_CONFIG: Record<
  GameId,
  {
    name: string;
    shortName: string;
    icon: string;
    color: string;
  }
> = {
  cs2: {
    name: "Counter-Strike 2",
    shortName: "CS2",
    icon: "simple-icons:counterstrike",
    color: "#F7B93E",
  },
  valorant: {
    name: "Valorant",
    shortName: "VAL",
    icon: "simple-icons:valorant",
    color: "#FF4654",
  },
  lol: {
    name: "League of Legends",
    shortName: "LoL",
    icon: "simple-icons:leagueoflegends",
    color: "#C89B3C",
  },
  apex: {
    name: "Apex Legends",
    shortName: "APEX",
    icon: "simple-icons:apexlegends",
    color: "#DA292A",
  },
  fortnite: {
    name: "Fortnite",
    shortName: "FN",
    icon: "simple-icons:fortnite",
    color: "#00D4FF",
  },
  overwatch2: {
    name: "Overwatch 2",
    shortName: "OW2",
    icon: "simple-icons:overwatch",
    color: "#FA9C1E",
  },
  pubg: {
    name: "PUBG",
    shortName: "PUBG",
    icon: "simple-icons:pubg",
    color: "#F2A900",
  },
  dota2: {
    name: "Dota 2",
    shortName: "DOTA",
    icon: "simple-icons:dota2",
    color: "#BE1E2D",
  },
  r6: {
    name: "Rainbow Six",
    shortName: "R6",
    icon: "simple-icons:ubisoft",
    color: "#409BD7",
  },
  freefire: {
    name: "Free Fire",
    shortName: "FF",
    icon: "mdi:fire",
    color: "#FF6B00",
  },
  tibia: {
    name: "Tibia",
    shortName: "TIB",
    icon: "mdi:sword-cross",
    color: "#4CAF50",
  },
};

/**
 * Parsed query result
 */
export interface ParsedSearchQuery {
  /** Original raw query */
  original: string;
  /** Clean search term without filters */
  searchTerm: string;
  /** Detected game ID (if any) */
  gameId: GameId | null;
  /** Detected game display info */
  gameDisplay: (typeof GAME_DISPLAY_CONFIG)[GameId] | null;
  /** Detected entity type filter (if any) */
  entityType: "replay" | "player" | "team" | "match" | null;
  /** Whether query contains game filter */
  hasGameFilter: boolean;
  /** Whether query contains entity filter */
  hasEntityFilter: boolean;
  /** Confidence score (0-1) for the parse */
  confidence: number;
  /** Suggestions for better search */
  suggestions: string[];
}

/**
 * Parse a search query to extract filters and clean search term
 *
 * @param query - Raw user input
 * @returns Parsed query with extracted filters
 *
 * @example
 * parseSearchQuery("valorant teams")
 * // Returns: { gameId: "valorant", entityType: "team", searchTerm: "" }
 *
 * @example
 * parseSearchQuery("cs2 NightHawk")
 * // Returns: { gameId: "cs2", searchTerm: "NightHawk" }
 */
export function parseSearchQuery(query: string): ParsedSearchQuery {
  const result: ParsedSearchQuery = {
    original: query,
    searchTerm: query.trim(),
    gameId: null,
    gameDisplay: null,
    entityType: null,
    hasGameFilter: false,
    hasEntityFilter: false,
    confidence: 0,
    suggestions: [],
  };

  if (!query || query.trim().length < 2) {
    return result;
  }

  const normalizedQuery = query.toLowerCase().trim();
  const words = normalizedQuery.split(/\s+/);
  const originalWords = query.trim().split(/\s+/); // Keep original case

  // Track which words are part of filters
  const filterWordIndices = new Set<number>();

  // Check for multi-word game names first (e.g., "counter-strike", "apex legends")
  for (const [alias, gameId] of Object.entries(GAME_ALIASES)) {
    if (alias.includes(" ") || alias.includes("-")) {
      const aliasNormalized = alias.replace(/-/g, " ").toLowerCase();
      if (normalizedQuery.includes(aliasNormalized)) {
        result.gameId = gameId;
        result.gameDisplay = GAME_DISPLAY_CONFIG[gameId];
        result.hasGameFilter = true;
        result.confidence += 0.4;

        // Remove the matched alias from search term (case-insensitive)
        const regex = new RegExp(alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
        result.searchTerm = result.searchTerm.replace(regex, "").trim();
        break;
      }
    }
  }

  // Check for single-word game matches
  if (!result.gameId) {
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const gameId = GAME_ALIASES[word];
      if (gameId) {
        result.gameId = gameId;
        result.gameDisplay = GAME_DISPLAY_CONFIG[gameId];
        result.hasGameFilter = true;
        result.confidence += 0.4;
        filterWordIndices.add(i);
        break;
      }
    }
  }

  // Check for entity type keywords
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const entityType = ENTITY_KEYWORDS[word];
    if (entityType && !filterWordIndices.has(i)) {
      result.entityType = entityType;
      result.hasEntityFilter = true;
      result.confidence += 0.3;
      filterWordIndices.add(i);
      break;
    }
  }

  // Build clean search term (removing filter words) - preserve original case
  if (filterWordIndices.size > 0) {
    const cleanWords = originalWords.filter((_, i) => !filterWordIndices.has(i));
    result.searchTerm = cleanWords.join(" ").trim();

    // If we extracted meaningful filters but no remaining search term,
    // the user is likely browsing (e.g., "valorant teams")
    if (result.searchTerm.length === 0 && (result.hasGameFilter || result.hasEntityFilter)) {
      result.confidence += 0.2;
    }
  }

  // If no search term remains but we have filters, it's still a valid search
  if (result.searchTerm.length === 0 && result.hasGameFilter) {
    result.confidence = Math.min(result.confidence + 0.1, 1);
  }

  // Add suggestions
  if (result.searchTerm.length > 0) {
    if (!result.hasGameFilter) {
      result.suggestions.push("Add a game name to filter results (e.g., 'cs2', 'valorant')");
    }
    if (!result.hasEntityFilter) {
      result.suggestions.push("Add 'players', 'teams', or 'matches' to narrow results");
    }
  }

  // Boost confidence for complete queries
  if (result.searchTerm.length >= 3) {
    result.confidence += 0.2;
  }

  result.confidence = Math.min(result.confidence, 1);

  return result;
}

/**
 * Get all supported game IDs
 */
export function getSupportedGameIds(): GameId[] {
  return Object.keys(GAME_DISPLAY_CONFIG) as GameId[];
}

/**
 * Check if a game ID is valid
 */
export function isValidGameId(id: string): id is GameId {
  return id in GAME_DISPLAY_CONFIG;
}

/**
 * Get game display info by ID
 */
export function getGameDisplayInfo(
  gameId: GameId
): (typeof GAME_DISPLAY_CONFIG)[GameId] | null {
  return GAME_DISPLAY_CONFIG[gameId] || null;
}

/**
 * Suggest games based on partial input
 */
export function suggestGames(partial: string): GameId[] {
  if (!partial || partial.length < 1) return [];

  const lower = partial.toLowerCase();
  const matches = new Set<GameId>();

  // Check aliases
  for (const [alias, gameId] of Object.entries(GAME_ALIASES)) {
    if (alias.startsWith(lower) || alias.includes(lower)) {
      matches.add(gameId);
    }
  }

  // Check display names
  for (const [gameId, config] of Object.entries(GAME_DISPLAY_CONFIG)) {
    if (
      config.name.toLowerCase().includes(lower) ||
      config.shortName.toLowerCase().includes(lower)
    ) {
      matches.add(gameId as GameId);
    }
  }

  return Array.from(matches);
}

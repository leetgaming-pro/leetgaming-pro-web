/**
 * Demo data for the professional player profile features.
 *
 * Used as a fallback while the backend API endpoints for
 * player skills, traits, and team history are being built.
 *
 * Mirrors the seed data in e2e/db-init/01-seed-data.js so the
 * UI renders the same dataset whether served by the API or locally.
 *
 * Remove this module once the Go API serves the real data.
 */

import {
  PlayerSkill,
  PlayerTrait,
  TeamHistoryEntry,
  TeamRosterHistoryEntry,
  SKILL_DEFINITIONS,
  TRAIT_DEFINITIONS,
  SkillCategory,
  TraitTier,
} from "@/types/replay-api/player-profile.types";

// ============================================================================
// Well-known player IDs from seed data
// ============================================================================
const KNOWN_PLAYERS: Record<
  string,
  {
    skills: Array<{ key: string; level: number }>;
    traits: Array<{ key: string; tier: TraitTier }>;
    history: TeamHistoryEntry[];
  }
> = {};

// Helper to generate a stable "id" from player + key
function stableId(playerId: string, kind: string, key: string): string {
  // Simple deterministic hash-ish id
  const raw = `${playerId}-${kind}-${key}`;
  let h = 0;
  for (let i = 0; i < raw.length; i++) {
    h = ((h << 5) - h + raw.charCodeAt(i)) | 0;
  }
  return `demo-${Math.abs(h).toString(16).padStart(8, "0")}`;
}

// Zyx42 – CS2 captain
KNOWN_PLAYERS["44444444-4444-4444-4444-444444444401"] = {
  skills: [
    { key: "aim_precision", level: 88 },
    { key: "spray_control", level: 82 },
    { key: "movement", level: 79 },
    { key: "map_awareness", level: 91 },
    { key: "game_sense", level: 85 },
    { key: "trade_fragging", level: 76 },
    { key: "shot_calling", level: 93 },
    { key: "clutch_mastery", level: 87 },
    { key: "utility_usage", level: 74 },
    { key: "flash_assists", level: 71 },
    { key: "impact_rating", level: 84 },
    { key: "consistency_score", level: 80 },
  ],
  traits: [
    { key: "clutch_king", tier: "gold" },
    { key: "team_leader", tier: "diamond" },
    { key: "consistent_performer", tier: "gold" },
    { key: "champion", tier: "silver" },
  ],
  history: [
    {
      squad_id: "66666666-6666-6666-6666-666666666601",
      squad_name: "Alpha Force",
      squad_tag: "AF",
      squad_logo_uri:
        "https://api.dicebear.com/7.x/shapes/svg?seed=alphaforce",
      role: "member",
      joined_at: new Date(Date.now() - 540 * 86400000).toISOString(),
      left_at: new Date(Date.now() - 270 * 86400000).toISOString(),
      matches_played: 120,
      win_rate: 0.52,
      achievements: [],
    },
    {
      squad_id: "55555555-5555-5555-5555-555555555501",
      squad_name: "NeoStrike",
      squad_tag: "NEO",
      squad_logo_uri:
        "https://api.dicebear.com/7.x/shapes/svg?seed=neostrike",
      role: "captain",
      joined_at: new Date(Date.now() - 270 * 86400000).toISOString(),
      matches_played: 245,
      win_rate: 0.68,
      achievements: [
        "ESAP Winter Cup 2024 - 1st",
        "LeetGaming Pro League S2 - 2nd",
      ],
    },
  ],
};

// NightHawk – CS2 AWPer
KNOWN_PLAYERS["44444444-4444-4444-4444-444444444402"] = {
  skills: [
    { key: "aim_precision", level: 95 },
    { key: "spray_control", level: 68 },
    { key: "movement", level: 72 },
    { key: "map_awareness", level: 78 },
    { key: "game_sense", level: 82 },
    { key: "trade_fragging", level: 65 },
    { key: "shot_calling", level: 55 },
    { key: "clutch_mastery", level: 78 },
    { key: "utility_usage", level: 62 },
    { key: "flash_assists", level: 58 },
    { key: "impact_rating", level: 89 },
    { key: "consistency_score", level: 73 },
  ],
  traits: [
    { key: "headshot_machine", tier: "diamond" },
    { key: "clutch_king", tier: "silver" },
    { key: "consistent_performer", tier: "gold" },
  ],
  history: [
    {
      squad_id: "66666666-6666-6666-6666-666666666602",
      squad_name: "Beta Ops",
      squad_tag: "BOP",
      squad_logo_uri: "https://api.dicebear.com/7.x/shapes/svg?seed=betaops",
      role: "member",
      joined_at: new Date(Date.now() - 450 * 86400000).toISOString(),
      left_at: new Date(Date.now() - 300 * 86400000).toISOString(),
      matches_played: 95,
      win_rate: 0.49,
      achievements: [],
    },
    {
      squad_id: "55555555-5555-5555-5555-555555555501",
      squad_name: "NeoStrike",
      squad_tag: "NEO",
      squad_logo_uri:
        "https://api.dicebear.com/7.x/shapes/svg?seed=neostrike",
      role: "member",
      joined_at: new Date(Date.now() - 300 * 86400000).toISOString(),
      matches_played: 210,
      win_rate: 0.68,
      achievements: ["ESAP Winter Cup 2024 - 1st"],
    },
  ],
};

// ShadowByte – CS2 support
KNOWN_PLAYERS["44444444-4444-4444-4444-444444444403"] = {
  skills: [
    { key: "aim_precision", level: 71 },
    { key: "spray_control", level: 69 },
    { key: "movement", level: 74 },
    { key: "map_awareness", level: 83 },
    { key: "game_sense", level: 80 },
    { key: "trade_fragging", level: 85 },
    { key: "shot_calling", level: 60 },
    { key: "clutch_mastery", level: 55 },
    { key: "utility_usage", level: 92 },
    { key: "flash_assists", level: 88 },
    { key: "impact_rating", level: 72 },
    { key: "consistency_score", level: 77 },
  ],
  traits: [
    { key: "utility_master", tier: "diamond" },
    { key: "consistent_performer", tier: "silver" },
  ],
  history: [
    {
      squad_id: "66666666-6666-6666-6666-666666666603",
      squad_name: "Gamma Squad",
      squad_tag: "GMA",
      squad_logo_uri:
        "https://api.dicebear.com/7.x/shapes/svg?seed=gammasquad",
      role: "member",
      joined_at: new Date(Date.now() - 600 * 86400000).toISOString(),
      left_at: new Date(Date.now() - 350 * 86400000).toISOString(),
      matches_played: 140,
      win_rate: 0.55,
      achievements: ["Community League S1 - 3rd"],
    },
    {
      squad_id: "55555555-5555-5555-5555-555555555501",
      squad_name: "NeoStrike",
      squad_tag: "NEO",
      squad_logo_uri:
        "https://api.dicebear.com/7.x/shapes/svg?seed=neostrike",
      role: "member",
      joined_at: new Date(Date.now() - 350 * 86400000).toISOString(),
      matches_played: 200,
      win_rate: 0.68,
      achievements: [
        "ESAP Winter Cup 2024 - 1st",
        "LeetGaming Pro League S2 - 2nd",
      ],
    },
  ],
};

// Kq7Runner – Valorant duelist
KNOWN_PLAYERS["44444444-4444-4444-4444-444444444501"] = {
  skills: [
    { key: "aim_precision", level: 90 },
    { key: "spray_control", level: 84 },
    { key: "movement", level: 86 },
    { key: "map_awareness", level: 82 },
    { key: "game_sense", level: 88 },
    { key: "trade_fragging", level: 79 },
    { key: "shot_calling", level: 75 },
    { key: "clutch_mastery", level: 91 },
    { key: "utility_usage", level: 78 },
    { key: "flash_assists", level: 73 },
    { key: "impact_rating", level: 86 },
    { key: "consistency_score", level: 83 },
  ],
  traits: [
    { key: "clutch_king", tier: "gold" },
    { key: "entry_fragger", tier: "diamond" },
    { key: "rising_star", tier: "gold" },
    { key: "headshot_machine", tier: "gold" },
  ],
  history: [
    {
      squad_id: "55555555-5555-5555-5555-555555555505",
      squad_name: "Grid Force",
      squad_tag: "GRF",
      squad_logo_uri:
        "https://api.dicebear.com/7.x/shapes/svg?seed=gridforce",
      role: "captain",
      joined_at: new Date(Date.now() - 360 * 86400000).toISOString(),
      matches_played: 185,
      win_rate: 0.63,
      achievements: ["Valorant Challengers Open - Top 8"],
    },
  ],
};

// AceViper (E2E Test Player) – CS2 star rifler & IGL
KNOWN_PLAYERS["33333333-3333-3333-3333-333333333333"] = {
  skills: [
    { key: "aim_precision", level: 92 },
    { key: "spray_control", level: 87 },
    { key: "movement", level: 85 },
    { key: "map_awareness", level: 93 },
    { key: "game_sense", level: 91 },
    { key: "trade_fragging", level: 84 },
    { key: "shot_calling", level: 89 },
    { key: "clutch_mastery", level: 95 },
    { key: "utility_usage", level: 82 },
    { key: "flash_assists", level: 78 },
    { key: "impact_rating", level: 91 },
    { key: "consistency_score", level: 88 },
  ],
  traits: [
    { key: "clutch_king", tier: "diamond" },
    { key: "team_leader", tier: "gold" },
    { key: "headshot_machine", tier: "gold" },
    { key: "consistent_performer", tier: "gold" },
    { key: "champion", tier: "gold" },
    { key: "rising_star", tier: "silver" },
    { key: "entry_fragger", tier: "silver" },
  ],
  history: [
    {
      squad_id: "66666666-6666-6666-6666-666666666604",
      squad_name: "Horizon Esports",
      squad_tag: "HZN",
      squad_logo_uri:
        "https://api.dicebear.com/7.x/shapes/svg?seed=horizonesports",
      role: "member",
      joined_at: new Date(Date.now() - 720 * 86400000).toISOString(),
      left_at: new Date(Date.now() - 480 * 86400000).toISOString(),
      matches_played: 156,
      win_rate: 0.54,
      achievements: ["Community Cup Season 2 - 3rd"],
    },
    {
      squad_id: "66666666-6666-6666-6666-666666666605",
      squad_name: "Phantom Reapers",
      squad_tag: "PHR",
      squad_logo_uri:
        "https://api.dicebear.com/7.x/shapes/svg?seed=phantomreapers",
      role: "captain",
      joined_at: new Date(Date.now() - 480 * 86400000).toISOString(),
      left_at: new Date(Date.now() - 210 * 86400000).toISOString(),
      matches_played: 223,
      win_rate: 0.62,
      achievements: [
        "ESAP Open Cup 2024 - 1st",
        "LeetGaming Pro League S1 - 2nd",
      ],
    },
    {
      squad_id: "55555555-5555-5555-5555-555555555501",
      squad_name: "NeoStrike",
      squad_tag: "NEO",
      squad_logo_uri:
        "https://api.dicebear.com/7.x/shapes/svg?seed=neostrike",
      role: "captain",
      joined_at: new Date(Date.now() - 210 * 86400000).toISOString(),
      matches_played: 312,
      win_rate: 0.71,
      achievements: [
        "ESAP Winter Cup 2024 - 1st",
        "LeetGaming Pro League S2 - 1st",
        "South American Invitational - 2nd",
      ],
    },
  ],
};

// PhantomAce – CS2 solo, mechanical monster
KNOWN_PLAYERS["44444444-4444-4444-4444-444444444406"] = {
  skills: [
    { key: "aim_precision", level: 94 },
    { key: "spray_control", level: 88 },
    { key: "movement", level: 91 },
    { key: "map_awareness", level: 70 },
    { key: "game_sense", level: 73 },
    { key: "trade_fragging", level: 68 },
    { key: "shot_calling", level: 40 },
    { key: "clutch_mastery", level: 92 },
    { key: "utility_usage", level: 55 },
    { key: "flash_assists", level: 48 },
    { key: "impact_rating", level: 90 },
    { key: "consistency_score", level: 65 },
  ],
  traits: [
    { key: "clutch_king", tier: "diamond" },
    { key: "headshot_machine", tier: "gold" },
    { key: "entry_fragger", tier: "gold" },
  ],
  history: [
    {
      squad_id: "66666666-6666-6666-6666-666666666602",
      squad_name: "Beta Ops",
      squad_tag: "BOP",
      squad_logo_uri: "https://api.dicebear.com/7.x/shapes/svg?seed=betaops",
      role: "member",
      joined_at: new Date(Date.now() - 300 * 86400000).toISOString(),
      left_at: new Date(Date.now() - 180 * 86400000).toISOString(),
      matches_played: 60,
      win_rate: 0.45,
      achievements: [],
    },
  ],
};

// FluxBlade – Valorant initiator
KNOWN_PLAYERS["44444444-4444-4444-4444-444444444504"] = {
  skills: [
    { key: "aim_precision", level: 78 },
    { key: "spray_control", level: 74 },
    { key: "movement", level: 70 },
    { key: "map_awareness", level: 87 },
    { key: "game_sense", level: 90 },
    { key: "trade_fragging", level: 82 },
    { key: "shot_calling", level: 85 },
    { key: "clutch_mastery", level: 72 },
    { key: "utility_usage", level: 93 },
    { key: "flash_assists", level: 89 },
    { key: "impact_rating", level: 81 },
    { key: "consistency_score", level: 79 },
  ],
  traits: [
    { key: "utility_master", tier: "gold" },
    { key: "team_leader", tier: "gold" },
    { key: "consistent_performer", tier: "silver" },
  ],
  history: [
    {
      squad_id: "55555555-5555-5555-5555-555555555506",
      squad_name: "Radiant Protocol",
      squad_tag: "RAD",
      squad_logo_uri:
        "https://api.dicebear.com/7.x/shapes/svg?seed=radiantprotocol",
      role: "captain",
      joined_at: new Date(Date.now() - 200 * 86400000).toISOString(),
      matches_played: 130,
      win_rate: 0.61,
      achievements: ["Valorant Open Cup - 2nd"],
    },
  ],
};

// ============================================================================
// Public API — used by the player profile page as fallback
// ============================================================================

/**
 * Convert a raw skill entry into a full PlayerSkill object.
 * Matches the shape returned by the Go API.
 */
function toPlayerSkill(
  playerId: string,
  entry: { key: string; level: number },
): PlayerSkill {
  const def = SKILL_DEFINITIONS.find((d) => d.key === entry.key);
  return {
    id: stableId(playerId, "skill", entry.key),
    player_id: playerId,
    skill_name: def?.name ?? entry.key,
    skill_key: entry.key,
    category: (def?.category ?? "consistency") as SkillCategory,
    level: entry.level,
    data_source: "auto",
    endorsement_count: Math.floor(Math.random() * 20),
    endorsed_by_viewer: false,
  };
}

function toPlayerTrait(
  playerId: string,
  entry: { key: string; tier: TraitTier },
): PlayerTrait {
  const def = TRAIT_DEFINITIONS.find((d) => d.key === entry.key);
  return {
    id: stableId(playerId, "trait", entry.key),
    player_id: playerId,
    trait_key: entry.key,
    display_name: def?.name ?? entry.key,
    description: def?.description ?? "",
    icon: def?.icon ?? "solar:star-bold",
    tier: entry.tier,
    awarded_at: new Date(
      Date.now() - (30 + Math.floor(Math.random() * 60)) * 86400000,
    ).toISOString(),
    awarded_criteria: def?.criteria?.[entry.tier] ?? "",
    endorsement_count: Math.floor(Math.random() * 30),
    endorsed_by_viewer: false,
  };
}

/**
 * Return demo skills for a player, or null if we don't have data.
 * The caller should prefer real API data when available.
 */
export function getDemoSkills(playerId: string): PlayerSkill[] | null {
  const data = KNOWN_PLAYERS[playerId];
  if (!data) return null;
  return data.skills.map((s) => toPlayerSkill(playerId, s));
}

/**
 * Return demo traits for a player, or null if we don't have data.
 */
export function getDemoTraits(playerId: string): PlayerTrait[] | null {
  const data = KNOWN_PLAYERS[playerId];
  if (!data) return null;
  return data.traits.map((t) => toPlayerTrait(playerId, t));
}

/**
 * Return demo team history for a player, or null if we don't have data.
 */
export function getDemoTeamHistory(
  playerId: string,
): TeamHistoryEntry[] | null {
  const data = KNOWN_PLAYERS[playerId];
  if (!data) return null;
  return data.history;
}

// ============================================================================
// Team Roster History (for Team Profile pages)
// ============================================================================

const KNOWN_ROSTERS: Record<string, TeamRosterHistoryEntry[]> = {
  // NeoStrike
  "55555555-5555-5555-5555-555555555501": [
    { player_id: "44444444-4444-4444-4444-444444444401", player_nickname: "Zyx42", player_avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=zyx42", role: "captain", joined_at: new Date(Date.now() - 270 * 86400000).toISOString(), matches_played: 245, contribution_rating: 1.42 },
    { player_id: "44444444-4444-4444-4444-444444444402", player_nickname: "NightHawk", player_avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=nighthawk", role: "member", joined_at: new Date(Date.now() - 300 * 86400000).toISOString(), matches_played: 210, contribution_rating: 1.35 },
    { player_id: "44444444-4444-4444-4444-444444444403", player_nickname: "ShadowByte", player_avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=shadowbyte", role: "member", joined_at: new Date(Date.now() - 350 * 86400000).toISOString(), matches_played: 200, contribution_rating: 1.18 },
    { player_id: "44444444-4444-4444-4444-444444444404", player_nickname: "IronClad", player_avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=ironclad", role: "member", joined_at: new Date(Date.now() - 270 * 86400000).toISOString(), matches_played: 180, contribution_rating: 1.05 },
    { player_id: "44444444-4444-4444-4444-444444444405", player_nickname: "CyberWolf", player_avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=cyberwolf", role: "member", joined_at: new Date(Date.now() - 270 * 86400000).toISOString(), matches_played: 175, contribution_rating: 1.12 },
    { player_id: "55555555-5555-5555-5555-555555555501", player_nickname: "Pedro", player_avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=pedro", role: "analyst", joined_at: new Date(Date.now() - 400 * 86400000).toISOString(), left_at: new Date(Date.now() - 150 * 86400000).toISOString(), matches_played: 0, contribution_rating: 0.0 },
  ],
  // Grid Force
  "55555555-5555-5555-5555-555555555505": [
    { player_id: "44444444-4444-4444-4444-444444444501", player_nickname: "Kq7Runner", player_avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=kq7runner", role: "captain", joined_at: new Date(Date.now() - 360 * 86400000).toISOString(), matches_played: 185, contribution_rating: 1.38 },
    { player_id: "44444444-4444-4444-4444-444444444502", player_nickname: "NeonDash", player_avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=neondash", role: "member", joined_at: new Date(Date.now() - 300 * 86400000).toISOString(), matches_played: 165, contribution_rating: 1.22 },
    { player_id: "44444444-4444-4444-4444-444444444503", player_nickname: "VoidReaper", player_avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=voidreaper", role: "member", joined_at: new Date(Date.now() - 200 * 86400000).toISOString(), matches_played: 120, contribution_rating: 1.15 },
  ],
  // Radiant Protocol
  "55555555-5555-5555-5555-555555555506": [
    { player_id: "44444444-4444-4444-4444-444444444504", player_nickname: "FluxBlade", player_avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=fluxblade", role: "captain", joined_at: new Date(Date.now() - 200 * 86400000).toISOString(), matches_played: 130, contribution_rating: 1.28 },
    { player_id: "44444444-4444-4444-4444-444444444505", player_nickname: "ChronoShift", player_avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=chronoshift", role: "member", joined_at: new Date(Date.now() - 180 * 86400000).toISOString(), matches_played: 120, contribution_rating: 1.10 },
    { player_id: "44444444-4444-4444-4444-444444444506", player_nickname: "QuantumRush", player_avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=quantumrush", role: "member", joined_at: new Date(Date.now() - 160 * 86400000).toISOString(), matches_played: 110, contribution_rating: 1.32 },
    { player_id: "44444444-4444-4444-4444-444444444507", player_nickname: "HexMaster", player_avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=hexmaster", role: "member", joined_at: new Date(Date.now() - 150 * 86400000).toISOString(), matches_played: 105, contribution_rating: 1.08 },
  ],
};

/**
 * Return demo roster history for a team, or null if we don't have data.
 */
export function getDemoRosterHistory(
  squadId: string,
): TeamRosterHistoryEntry[] | null {
  return KNOWN_ROSTERS[squadId] ?? null;
}

// ============================================================================
// Full Player Profile Fallback (main profile data)
// ============================================================================

/**
 * Complete player profile used when the GET /players/{id} API is unavailable.
 * Shape intentionally matches the `PlayerProfile` interface in players/[id]/page.tsx.
 */
export interface DemoPlayerProfile {
  id: string;
  nickname: string;
  avatar: string;
  description: string;
  roles: string[];
  steam_id?: string;
  discord_id?: string;
  country?: string;
  join_date: string;
  stats: {
    matches_played: number;
    wins: number;
    losses: number;
    kills: number;
    deaths: number;
    assists: number;
    headshot_percentage: number;
    accuracy: number;
    adr: number;
    rating: number;
  };
  achievements: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    earned_at: string;
  }>;
  recent_matches: Array<{
    id: string;
    date: string;
    map: string;
    map_name: string;
    result: "win" | "loss" | "tie";
    score: string;
    kills: number;
    deaths: number;
    assists: number;
  }>;
}

const KNOWN_PROFILES: Record<string, DemoPlayerProfile> = {};

// AceViper — the showcase player (33333333)
KNOWN_PROFILES["33333333-3333-3333-3333-333333333333"] = {
  id: "33333333-3333-3333-3333-333333333333",
  nickname: "AceViper",
  avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=AceViper&backgroundColor=1a1a2e",
  description:
    "Professional CS2 rifler and in-game leader with 3+ years of competitive experience. Known for clutch plays under pressure and strategic mid-round calls. Currently captaining NeoStrike in LeetGaming Pro League Season 3. Two-time ESAP tournament champion.",
  roles: ["Rifler", "AWPer", "IGL"],
  steam_id: "STEAM_0:1:83927461",
  discord_id: "AceViper#1337",
  country: "BR",
  join_date: new Date(Date.now() - 750 * 86400000).toISOString(),
  stats: {
    matches_played: 847,
    wins: 512,
    losses: 335,
    kills: 18420,
    deaths: 13012,
    assists: 5847,
    headshot_percentage: 58.3,
    accuracy: 24.6,
    adr: 87.4,
    rating: 1.34,
  },
  achievements: [
    {
      id: "ach-001",
      name: "ESAP Winter Cup 2024 Champion",
      description: "1st place in the ESAP Winter Cup 2024 with NeoStrike",
      icon: "solar:cup-star-bold",
      earned_at: new Date(Date.now() - 45 * 86400000).toISOString(),
    },
    {
      id: "ach-002",
      name: "Pro League S2 Champion",
      description: "Won LeetGaming Pro League Season 2 with NeoStrike",
      icon: "solar:medal-star-bold",
      earned_at: new Date(Date.now() - 90 * 86400000).toISOString(),
    },
    {
      id: "ach-003",
      name: "South American Invitational Finalist",
      description: "2nd place in the SA Invitational with NeoStrike",
      icon: "solar:star-bold",
      earned_at: new Date(Date.now() - 120 * 86400000).toISOString(),
    },
    {
      id: "ach-004",
      name: "ESAP Open Cup 2024 Champion",
      description: "1st place in ESAP Open Cup with Phantom Reapers",
      icon: "solar:cup-star-bold",
      earned_at: new Date(Date.now() - 300 * 86400000).toISOString(),
    },
    {
      id: "ach-005",
      name: "MVP — Pro League S2 Finals",
      description: "Most Valuable Player of the Season 2 Grand Final",
      icon: "solar:crown-bold",
      earned_at: new Date(Date.now() - 91 * 86400000).toISOString(),
    },
    {
      id: "ach-006",
      name: "500 Matches Milestone",
      description: "Competed in over 500 official matches",
      icon: "solar:gamepad-bold",
      earned_at: new Date(Date.now() - 180 * 86400000).toISOString(),
    },
  ],
  recent_matches: [
    {
      id: "match-001",
      date: new Date(Date.now() - 1 * 86400000).toISOString(),
      map: "de_mirage",
      map_name: "Mirage",
      result: "win",
      score: "16-12",
      kills: 28,
      deaths: 18,
      assists: 5,
    },
    {
      id: "match-002",
      date: new Date(Date.now() - 1.5 * 86400000).toISOString(),
      map: "de_inferno",
      map_name: "Inferno",
      result: "win",
      score: "16-9",
      kills: 24,
      deaths: 14,
      assists: 7,
    },
    {
      id: "match-003",
      date: new Date(Date.now() - 2 * 86400000).toISOString(),
      map: "de_nuke",
      map_name: "Nuke",
      result: "loss",
      score: "12-16",
      kills: 19,
      deaths: 21,
      assists: 4,
    },
    {
      id: "match-004",
      date: new Date(Date.now() - 3 * 86400000).toISOString(),
      map: "de_anubis",
      map_name: "Anubis",
      result: "win",
      score: "16-14",
      kills: 31,
      deaths: 20,
      assists: 6,
    },
    {
      id: "match-005",
      date: new Date(Date.now() - 3.5 * 86400000).toISOString(),
      map: "de_dust2",
      map_name: "Dust II",
      result: "win",
      score: "16-7",
      kills: 26,
      deaths: 11,
      assists: 8,
    },
    {
      id: "match-006",
      date: new Date(Date.now() - 4 * 86400000).toISOString(),
      map: "de_ancient",
      map_name: "Ancient",
      result: "win",
      score: "16-13",
      kills: 22,
      deaths: 17,
      assists: 9,
    },
    {
      id: "match-007",
      date: new Date(Date.now() - 5 * 86400000).toISOString(),
      map: "de_mirage",
      map_name: "Mirage",
      result: "loss",
      score: "14-16",
      kills: 20,
      deaths: 19,
      assists: 3,
    },
    {
      id: "match-008",
      date: new Date(Date.now() - 6 * 86400000).toISOString(),
      map: "de_vertigo",
      map_name: "Vertigo",
      result: "win",
      score: "16-11",
      kills: 25,
      deaths: 16,
      assists: 5,
    },
  ],
};

// Zyx42 — CS2 captain (44444444-01)
KNOWN_PROFILES["44444444-4444-4444-4444-444444444401"] = {
  id: "44444444-4444-4444-4444-444444444401",
  nickname: "Zyx42",
  avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Zyx42&backgroundColor=0d1117",
  description:
    "Veteran IGL and strategist. NeoStrike captain since day one. Known for reading the game two rounds ahead.",
  roles: ["IGL", "Rifler"],
  discord_id: "Zyx42#4242",
  country: "US",
  join_date: new Date(Date.now() - 600 * 86400000).toISOString(),
  stats: {
    matches_played: 620,
    wins: 384,
    losses: 236,
    kills: 12840,
    deaths: 10250,
    assists: 4620,
    headshot_percentage: 48.7,
    accuracy: 22.1,
    adr: 78.3,
    rating: 1.22,
  },
  achievements: [
    {
      id: "ach-z01",
      name: "ESAP Winter Cup 2024 Champion",
      description: "1st place with NeoStrike",
      icon: "solar:cup-star-bold",
      earned_at: new Date(Date.now() - 45 * 86400000).toISOString(),
    },
    {
      id: "ach-z02",
      name: "LeetGaming Pro League S2 - 2nd",
      description: "Runner-up with NeoStrike",
      icon: "solar:medal-star-bold",
      earned_at: new Date(Date.now() - 90 * 86400000).toISOString(),
    },
  ],
  recent_matches: [
    {
      id: "mz-001",
      date: new Date(Date.now() - 1 * 86400000).toISOString(),
      map: "de_mirage",
      map_name: "Mirage",
      result: "win",
      score: "16-12",
      kills: 22,
      deaths: 17,
      assists: 9,
    },
    {
      id: "mz-002",
      date: new Date(Date.now() - 2 * 86400000).toISOString(),
      map: "de_inferno",
      map_name: "Inferno",
      result: "win",
      score: "16-9",
      kills: 18,
      deaths: 12,
      assists: 11,
    },
    {
      id: "mz-003",
      date: new Date(Date.now() - 3 * 86400000).toISOString(),
      map: "de_nuke",
      map_name: "Nuke",
      result: "loss",
      score: "12-16",
      kills: 15,
      deaths: 20,
      assists: 6,
    },
  ],
};

/**
 * Return a demo player profile, or null if we don't have data for this player.
 * Used as a fallback when the backend GET /players/{id} endpoint is unavailable.
 */
export function getDemoProfile(playerId: string): DemoPlayerProfile | null {
  return KNOWN_PROFILES[playerId] ?? null;
}

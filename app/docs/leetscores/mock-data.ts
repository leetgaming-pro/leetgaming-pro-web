/**
 * LeetScores Documentation Page — Mock Data
 *
 * Realistic mock data for live component demos on the LeetScores product page.
 * Uses fictional player/team names to avoid copyright issues.
 */

import type { TeamScoreboard, PlayerStatsEntry } from "@/types/replay-api/sdk";
import type { GameEvent } from "@/types/replay-api/highlights.types";
import type {
  MatchHeatmapResponse,
  MatchEventsResponse,
  MatchKillEvent,
  HeatmapCell,
} from "@/types/replay-api/match-analytics.sdk";

// ============================================================================
// Team Scoreboards (for MatchScoreboard)
// ============================================================================

const team1Stats: PlayerStatsEntry[] = [
  {
    player_id: "p1",
    kills: 28,
    deaths: 11,
    assists: 4,
    kd_ratio: 2.55,
    headshots: 17,
    headshot_pct: 60.7,
    total_damage: 2850,
    adr: 104.6,
    mvp_count: 6,
    score: 72,
    kast: 82.1,
    rating_2: 1.52,
    opening_kills: 7,
    opening_deaths: 2,
    trade_kills: 4,
    clutch_wins: 2,
    clutch_attempts: 3,
    flash_assists: 5,
    enemies_flashed: 18,
    multi_kills: 3,
    aces: 1,
    impact_rating: 1.68,
  } as PlayerStatsEntry,
  {
    player_id: "p2",
    kills: 21,
    deaths: 14,
    assists: 7,
    kd_ratio: 1.5,
    headshots: 11,
    headshot_pct: 52.4,
    total_damage: 2100,
    adr: 87.5,
    mvp_count: 3,
    score: 58,
    kast: 76.9,
    rating_2: 1.28,
    opening_kills: 3,
    opening_deaths: 3,
    trade_kills: 5,
    clutch_wins: 1,
    clutch_attempts: 2,
    flash_assists: 3,
    enemies_flashed: 12,
    impact_rating: 1.22,
  } as PlayerStatsEntry,
  {
    player_id: "p3",
    kills: 18,
    deaths: 15,
    assists: 9,
    kd_ratio: 1.2,
    headshots: 8,
    headshot_pct: 44.4,
    total_damage: 1780,
    adr: 74.2,
    mvp_count: 2,
    score: 49,
    kast: 73.1,
    rating_2: 1.12,
    opening_kills: 2,
    opening_deaths: 2,
    trade_kills: 6,
    flash_assists: 8,
    enemies_flashed: 22,
    impact_rating: 1.05,
  } as PlayerStatsEntry,
  {
    player_id: "p4",
    kills: 16,
    deaths: 13,
    assists: 6,
    kd_ratio: 1.23,
    headshots: 9,
    headshot_pct: 56.3,
    total_damage: 1600,
    adr: 66.7,
    mvp_count: 1,
    score: 43,
    kast: 69.2,
    rating_2: 1.04,
    opening_kills: 1,
    opening_deaths: 3,
    trade_kills: 3,
    flash_assists: 2,
    impact_rating: 0.95,
  } as PlayerStatsEntry,
  {
    player_id: "p5",
    kills: 14,
    deaths: 16,
    assists: 5,
    kd_ratio: 0.88,
    headshots: 6,
    headshot_pct: 42.9,
    total_damage: 1400,
    adr: 58.3,
    mvp_count: 1,
    score: 37,
    kast: 65.4,
    rating_2: 0.89,
    opening_kills: 2,
    opening_deaths: 4,
    trade_kills: 2,
    flash_assists: 4,
    impact_rating: 0.82,
  } as PlayerStatsEntry,
];

const team2Stats: PlayerStatsEntry[] = [
  {
    player_id: "p6",
    kills: 22,
    deaths: 17,
    assists: 5,
    kd_ratio: 1.29,
    headshots: 13,
    headshot_pct: 59.1,
    total_damage: 2200,
    adr: 91.7,
    mvp_count: 4,
    score: 60,
    kast: 74.4,
    rating_2: 1.18,
    opening_kills: 5,
    opening_deaths: 3,
    trade_kills: 3,
    clutch_wins: 1,
    clutch_attempts: 3,
    flash_assists: 4,
    impact_rating: 1.25,
  } as PlayerStatsEntry,
  {
    player_id: "p7",
    kills: 17,
    deaths: 19,
    assists: 6,
    kd_ratio: 0.89,
    headshots: 8,
    headshot_pct: 47.1,
    total_damage: 1700,
    adr: 70.8,
    mvp_count: 2,
    score: 44,
    kast: 64.1,
    rating_2: 0.92,
    opening_kills: 2,
    opening_deaths: 4,
    trade_kills: 4,
    flash_assists: 6,
    impact_rating: 0.88,
  } as PlayerStatsEntry,
  {
    player_id: "p8",
    kills: 15,
    deaths: 20,
    assists: 4,
    kd_ratio: 0.75,
    headshots: 7,
    headshot_pct: 46.7,
    total_damage: 1500,
    adr: 62.5,
    mvp_count: 1,
    score: 38,
    kast: 59.0,
    rating_2: 0.78,
    opening_kills: 1,
    opening_deaths: 3,
    trade_kills: 2,
    flash_assists: 3,
    impact_rating: 0.72,
  } as PlayerStatsEntry,
  {
    player_id: "p9",
    kills: 12,
    deaths: 21,
    assists: 8,
    kd_ratio: 0.57,
    headshots: 5,
    headshot_pct: 41.7,
    total_damage: 1200,
    adr: 50.0,
    mvp_count: 0,
    score: 32,
    kast: 53.8,
    rating_2: 0.65,
    opening_kills: 0,
    opening_deaths: 3,
    trade_kills: 1,
    flash_assists: 5,
    impact_rating: 0.58,
  } as PlayerStatsEntry,
  {
    player_id: "p10",
    kills: 11,
    deaths: 20,
    assists: 3,
    kd_ratio: 0.55,
    headshots: 4,
    headshot_pct: 36.4,
    total_damage: 1100,
    adr: 45.8,
    mvp_count: 0,
    score: 28,
    kast: 51.3,
    rating_2: 0.58,
    opening_kills: 1,
    opening_deaths: 2,
    trade_kills: 1,
    flash_assists: 2,
    impact_rating: 0.52,
  } as PlayerStatsEntry,
];

export const mockTeam1Scoreboard: TeamScoreboard = {
  name: "PHANTOM",
  team: { name: "PHANTOM" },
  side: "CT",
  team_score: 16,
  score: 16,
  players: [
    { id: "p1", name: "razr", kills: 28, deaths: 11, assists: 4, adr: 104.6, mvp_count: 6 },
    { id: "p2", name: "kyro", kills: 21, deaths: 14, assists: 7, adr: 87.5, mvp_count: 3 },
    { id: "p3", name: "valken", kills: 18, deaths: 15, assists: 9, adr: 74.2, mvp_count: 2 },
    { id: "p4", name: "frosT", kills: 16, deaths: 13, assists: 6, adr: 66.7, mvp_count: 1 },
    { id: "p5", name: "zypher", kills: 14, deaths: 16, assists: 5, adr: 58.3, mvp_count: 1 },
  ],
  player_stats: team1Stats,
};

export const mockTeam2Scoreboard: TeamScoreboard = {
  name: "SPECTRA",
  team: { name: "SPECTRA" },
  side: "T",
  team_score: 11,
  score: 11,
  players: [
    { id: "p6", name: "n0va", kills: 22, deaths: 17, assists: 5, adr: 91.7, mvp_count: 4 },
    { id: "p7", name: "blitz", kills: 17, deaths: 19, assists: 6, adr: 70.8, mvp_count: 2 },
    { id: "p8", name: "hex", kills: 15, deaths: 20, assists: 4, adr: 62.5, mvp_count: 1 },
    { id: "p9", name: "dr1ft", kills: 12, deaths: 21, assists: 8, adr: 50.0, mvp_count: 0 },
    { id: "p10", name: "vex", kills: 11, deaths: 20, assists: 3, adr: 45.8, mvp_count: 0 },
  ],
  player_stats: team2Stats,
};

// ============================================================================
// Heatmap Data
// ============================================================================

function generateHeatmapCells(): HeatmapCell[] {
  const cells: HeatmapCell[] = [];
  // A-site cluster
  for (let i = 0; i < 8; i++) {
    cells.push({ x: 42 + Math.random() * 12, y: 18 + Math.random() * 10, density: 0.5 + Math.random() * 0.5 });
  }
  // B-site cluster
  for (let i = 0; i < 6; i++) {
    cells.push({ x: 15 + Math.random() * 10, y: 45 + Math.random() * 12, density: 0.4 + Math.random() * 0.4 });
  }
  // Mid cluster
  for (let i = 0; i < 5; i++) {
    cells.push({ x: 30 + Math.random() * 8, y: 30 + Math.random() * 8, density: 0.3 + Math.random() * 0.5 });
  }
  // Long A
  for (let i = 0; i < 4; i++) {
    cells.push({ x: 55 + Math.random() * 6, y: 25 + Math.random() * 6, density: 0.2 + Math.random() * 0.3 });
  }
  return cells;
}

export const mockHeatmap: MatchHeatmapResponse = {
  match_id: "demo-match-001",
  map_name: "de_dust2",
  grid_size: 64,
  cells: generateHeatmapCells(),
  total_samples: 23,
};

// ============================================================================
// Match Events (for PremiumRoundsTimeline)
// ============================================================================

const mockKills: MatchKillEvent[] = [
  { tick: 3200, round_number: 1, killer_id: "p1", killer_name: "razr", killer_team: "CT", victim_id: "p8", victim_name: "hex", victim_team: "T", weapon: "awp", headshot: false },
  { tick: 3800, round_number: 1, killer_id: "p6", killer_name: "n0va", killer_team: "T", victim_id: "p5", victim_name: "zypher", victim_team: "CT", weapon: "ak-47", headshot: true },
  { tick: 4200, round_number: 1, killer_id: "p1", killer_name: "razr", killer_team: "CT", victim_id: "p9", victim_name: "dr1ft", victim_team: "T", weapon: "awp", headshot: false },
  { tick: 4800, round_number: 1, killer_id: "p2", killer_name: "kyro", killer_team: "CT", victim_id: "p7", victim_name: "blitz", victim_team: "T", weapon: "m4a1_silencer", headshot: true },
  { tick: 8500, round_number: 2, killer_id: "p6", killer_name: "n0va", killer_team: "T", victim_id: "p3", victim_name: "valken", victim_team: "CT", weapon: "awp", headshot: false },
  { tick: 9200, round_number: 2, killer_id: "p6", killer_name: "n0va", killer_team: "T", victim_id: "p4", victim_name: "frosT", victim_team: "CT", weapon: "awp", headshot: false },
  { tick: 9800, round_number: 2, killer_id: "p6", killer_name: "n0va", killer_team: "T", victim_id: "p1", victim_name: "razr", victim_team: "CT", weapon: "desert_eagle", headshot: true },
  { tick: 14500, round_number: 3, killer_id: "p1", killer_name: "razr", killer_team: "CT", victim_id: "p6", victim_name: "n0va", victim_team: "T", weapon: "ak-47", headshot: true },
  { tick: 15200, round_number: 3, killer_id: "p1", killer_name: "razr", killer_team: "CT", victim_id: "p7", victim_name: "blitz", victim_team: "T", weapon: "ak-47", headshot: true },
  { tick: 15800, round_number: 3, killer_id: "p1", killer_name: "razr", killer_team: "CT", victim_id: "p8", victim_name: "hex", victim_team: "T", weapon: "ak-47", headshot: false },
  { tick: 16200, round_number: 3, killer_id: "p1", killer_name: "razr", killer_team: "CT", victim_id: "p9", victim_name: "dr1ft", victim_team: "T", weapon: "ak-47", headshot: true },
  { tick: 16600, round_number: 3, killer_id: "p1", killer_name: "razr", killer_team: "CT", victim_id: "p10", victim_name: "vex", victim_team: "T", weapon: "ak-47", headshot: false },
];

export const mockEvents: MatchEventsResponse = {
  match_id: "demo-match-001",
  total_ticks: 128000,
  tick_rate: 128,
  kills: mockKills,
  round_starts: [
    { tick: 2000, round_number: 1 },
    { tick: 7000, round_number: 2 },
    { tick: 12000, round_number: 3 },
  ],
  round_ends: [
    { tick: 5500, round_number: 1, winner_team: "CT", reason: "elimination" },
    { tick: 10800, round_number: 2, winner_team: "T", reason: "bomb_exploded" },
    { tick: 17000, round_number: 3, winner_team: "CT", reason: "elimination" },
  ],
  bomb_plants: [
    { tick: 9000, round_number: 2, player_id: "p7", site: "A" }, // blitz
  ],
  bomb_defuses: [],
};

// ============================================================================
// Highlights (for PremiumHighlights)
// ============================================================================

export const mockHighlights: GameEvent[] = [
  {
    id: "h1",
    type: "Ace",
    game_id: "cs2",
    match_id: "demo-match-001",
    tick_id: 14500,
    event_time: 113,
    round_number: 3,
    title: "ACE by razr",
    description: "razr eliminates the entire SPECTRA squad with AK-47",
    primary_player: { id: "p1", display_name: "razr", team: "PHANTOM", team_color: "CT" },
    weapon: "ak-47",
    kill_count: 5,
    time_span_ms: 4200,
    map_name: "de_dust2",
    score_ct: 2,
    score_t: 0,
    views_count: 142500,
    likes_count: 8940,
    shares_count: 2100,
    created_at: "2026-03-07T14:23:00Z",
  },
  {
    id: "h2",
    type: "Clutch",
    game_id: "cs2",
    match_id: "demo-match-001",
    tick_id: 32000,
    event_time: 250,
    round_number: 7,
    title: "1v3 Clutch by razr",
    description: "Incredible 1v3 retake on B-site with AWP",
    primary_player: { id: "p1", display_name: "razr", team: "PHANTOM", team_color: "CT" },
    weapon: "awp",
    clutch_type: "1v3",
    clutch_success: true,
    kill_count: 3,
    time_span_ms: 6800,
    map_name: "de_dust2",
    score_ct: 5,
    score_t: 2,
    views_count: 89300,
    likes_count: 5620,
    shares_count: 1340,
    created_at: "2026-03-07T14:28:00Z",
  },
  {
    id: "h3",
    type: "MultiKill",
    game_id: "cs2",
    match_id: "demo-match-001",
    tick_id: 56000,
    event_time: 437,
    round_number: 14,
    title: "4K by n0va",
    description: "n0va gets a quick 4-kill with the AWP holding mid",
    primary_player: { id: "p6", display_name: "n0va", team: "SPECTRA", team_color: "T" },
    weapon: "awp",
    kill_count: 4,
    time_span_ms: 3100,
    map_name: "de_dust2",
    score_ct: 9,
    score_t: 5,
    views_count: 67800,
    likes_count: 4210,
    shares_count: 980,
    created_at: "2026-03-07T14:35:00Z",
  },
  {
    id: "h4",
    type: "FirstBlood",
    game_id: "cs2",
    match_id: "demo-match-001",
    tick_id: 3200,
    event_time: 25,
    round_number: 1,
    title: "Opening Pick by razr",
    description: "razr opens pistol round with AWP pick at long",
    primary_player: { id: "p1", display_name: "razr", team: "PHANTOM", team_color: "CT" },
    victim_player: { id: "p8", display_name: "hex", team: "SPECTRA", team_color: "T" },
    weapon: "awp",
    is_headshot: false,
    kill_count: 1,
    map_name: "de_dust2",
    score_ct: 0,
    score_t: 0,
    views_count: 34200,
    likes_count: 1890,
    shares_count: 420,
    created_at: "2026-03-07T14:20:00Z",
  },
];

// ============================================================================
// Escrow Match Data
// ============================================================================

export const mockEscrowMatch = {
  match_id: "escrow-demo-001",
  game_id: "cs2",
  game_mode: "5v5 Competitive",
  region: "NA",
  entry_fee: 25,
  currency: "USDC",
  chain_id: 137,
  total_pot: 250,
  platform_contribution: 25,
  platform_fee_percent: 500,
  distribution_type: "winner_takes_all" as const,
  participants: [],
  min_participants: 10,
  max_participants: 10,
  current_participants: 8,
  status: "filling" as const,
  created_at: "2026-03-07T12:00:00Z",
  starts_at: "2026-03-07T14:00:00Z",
  escrow_address: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
  escrow_period_hours: 24,
};

/**
 * Upcoming Games Types
 * Types for upcoming/live game visibility features
 * Combines lobby and escrow match data into a unified "upcoming game" view
 */

import type { LobbyStatus, LobbyType, LobbyVisibility, PrizePoolConfig, PlayerSlot } from './lobby.types';

// ============================================================================
// Game Event Status (unified view of lobbies + escrow matches)
// ============================================================================

/** Status for upcoming game events */
export type GameEventStatus =
  | 'scheduled'     // Set to start at a specific time
  | 'open'          // Accepting players now
  | 'filling'       // Minimum met, still accepting
  | 'starting_soon' // Starting within 5 minutes
  | 'live'          // Currently in progress
  | 'completed';    // Finished

/** Source type for the game event */
export type GameEventSource = 'lobby' | 'escrow_match' | 'tournament';

// ============================================================================
// Upcoming Game Event (unified type)
// ============================================================================

/** Unified upcoming game event combining lobby + escrow data */
export interface UpcomingGameEvent {
  id: string;
  source: GameEventSource;
  source_id: string; // Original lobby_id or escrow_match_id

  // Game Info
  game_id: string;
  game_mode: string;
  region: string;

  // Display
  title: string;
  description?: string;
  type: LobbyType;
  visibility: LobbyVisibility;
  is_featured: boolean;
  tags?: string[];

  // Players
  current_players: number;
  max_players: number;
  min_players: number;
  player_slots?: PlayerSlot[];

  // Prize / Entry
  entry_fee_cents?: number;
  prize_pool?: PrizePoolConfig;
  total_pot_cents?: number;

  // Timing
  status: GameEventStatus;
  created_at: string;
  starts_at?: string;
  expires_at?: string;

  // Original lobby status for mapping
  lobby_status?: LobbyStatus;
}

// ============================================================================
// Helpers
// ============================================================================

/** Map lobby status to game event status */
export function mapLobbyToEventStatus(lobbyStatus: LobbyStatus, expiresAt?: string): GameEventStatus {
  switch (lobbyStatus) {
    case 'open':
      // Check if starting soon (within 5 minutes)
      if (expiresAt) {
        const timeUntil = new Date(expiresAt).getTime() - Date.now();
        if (timeUntil > 0 && timeUntil <= 5 * 60 * 1000) return 'starting_soon';
      }
      return 'open';
    case 'ready_check':
      return 'starting_soon';
    case 'starting':
      return 'starting_soon';
    case 'started':
      return 'live';
    case 'completed':
      return 'completed';
    case 'cancelled':
      return 'completed';
    default:
      return 'open';
  }
}

/** Convert a MatchmakingLobby to an UpcomingGameEvent */
export function lobbyToGameEvent(lobby: {
  id: string;
  game_id: string;
  game_mode: string;
  region: string;
  name: string;
  description?: string;
  type: LobbyType;
  visibility: LobbyVisibility;
  is_featured?: boolean;
  tags?: string[];
  player_slots: PlayerSlot[];
  max_players: number;
  min_players: number;
  prize_pool?: PrizePoolConfig;
  entry_fee_cents?: number;
  status: LobbyStatus;
  created_at: string;
  starts_at?: string;
  expires_at: string;
}): UpcomingGameEvent {
  const currentPlayers = lobby.player_slots?.filter(s => s.player_id && !s.is_spectator).length || 0;

  return {
    id: `lobby-${lobby.id}`,
    source: 'lobby',
    source_id: lobby.id,
    game_id: lobby.game_id,
    game_mode: lobby.game_mode,
    region: lobby.region,
    title: lobby.name || `Game #${lobby.id.slice(-6)}`,
    description: lobby.description,
    type: lobby.type,
    visibility: lobby.visibility,
    is_featured: lobby.is_featured || false,
    tags: lobby.tags,
    current_players: currentPlayers,
    max_players: lobby.max_players,
    min_players: lobby.min_players,
    player_slots: lobby.player_slots,
    entry_fee_cents: lobby.entry_fee_cents || lobby.prize_pool?.entry_fee_cents,
    prize_pool: lobby.prize_pool,
    total_pot_cents: lobby.prize_pool
      ? (lobby.prize_pool.entry_fee_cents || 0) * currentPlayers
      : undefined,
    status: mapLobbyToEventStatus(lobby.status, lobby.expires_at),
    created_at: lobby.created_at,
    starts_at: lobby.starts_at,
    expires_at: lobby.expires_at,
    lobby_status: lobby.status,
  };
}

/** Status display configuration */
export const EVENT_STATUS_CONFIG: Record<GameEventStatus, {
  label: string;
  color: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  icon: string;
  pulse: boolean;
}> = {
  scheduled: {
    label: 'Scheduled',
    color: 'default',
    icon: 'solar:calendar-bold',
    pulse: false,
  },
  open: {
    label: 'Open',
    color: 'success',
    icon: 'solar:door-bold',
    pulse: false,
  },
  filling: {
    label: 'Filling Up',
    color: 'warning',
    icon: 'solar:users-group-rounded-bold',
    pulse: false,
  },
  starting_soon: {
    label: 'Starting Soon',
    color: 'warning',
    icon: 'solar:alarm-bold',
    pulse: true,
  },
  live: {
    label: 'LIVE',
    color: 'danger',
    icon: 'solar:play-circle-bold',
    pulse: true,
  },
  completed: {
    label: 'Completed',
    color: 'default',
    icon: 'solar:check-circle-bold',
    pulse: false,
  },
};

/** Game accent colors for consistent branding */
export const GAME_ACCENT_COLORS: Record<string, {
  primary: string;
  secondary: string;
  glow: string;
  gradient: string;
}> = {
  cs2: {
    primary: '#FF9800',
    secondary: '#F57C00',
    glow: 'shadow-orange-500/30',
    gradient: 'from-orange-500/20 via-amber-500/10 to-transparent',
  },
  valorant: {
    primary: '#FF4654',
    secondary: '#DC3D4B',
    glow: 'shadow-red-500/30',
    gradient: 'from-red-500/20 via-rose-500/10 to-transparent',
  },
  lol: {
    primary: '#C89B3C',
    secondary: '#A67C00',
    glow: 'shadow-amber-500/30',
    gradient: 'from-amber-500/20 via-yellow-500/10 to-transparent',
  },
  dota2: {
    primary: '#A13D2D',
    secondary: '#8B2D1F',
    glow: 'shadow-rose-500/30',
    gradient: 'from-rose-500/20 via-red-500/10 to-transparent',
  },
  r6: {
    primary: '#4A90D9',
    secondary: '#2C5AA0',
    glow: 'shadow-blue-500/30',
    gradient: 'from-blue-500/20 via-cyan-500/10 to-transparent',
  },
  pubg: {
    primary: '#F2A900',
    secondary: '#D69E00',
    glow: 'shadow-yellow-500/30',
    gradient: 'from-yellow-500/20 via-amber-500/10 to-transparent',
  },
};

/** Get accent colors for a game, with fallback */
export function getGameAccent(gameId: string) {
  return GAME_ACCENT_COLORS[gameId] || GAME_ACCENT_COLORS.cs2;
}

/** Format time remaining as countdown string */
export function formatCountdown(targetDate: string): string {
  const diff = new Date(targetDate).getTime() - Date.now();
  if (diff <= 0) return 'Now';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  }
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

/** Get countdown parts for individual digit display */
export function getCountdownParts(targetDate: string): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
} {
  const diff = Math.max(0, new Date(targetDate).getTime() - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
    total: diff,
  };
}

/**
 * Tournament Types for LeetGaming.PRO
 * Comprehensive types for competitive tournament management
 */

// --- Core Types ---

export type TournamentStatus =
  | 'draft'
  | 'registration'
  | 'ready'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type TournamentFormat =
  | 'single_elimination'
  | 'double_elimination'
  | 'round_robin'
  | 'swiss';

export type MatchStatus =
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type PlayerStatus = 'registered' | 'checked_in' | 'disqualified';

// --- Entity Interfaces ---

export interface TournamentRules {
  best_of: number;
  map_pool?: string[];
  ban_pick_enabled: boolean;
  check_in_required: boolean;
  check_in_window_mins?: number;
  match_timeout_mins: number;
  disconnect_grace_mins: number;
}

export interface TournamentPlayer {
  player_id: string;
  display_name: string;
  registered_at: string;
  seed?: number;
  status: PlayerStatus;
}

export interface TournamentMatch {
  match_id: string;
  round: number;
  bracket_pos?: string;
  player1_id: string;
  player2_id: string;
  winner_id?: string;
  scheduled_at: string;
  completed_at?: string;
  status: MatchStatus;
}

export interface TournamentWinner {
  player_id: string;
  placement: number;
  prize: number;
  paid_at?: string;
}

export interface Tournament {
  id: string;
  name: string;
  description: string;
  game_id: string;
  game_mode: string;
  region: string;
  format: TournamentFormat;
  max_participants: number;
  min_participants: number;
  entry_fee: number;
  currency: string;
  prize_pool: number;
  status: TournamentStatus;
  start_time: string;
  end_time?: string;
  registration_open: string;
  registration_close: string;
  participants: TournamentPlayer[];
  matches?: TournamentMatch[];
  winners?: TournamentWinner[];
  rules: TournamentRules;
  organizer_id: string;
  created_at: string;
  updated_at: string;
}

// --- Request/Response Types ---

export interface CreateTournamentRequest {
  name: string;
  description: string;
  game_id: string;
  game_mode: string;
  region: string;
  format: TournamentFormat;
  max_participants: number;
  min_participants: number;
  entry_fee?: number;
  currency?: string;
  start_time: string;
  registration_open: string;
  registration_close: string;
  rules: TournamentRules;
}

export interface UpdateTournamentRequest {
  name?: string;
  description?: string;
  max_participants?: number;
  start_time?: string;
  registration_close?: string;
  rules?: Partial<TournamentRules>;
}

export interface RegisterPlayerRequest {
  player_id: string;
  display_name: string;
}

export interface CompleteTournamentRequest {
  winners: TournamentWinner[];
}

export interface CancelTournamentRequest {
  reason: string;
}

export interface TournamentListFilters {
  game_id?: string;
  region?: string;
  status?: TournamentStatus[];
  format?: TournamentFormat;
  limit?: number;
  offset?: number;
}

// --- UI Display Config Types ---

export interface StatusConfig {
  color: 'success' | 'warning' | 'danger' | 'default' | 'primary' | 'secondary';
  label: string;
  icon: string;
  description: string;
}

export interface FormatConfig {
  name: string;
  description: string;
  icon: string;
  minPlayers: number;
  maxPlayers?: number;
}

// --- Static Configurations (Object Lookups) ---

export const TOURNAMENT_STATUS_CONFIG: Record<TournamentStatus, StatusConfig> = {
  draft: {
    color: 'default',
    label: 'Draft',
    icon: 'solar:pen-bold',
    description: 'Being configured by organizer',
  },
  registration: {
    color: 'primary',
    label: 'Registration Open',
    icon: 'solar:user-plus-bold',
    description: 'Open for player registration',
  },
  ready: {
    color: 'warning',
    label: 'Ready',
    icon: 'solar:clock-circle-bold',
    description: 'Registration closed, waiting for start',
  },
  in_progress: {
    color: 'success',
    label: 'In Progress',
    icon: 'solar:play-circle-bold',
    description: 'Tournament matches being played',
  },
  completed: {
    color: 'secondary',
    label: 'Completed',
    icon: 'solar:cup-star-bold',
    description: 'Tournament finished',
  },
  cancelled: {
    color: 'danger',
    label: 'Cancelled',
    icon: 'solar:close-circle-bold',
    description: 'Tournament cancelled',
  },
};

export const MATCH_STATUS_CONFIG: Record<MatchStatus, StatusConfig> = {
  scheduled: {
    color: 'default',
    label: 'Scheduled',
    icon: 'solar:calendar-bold',
    description: 'Match scheduled',
  },
  in_progress: {
    color: 'success',
    label: 'Live',
    icon: 'solar:play-bold',
    description: 'Match in progress',
  },
  completed: {
    color: 'secondary',
    label: 'Completed',
    icon: 'solar:check-circle-bold',
    description: 'Match finished',
  },
  cancelled: {
    color: 'danger',
    label: 'Cancelled',
    icon: 'solar:close-circle-bold',
    description: 'Match cancelled',
  },
};

export const TOURNAMENT_FORMAT_CONFIG: Record<TournamentFormat, FormatConfig> = {
  single_elimination: {
    name: 'Single Elimination',
    description: 'One loss and you are out',
    icon: 'solar:ranking-bold',
    minPlayers: 4,
  },
  double_elimination: {
    name: 'Double Elimination',
    description: 'Two losses to be eliminated',
    icon: 'solar:ranking-bold',
    minPlayers: 4,
  },
  round_robin: {
    name: 'Round Robin',
    description: 'Everyone plays everyone',
    icon: 'solar:refresh-circle-bold',
    minPlayers: 3,
    maxPlayers: 16,
  },
  swiss: {
    name: 'Swiss',
    description: 'Play similar skill opponents',
    icon: 'solar:sort-vertical-bold',
    minPlayers: 8,
  },
};

export const DEFAULT_TOURNAMENT_RULES: TournamentRules = {
  best_of: 1,
  ban_pick_enabled: false,
  check_in_required: true,
  check_in_window_mins: 15,
  match_timeout_mins: 60,
  disconnect_grace_mins: 5,
};

// --- Helper Functions (D.R.Y. - reduce component code bloat) ---

/**
 * Get tournament status display configuration
 */
export const getStatusConfig = (status: TournamentStatus): StatusConfig => {
  return TOURNAMENT_STATUS_CONFIG[status] ?? TOURNAMENT_STATUS_CONFIG.draft;
};

/**
 * Get match status display configuration
 */
export const getMatchStatusConfig = (status: MatchStatus): StatusConfig => {
  return MATCH_STATUS_CONFIG[status] ?? MATCH_STATUS_CONFIG.scheduled;
};

/**
 * Get tournament format display configuration
 */
export const getFormatConfig = (format: TournamentFormat): FormatConfig => {
  return TOURNAMENT_FORMAT_CONFIG[format] ?? TOURNAMENT_FORMAT_CONFIG.single_elimination;
};

/**
 * Check if tournament is accepting registrations
 */
export const canRegister = (tournament: Tournament): boolean => {
  if (tournament.status !== 'registration') return false;
  const now = new Date();
  const regOpen = new Date(tournament.registration_open);
  const regClose = new Date(tournament.registration_close);
  return now >= regOpen && now <= regClose && !isFull(tournament);
};

/**
 * Check if tournament is full
 */
export const isFull = (tournament: Tournament): boolean => {
  return tournament.participants.length >= tournament.max_participants;
};

/**
 * Check if player is registered in tournament
 */
export const isPlayerRegistered = (tournament: Tournament, playerId: string): boolean => {
  return tournament.participants.some((p) => p.player_id === playerId);
};

/**
 * Check if tournament has started
 */
export const hasStarted = (tournament: Tournament): boolean => {
  return ['in_progress', 'completed'].includes(tournament.status);
};

/**
 * Check if tournament is in a terminal state
 */
export const isTerminal = (status: TournamentStatus): boolean => {
  return ['completed', 'cancelled'].includes(status);
};

/**
 * Check if tournament can be edited (before it starts)
 */
export const canEdit = (tournament: Tournament): boolean => {
  return ['draft', 'registration'].includes(tournament.status);
};

/**
 * Get participant count display string
 */
export const getParticipantCountDisplay = (tournament: Tournament): string => {
  return `${tournament.participants.length}/${tournament.max_participants}`;
};

/**
 * Get fill percentage for progress bars
 */
export const getFillPercentage = (tournament: Tournament): number => {
  return Math.round((tournament.participants.length / tournament.max_participants) * 100);
};

/**
 * Format prize pool with currency
 */
export const formatPrizePool = (amount: number, currency: string): string => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return formatter.format(amount);
};

/**
 * Format entry fee with currency
 */
export const formatEntryFee = (amount: number, currency: string): string => {
  if (amount === 0) return 'Free';
  return formatPrizePool(amount, currency);
};

/**
 * Format tournament date/time for display
 */
export const formatTournamentDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Get time until tournament starts
 */
export const getTimeUntilStart = (startTime: string): string => {
  const now = new Date();
  const start = new Date(startTime);
  const diff = start.getTime() - now.getTime();

  if (diff <= 0) return 'Started';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

/**
 * Get registration time remaining
 */
export const getRegistrationTimeRemaining = (regClose: string): string => {
  return getTimeUntilStart(regClose);
};

/**
 * Get placement suffix (1st, 2nd, 3rd, etc.)
 */
export const getPlacementDisplay = (placement: number): string => {
  const suffixes: Record<number, string> = { 1: 'st', 2: 'nd', 3: 'rd' };
  const suffix = placement <= 3 ? suffixes[placement] : 'th';
  return `${placement}${suffix}`;
};

/**
 * Sort tournaments by relevance (status priority + start time)
 */
export const sortTournamentsByRelevance = (tournaments: Tournament[]): Tournament[] => {
  const statusPriority: Record<TournamentStatus, number> = {
    in_progress: 0,
    registration: 1,
    ready: 2,
    draft: 3,
    completed: 4,
    cancelled: 5,
  };

  return [...tournaments].sort((a, b) => {
    const priorityDiff = statusPriority[a.status] - statusPriority[b.status];
    if (priorityDiff !== 0) return priorityDiff;
    return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
  });
};

/**
 * Filter tournaments by multiple criteria
 */
export const filterTournaments = (
  tournaments: Tournament[],
  filters: Partial<TournamentListFilters>
): Tournament[] => {
  return tournaments.filter((t) => {
    if (filters.game_id && t.game_id !== filters.game_id) return false;
    if (filters.region && t.region !== filters.region) return false;
    if (filters.status?.length && !filters.status.includes(t.status)) return false;
    if (filters.format && t.format !== filters.format) return false;
    return true;
  });
};

/**
 * Get active (joinable) tournaments
 */
export const getActiveTournaments = (tournaments: Tournament[]): Tournament[] => {
  return tournaments.filter(
    (t) => t.status === 'registration' || t.status === 'ready' || t.status === 'in_progress'
  );
};

/**
 * Validate tournament rules
 */
export const validateRules = (rules: Partial<TournamentRules>): string[] => {
  const errors: string[] = [];
  if (rules.best_of !== undefined && rules.best_of < 1) {
    errors.push('Best of must be at least 1');
  }
  if (rules.match_timeout_mins !== undefined && rules.match_timeout_mins < 10) {
    errors.push('Match timeout must be at least 10 minutes');
  }
  if (rules.disconnect_grace_mins !== undefined && rules.disconnect_grace_mins < 1) {
    errors.push('Disconnect grace period must be at least 1 minute');
  }
  return errors;
};

/**
 * Create default tournament request with sensible defaults
 */
export const createDefaultTournamentRequest = (
  gameId: string,
  region: string
): Partial<CreateTournamentRequest> => ({
  game_id: gameId,
  region,
  format: 'single_elimination',
  max_participants: 16,
  min_participants: 4,
  entry_fee: 0,
  currency: 'USD',
  rules: { ...DEFAULT_TOURNAMENT_RULES },
});

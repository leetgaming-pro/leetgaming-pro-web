/**
 * Match Analytics API wrapper for trajectory, heatmap, and positioning data
 */

import { ReplayApiClient } from './replay-api.client';

/** Single trajectory point for a player */
export interface TrajectoryPoint {
  tick_id: number;
  position: {
    x: number;
    y: number;
    z: number;
  };
  velocity?: {
    x: number;
    y: number;
    z: number;
  };
  angle?: {
    x: number;
    y: number;
    z: number;
  };
  is_alive?: boolean;
  is_crouching?: boolean;
  weapon?: string;
}

/** Player trajectory data */
export interface PlayerTrajectory {
  player_id: string;
  player_name?: string;
  team?: string;
  points: TrajectoryPoint[];
}

/** Match trajectory response */
export interface MatchTrajectoryResponse {
  match_id: string;
  map_name?: string;
  trajectories: PlayerTrajectory[];
  tick_rate?: number;
  duration_ticks?: number;
}

/** Round trajectory response */
export interface RoundTrajectoryResponse {
  match_id: string;
  round_number: number;
  map_name?: string;
  trajectories: PlayerTrajectory[];
  tick_start?: number;
  tick_end?: number;
}

/** Heatmap cell data */
export interface HeatmapCell {
  x: number;
  y: number;
  density: number;
  player_count?: number;
}

/** Heatmap zone data */
export interface HeatmapZone {
  zone_code: string;
  zone_name?: string;
  total_time: number;
  visit_count: number;
  avg_duration: number;
}

/** Match heatmap response */
export interface MatchHeatmapResponse {
  match_id: string;
  map_name?: string;
  grid_size: number;
  cells: HeatmapCell[];
  zones?: HeatmapZone[];
  total_samples?: number;
}

/** Round heatmap response */
export interface RoundHeatmapResponse {
  match_id: string;
  round_number: number;
  map_name?: string;
  grid_size: number;
  cells: HeatmapCell[];
  zones?: HeatmapZone[];
  total_samples?: number;
}

/** Player zone frequency data */
export interface PlayerZoneFrequency {
  player_id: string;
  player_name?: string;
  zones: Record<string, number>;
  dwell_times: Record<string, number>;
}

/** Kill event from match */
export interface MatchKillEvent {
  tick: number;
  timestamp?: number;
  round_number?: number;
  killer_id: string;
  killer_name?: string;
  killer_team?: string;
  victim_id: string;
  victim_name?: string;
  victim_team?: string;
  weapon: string;
  headshot?: boolean;
  wallbang?: boolean;
  penetrated?: boolean;
  through_smoke?: boolean;
  no_scope?: boolean;
  flash_assist?: boolean;
  flash_assist_id?: string;
  flash_assist_name?: string;
  assister_id?: string;
  assister_name?: string;
}

/** Scoreboard player entry */
export interface ScoreboardPlayer {
  player_id: string;
  player_name: string;
  team: string;
  kills: number;
  deaths: number;
  assists: number;
  adr?: number;
  hs_percent?: number;
  rating?: number;
  score?: number;
  mvps?: number;
  is_alive?: boolean;
  money?: number;
}

/** Match scoreboard response */
export interface MatchScoreboardResponse {
  match_id: string;
  tick?: number;
  team1_score: number;
  team2_score: number;
  team1_name?: string;
  team2_name?: string;
  players: ScoreboardPlayer[];
}

/** Flash event from match */
export interface MatchFlashEvent {
  tick: number;
  timestamp?: number;
  round_number?: number;
  attacker_id: string;
  attacker_name?: string;
  attacker_team?: string;
  victim_id: string;
  victim_name?: string;
  victim_team?: string;
  flash_duration: number;
  is_team_flash?: boolean;
  distance?: number;
}

/** Position3D for grenade events */
export interface Position3D {
  x: number;
  y: number;
  z: number;
}

/** HE Grenade explosion event */
export interface MatchHEGrenadeEvent {
  tick: number;
  timestamp?: number;
  round_number?: number;
  thrower_id: string;
  thrower_name?: string;
  thrower_team?: string;
  thrower_position?: Position3D;
  grenade_position: Position3D;
  damage?: number;
  players_hit?: number;
  enemies_hit?: number;
}

/** Flash grenade explosion event */
export interface MatchFlashGrenadeEvent {
  tick: number;
  timestamp?: number;
  round_number?: number;
  thrower_id: string;
  thrower_name?: string;
  thrower_team?: string;
  thrower_position?: Position3D;
  grenade_position: Position3D;
  players_flashed?: number;
  enemies_flashed?: number;
  avg_flash_duration?: number;
}

/** Smoke grenade event */
export interface MatchSmokeEvent {
  tick: number;
  timestamp?: number;
  round_number?: number;
  thrower_id: string;
  thrower_name?: string;
  thrower_team?: string;
  thrower_position?: Position3D;
  smoke_position: Position3D;
}

/** Molotov/Incendiary event */
export interface MatchMolotovEvent {
  tick: number;
  timestamp?: number;
  round_number?: number;
  thrower_id: string;
  thrower_name?: string;
  thrower_team?: string;
  thrower_position?: Position3D;
  fire_position: Position3D;
}

/** Player route/trajectory for a specific round */
export interface PlayerRoundRoute {
  player_id: string;
  player_name?: string;
  team?: string;
  positions: Position3D[];
  start_tick: number;
  end_tick: number;
}

/** Tactical insight derived from match data */
export interface TacticalInsight {
  type: 'nade_lineup' | 'common_position' | 'rotation' | 'trade_kill' | 'eco_round' | 'site_take';
  title: string;
  description: string;
  round_number?: number;
  tick?: number;
  position?: Position3D;
  players?: string[];
  impact_score?: number;
}

/** Match events response */
export interface MatchEventsResponse {
  match_id: string;
  total_ticks: number;
  tick_rate?: number;
  kills: MatchKillEvent[];
  flashes?: MatchFlashEvent[];
  he_grenades?: MatchHEGrenadeEvent[];
  flash_grenades?: MatchFlashGrenadeEvent[];
  smokes?: MatchSmokeEvent[];
  molotovs?: MatchMolotovEvent[];
  player_routes?: PlayerRoundRoute[];
  insights?: TacticalInsight[];
  round_starts?: Array<{ tick: number; round_number: number }>;
  round_ends?: Array<{ tick: number; round_number: number; winner_team: string; reason: string }>;
  bomb_plants?: Array<{ tick: number; round_number: number; player_id: string; site: string }>;
  bomb_defuses?: Array<{ tick: number; round_number: number; player_id: string }>;
}

/** Player positioning stats */
export interface PlayerPositioningStats {
  player_id: string;
  player_name?: string;
  average_speed?: number;
  total_distance?: number;
  zones_visited?: number;
  zone_frequencies: Record<string, number>;
  zone_dwell_times: Record<string, number>;
}

/** Match positioning stats response */
export interface MatchPositioningStatsResponse {
  match_id: string;
  map_name?: string;
  player_stats: PlayerPositioningStats[];
  team_stats?: Record<string, {
    average_speed: number;
    total_distance: number;
    zone_control: Record<string, number>;
  }>;
}

/**
 * Match Analytics API wrapper
 */
export class MatchAnalyticsAPI {
  constructor(private client: ReplayApiClient) {}

  /**
   * Get trajectory data for an entire match
   */
  async getMatchTrajectory(
    gameId: string,
    matchId: string,
    options?: {
      player_ids?: string[];
      sample_rate?: number;
    }
  ): Promise<MatchTrajectoryResponse | null> {
    const params = new URLSearchParams();
    if (options?.player_ids) {
      params.append('player_ids', options.player_ids.join(','));
    }
    if (options?.sample_rate) {
      params.append('sample_rate', String(options.sample_rate));
    }

    const queryString = params.toString();
    const url = `/games/${gameId}/matches/${matchId}/trajectory${queryString ? `?${queryString}` : ''}`;

    const response = await this.client.get<MatchTrajectoryResponse>(url);
    return response.data || null;
  }

  /**
   * Get trajectory data for a specific round
   */
  async getRoundTrajectory(
    gameId: string,
    matchId: string,
    roundNumber: number,
    options?: {
      player_ids?: string[];
      sample_rate?: number;
    }
  ): Promise<RoundTrajectoryResponse | null> {
    const params = new URLSearchParams();
    if (options?.player_ids) {
      params.append('player_ids', options.player_ids.join(','));
    }
    if (options?.sample_rate) {
      params.append('sample_rate', String(options.sample_rate));
    }

    const queryString = params.toString();
    const url = `/games/${gameId}/matches/${matchId}/rounds/${roundNumber}/trajectory${queryString ? `?${queryString}` : ''}`;

    const response = await this.client.get<RoundTrajectoryResponse>(url);
    return response.data || null;
  }

  /**
   * Get heatmap data for an entire match
   */
  async getMatchHeatmap(
    gameId: string,
    matchId: string,
    options?: {
      player_ids?: string[];
      grid_size?: number;
      include_zones?: boolean;
    }
  ): Promise<MatchHeatmapResponse | null> {
    const params = new URLSearchParams();
    if (options?.player_ids) {
      params.append('player_ids', options.player_ids.join(','));
    }
    if (options?.grid_size) {
      params.append('grid_size', String(options.grid_size));
    }
    if (options?.include_zones) {
      params.append('include_zones', 'true');
    }

    const queryString = params.toString();
    const url = `/games/${gameId}/matches/${matchId}/heatmap${queryString ? `?${queryString}` : ''}`;

    const response = await this.client.get<MatchHeatmapResponse>(url);
    return response.data || null;
  }

  /**
   * Get heatmap data for a specific round
   */
  async getRoundHeatmap(
    gameId: string,
    matchId: string,
    roundNumber: number,
    options?: {
      player_ids?: string[];
      grid_size?: number;
    }
  ): Promise<RoundHeatmapResponse | null> {
    const params = new URLSearchParams();
    if (options?.player_ids) {
      params.append('player_ids', options.player_ids.join(','));
    }
    if (options?.grid_size) {
      params.append('grid_size', String(options.grid_size));
    }

    const queryString = params.toString();
    const url = `/games/${gameId}/matches/${matchId}/rounds/${roundNumber}/heatmap${queryString ? `?${queryString}` : ''}`;

    const response = await this.client.get<RoundHeatmapResponse>(url);
    return response.data || null;
  }

  /**
   * Get positioning statistics for a match
   */
  async getPositioningStats(
    gameId: string,
    matchId: string,
    options?: {
      player_ids?: string[];
    }
  ): Promise<MatchPositioningStatsResponse | null> {
    const params = new URLSearchParams();
    if (options?.player_ids) {
      params.append('player_ids', options.player_ids.join(','));
    }

    const queryString = params.toString();
    const url = `/games/${gameId}/matches/${matchId}/positioning-stats${queryString ? `?${queryString}` : ''}`;

    const response = await this.client.get<MatchPositioningStatsResponse>(url);
    return response.data || null;
  }

  /**
   * Get all events (kills, rounds, bombs) for a match
   * Transforms the flat events array from API into grouped format
   */
  async getMatchEvents(
    gameId: string,
    matchId: string,
    limit?: number
  ): Promise<MatchEventsResponse | null> {
    // API response format: { events: [], match_id, total_events, limit, offset }
    interface APIEvent {
      id: string;
      type: string;
      game_id: string;
      match_id: string;
      tick: number;
      event_time: number;
      round_number?: number;
      payload: Array<{ Key: string; Value: unknown }> | Record<string, unknown>;
      stats?: Record<string, unknown>;
    }
    
    interface APIResponse {
      events: APIEvent[];
      match_id: string;
      total_events: number;
      limit: number;
      offset: number;
    }
    
    const url = `/games/${gameId}/matches/${matchId}/events${limit ? `?limit=${limit}` : '?limit=1000'}`;
    const response = await this.client.get<APIResponse>(url);
    
    if (!response.data?.events) {
      return null;
    }
    
    const events = response.data.events;
    
    // Helper to extract payload value
    const getPayloadValue = (payload: APIEvent['payload'], key: string): unknown => {
      if (Array.isArray(payload)) {
        const item = payload.find(p => p.Key === key);
        return item?.Value;
      }
      return (payload as Record<string, unknown>)?.[key];
    };
    
    // Group events by type
    const kills: MatchKillEvent[] = [];
    const flashes: MatchFlashEvent[] = [];
    const heGrenades: MatchHEGrenadeEvent[] = [];
    const flashGrenades: MatchFlashGrenadeEvent[] = [];
    const smokes: MatchSmokeEvent[] = [];
    const molotovs: MatchMolotovEvent[] = [];
    const roundStarts: Array<{ tick: number; round_number: number }> = [];
    const roundEnds: Array<{ tick: number; round_number: number; winner_team: string; reason: string }> = [];
    const bombPlants: Array<{ tick: number; round_number: number; player_id: string; site: string }> = [];
    const bombDefuses: Array<{ tick: number; round_number: number; player_id: string }> = [];

    // Helper to parse Position3D from payload
    const parsePosition = (payload: APIEvent['payload'], prefix: string): Position3D | undefined => {
      const x = Number(getPayloadValue(payload, `${prefix}_x`) || getPayloadValue(payload, `${prefix}X`));
      const y = Number(getPayloadValue(payload, `${prefix}_y`) || getPayloadValue(payload, `${prefix}Y`));
      const z = Number(getPayloadValue(payload, `${prefix}_z`) || getPayloadValue(payload, `${prefix}Z`));
      if (isNaN(x) && isNaN(y) && isNaN(z)) return undefined;
      return { x: x || 0, y: y || 0, z: z || 0 };
    };

    // Alternative position parser for nested objects
    // Handles both direct object format {x, y, z} and Key-Value array format [{Key: "x", Value: ...}]
    const parseNestedPosition = (payload: APIEvent['payload'], key: string): Position3D | undefined => {
      const pos = getPayloadValue(payload, key);
      if (!pos) return undefined;
      
      // Handle Key-Value array format from API
      if (Array.isArray(pos)) {
        const getVal = (arr: Array<{Key: string; Value: unknown}>, k: string): number => {
          const item = arr.find(i => i.Key === k || i.Key === k.toLowerCase());
          return Number(item?.Value) || 0;
        };
        return { 
          x: getVal(pos, 'x'), 
          y: getVal(pos, 'y'), 
          z: getVal(pos, 'z') 
        };
      }
      
      // Handle direct object format
      const posObj = pos as { x?: number; y?: number; z?: number; X?: number; Y?: number; Z?: number };
      return { x: posObj.x ?? posObj.X ?? 0, y: posObj.y ?? posObj.Y ?? 0, z: posObj.z ?? posObj.Z ?? 0 };
    };
    
    let maxTick = 0;
    
    for (const event of events) {
      if (event.tick > maxTick) maxTick = event.tick;
      
      const payload = event.payload;
      
      switch (event.type.toLowerCase()) {
        case 'kill':
          kills.push({
            tick: event.tick,
            round_number: event.round_number || Number(getPayloadValue(payload, 'round_number')) || undefined,
            killer_id: String(getPayloadValue(payload, 'killerid') || getPayloadValue(payload, 'killer_steam_id') || getPayloadValue(payload, 'sourceplayerid') || ''),
            killer_name: String(getPayloadValue(payload, 'killername') || getPayloadValue(payload, 'killer_name') || ''),
            victim_id: String(getPayloadValue(payload, 'victimid') || getPayloadValue(payload, 'victim_steam_id') || getPayloadValue(payload, 'targetplayerid') || ''),
            victim_name: String(getPayloadValue(payload, 'victimname') || getPayloadValue(payload, 'victim_name') || ''),
            weapon: String(getPayloadValue(payload, 'weapon') || ''),
            headshot: Boolean(getPayloadValue(payload, 'headshot')),
            wallbang: Boolean(getPayloadValue(payload, 'is_wallbang') || getPayloadValue(payload, 'wallbang')),
            penetrated: Boolean(getPayloadValue(payload, 'penetrated')),
            through_smoke: Boolean(getPayloadValue(payload, 'is_through_smoke') || getPayloadValue(payload, 'throughsmoke')),
            no_scope: Boolean(getPayloadValue(payload, 'is_no_scope') || getPayloadValue(payload, 'noscope')),
            flash_assist: Boolean(getPayloadValue(payload, 'flashassist') || getPayloadValue(payload, 'flash_assister')),
            assister_id: String(getPayloadValue(payload, 'assisterid') || getPayloadValue(payload, 'assister_steam_id') || ''),
            assister_name: String(getPayloadValue(payload, 'assistername') || getPayloadValue(payload, 'assister_name') || ''),
          });
          break;
          
        case 'roundstart':
        case 'matchstart':
          roundStarts.push({
            tick: event.tick,
            round_number: Number(getPayloadValue(payload, 'round_number') || getPayloadValue(payload, 'total_rounds')) || 0,
          });
          break;
          
        case 'roundendid':
        case 'matchend':
          roundEnds.push({
            tick: event.tick,
            round_number: event.round_number || Number(getPayloadValue(payload, 'round_number') || getPayloadValue(payload, 'total_rounds')) || 0,
            winner_team: String(getPayloadValue(payload, 'winner') || getPayloadValue(payload, 'team_side') || ''),
            reason: String(getPayloadValue(payload, 'reason') || ''),
          });
          break;
          
        case 'bombplanted':
        case 'bomb_plant':
          bombPlants.push({
            tick: event.tick,
            round_number: event.round_number || Number(getPayloadValue(payload, 'round_number')) || 0,
            player_id: String(getPayloadValue(payload, 'player_steam_id') || getPayloadValue(payload, 'player_id') || getPayloadValue(payload, 'sourceplayerid') || ''),
            site: String(getPayloadValue(payload, 'bomb_site') || getPayloadValue(payload, 'site') || ''),
          });
          break;
          
        case 'bombdefused':
        case 'bomb_defuse':
          bombDefuses.push({
            tick: event.tick,
            round_number: event.round_number || Number(getPayloadValue(payload, 'round_number')) || 0,
            player_id: String(getPayloadValue(payload, 'player_steam_id') || getPayloadValue(payload, 'player_id') || getPayloadValue(payload, 'sourceplayerid') || ''),
          });
          break;

        case 'playerflashed':
          flashes.push({
            tick: event.tick,
            round_number: event.round_number || Number(getPayloadValue(payload, 'round_number')) || undefined,
            attacker_id: String(getPayloadValue(payload, 'attacker_steam_id') || ''),
            attacker_name: String(getPayloadValue(payload, 'attacker_name') || ''),
            victim_id: String(getPayloadValue(payload, 'victim_steam_id') || ''),
            victim_name: String(getPayloadValue(payload, 'victim_name') || ''),
            flash_duration: Number(getPayloadValue(payload, 'flash_duration')) || 0,
            is_team_flash: Boolean(getPayloadValue(payload, 'is_team_flash')),
            distance: Number(getPayloadValue(payload, 'distance')) || undefined,
          });
          break;

        case 'hegrenadeexplode':
          heGrenades.push({
            tick: event.tick,
            round_number: event.round_number || Number(getPayloadValue(payload, 'round_number')) || undefined,
            thrower_id: String(getPayloadValue(payload, 'thrower_steam_id') || getPayloadValue(payload, 'throwersteamid') || ''),
            thrower_name: String(getPayloadValue(payload, 'thrower_name') || getPayloadValue(payload, 'throwername') || ''),
            thrower_team: String(getPayloadValue(payload, 'thrower_team') || getPayloadValue(payload, 'throwerteam') || ''),
            thrower_position: parseNestedPosition(payload, 'thrower_position') || parseNestedPosition(payload, 'throwerposition') || parsePosition(payload, 'thrower'),
            grenade_position: parseNestedPosition(payload, 'grenade_position') || parseNestedPosition(payload, 'grenadeposition') || parsePosition(payload, 'grenade') || { x: 0, y: 0, z: 0 },
            damage: Number(getPayloadValue(payload, 'damage') || getPayloadValue(payload, 'total_damage')) || 0,
            players_hit: Number(getPayloadValue(payload, 'players_hit') || getPayloadValue(payload, 'playershit')) || 0,
            enemies_hit: Number(getPayloadValue(payload, 'enemies_hit') || getPayloadValue(payload, 'enemieshit')) || 0,
          });
          break;

        case 'flashexplode':
          flashGrenades.push({
            tick: event.tick,
            round_number: event.round_number || Number(getPayloadValue(payload, 'round_number')) || undefined,
            thrower_id: String(getPayloadValue(payload, 'thrower_steam_id') || getPayloadValue(payload, 'throwersteamid') || ''),
            thrower_name: String(getPayloadValue(payload, 'thrower_name') || getPayloadValue(payload, 'throwername') || ''),
            thrower_team: String(getPayloadValue(payload, 'thrower_team') || getPayloadValue(payload, 'throwerteam') || ''),
            thrower_position: parseNestedPosition(payload, 'thrower_position') || parseNestedPosition(payload, 'throwerposition') || parsePosition(payload, 'thrower'),
            grenade_position: parseNestedPosition(payload, 'grenade_position') || parseNestedPosition(payload, 'grenadeposition') || parsePosition(payload, 'grenade') || { x: 0, y: 0, z: 0 },
            players_flashed: Number(getPayloadValue(payload, 'players_flashed') || getPayloadValue(payload, 'playersflashed')) || 0,
            enemies_flashed: Number(getPayloadValue(payload, 'enemies_flashed') || getPayloadValue(payload, 'enemiesflashed')) || 0,
            avg_flash_duration: Number(getPayloadValue(payload, 'avg_flash_duration') || getPayloadValue(payload, 'avgflashduration')) || undefined,
          });
          break;

        case 'smokestart':
          smokes.push({
            tick: event.tick,
            round_number: event.round_number || Number(getPayloadValue(payload, 'round_number')) || undefined,
            thrower_id: String(getPayloadValue(payload, 'thrower_steam_id') || getPayloadValue(payload, 'throwersteamid') || ''),
            thrower_name: String(getPayloadValue(payload, 'thrower_name') || getPayloadValue(payload, 'throwername') || ''),
            thrower_team: String(getPayloadValue(payload, 'thrower_team') || getPayloadValue(payload, 'throwerteam') || ''),
            thrower_position: parseNestedPosition(payload, 'thrower_position') || parseNestedPosition(payload, 'throwerposition') || parsePosition(payload, 'thrower'),
            smoke_position: parseNestedPosition(payload, 'smoke_position') || parseNestedPosition(payload, 'smokeposition') || parseNestedPosition(payload, 'grenade_position') || parseNestedPosition(payload, 'grenadeposition') || parsePosition(payload, 'smoke') || { x: 0, y: 0, z: 0 },
          });
          break;

        case 'infernostart':
          molotovs.push({
            tick: event.tick,
            round_number: event.round_number || Number(getPayloadValue(payload, 'round_number')) || undefined,
            thrower_id: String(getPayloadValue(payload, 'thrower_steam_id') || getPayloadValue(payload, 'throwersteamid') || ''),
            thrower_name: String(getPayloadValue(payload, 'thrower_name') || getPayloadValue(payload, 'throwername') || ''),
            thrower_team: String(getPayloadValue(payload, 'thrower_team') || getPayloadValue(payload, 'throwerteam') || ''),
            thrower_position: parseNestedPosition(payload, 'thrower_position') || parseNestedPosition(payload, 'throwerposition') || parsePosition(payload, 'thrower'),
            fire_position: parseNestedPosition(payload, 'fire_position') || parseNestedPosition(payload, 'fireposition') || parseNestedPosition(payload, 'grenade_position') || parseNestedPosition(payload, 'grenadeposition') || parsePosition(payload, 'fire') || { x: 0, y: 0, z: 0 },
          });
          break;
      }
    }
    
    return {
      match_id: response.data.match_id,
      total_ticks: maxTick,
      kills,
      flashes: flashes.length > 0 ? flashes : undefined,
      he_grenades: heGrenades.length > 0 ? heGrenades : undefined,
      flash_grenades: flashGrenades.length > 0 ? flashGrenades : undefined,
      smokes: smokes.length > 0 ? smokes : undefined,
      molotovs: molotovs.length > 0 ? molotovs : undefined,
      round_starts: roundStarts.length > 0 ? roundStarts : undefined,
      round_ends: roundEnds.length > 0 ? roundEnds : undefined,
      bomb_plants: bombPlants.length > 0 ? bombPlants : undefined,
      bomb_defuses: bombDefuses.length > 0 ? bombDefuses : undefined,
    };
  }

  /**
   * Get current scoreboard for a match at a specific tick
   */
  async getMatchScoreboard(
    gameId: string,
    matchId: string,
    tick?: number
  ): Promise<MatchScoreboardResponse | null> {
    const url = tick !== undefined
      ? `/games/${gameId}/matches/${matchId}/scoreboard?tick=${tick}`
      : `/games/${gameId}/matches/${matchId}/scoreboard`;

    const response = await this.client.get<MatchScoreboardResponse>(url);
    return response.data || null;
  }
}

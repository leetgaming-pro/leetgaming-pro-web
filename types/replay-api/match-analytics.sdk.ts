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
}

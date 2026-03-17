/**
 * Lobby SDK - Matchmaking Lobby Management
 * Client-side API wrapper for lobby operations
 */

import type { ReplayApiClient } from './replay-api.client';
import type {
  MatchmakingLobby,
  CreateLobbyRequest,
  CreateLobbyResponse,
  JoinLobbyRequest,
  JoinLobbyResponse,
  LeaveLobbyRequest,
  SetPlayerReadyRequest,
  SetPlayerReadyResponse,
  StartMatchRequest,
  StartMatchResponse,
  CancelLobbyRequest,
  GetLobbyResponse,
  ListLobbiesRequest,
  ListLobbiesResponse,
  LobbyEvent,
  LobbyStats,
} from './lobby.types';

// Re-export types for convenience
export type { CreateLobbyRequest, CreateLobbyResponse, ListLobbiesResponse, GetLobbyResponse } from './lobby.types';

export class LobbyAPI {
  constructor(private client: ReplayApiClient) {}

  /**
   * Create a new matchmaking lobby
   */
  async createLobby(request: CreateLobbyRequest): Promise<CreateLobbyResponse | null> {
    const response = await this.client.post<CreateLobbyResponse>('/api/lobbies', request);
    return response.data || null;
  }

  /**
   * Get lobby details by ID
   */
  async getLobby(lobbyId: string): Promise<GetLobbyResponse | null> {
    const response = await this.client.get<GetLobbyResponse>(`/api/lobbies/${lobbyId}`);
    return response.data || null;
  }

  /**
   * List available lobbies with filters
   */
  async listLobbies(request: ListLobbiesRequest = {}): Promise<ListLobbiesResponse | null> {
    const params = new URLSearchParams();

    if (request.game_id) params.append('game_id', request.game_id);
    if (request.game_mode) params.append('game_mode', request.game_mode);
    if (request.region) params.append('region', request.region);
    if (request.status) params.append('status', request.status);
    if (request.limit) params.append('limit', request.limit.toString());
    if (request.offset) params.append('offset', request.offset.toString());

    const url = `/api/lobbies${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await this.client.get<ListLobbiesResponse>(url);
    return response.data || null;
  }

  /**
   * Join an existing lobby
   */
  async joinLobby(lobbyId: string, request: JoinLobbyRequest): Promise<JoinLobbyResponse | null> {
    const response = await this.client.post<JoinLobbyResponse>(
      `/api/lobbies/${lobbyId}/join`,
      request
    );
    return response.data || null;
  }

  /**
   * Leave a lobby
   */
  async leaveLobby(lobbyId: string, request: LeaveLobbyRequest): Promise<void> {
    // DELETE requests don't support body, so we ignore the request parameter
    // The player_id should be inferred from session on the backend
    await this.client.delete(`/api/lobbies/${lobbyId}/leave`);
  }

  /**
   * Set player ready status
   */
  async setPlayerReady(
    lobbyId: string,
    request: SetPlayerReadyRequest
  ): Promise<SetPlayerReadyResponse | null> {
    const response = await this.client.put<SetPlayerReadyResponse>(
      `/api/lobbies/${lobbyId}/ready`,
      request
    );
    return response.data || null;
  }

  /**
   * Start the match (creator only)
   */
  async startMatch(lobbyId: string, request: StartMatchRequest = {}): Promise<StartMatchResponse | null> {
    const response = await this.client.post<StartMatchResponse>(
      `/api/lobbies/${lobbyId}/start`,
      request
    );
    return response.data || null;
  }

  /**
   * Cancel the lobby (creator only)
   */
  async cancelLobby(lobbyId: string, request: CancelLobbyRequest = {}): Promise<void> {
    // DELETE requests don't support body, so we ignore the request parameter
    // The reason can be passed as query param if needed in the future
    await this.client.delete(`/api/lobbies/${lobbyId}`);
  }

  /**
   * Get lobby statistics
   */
  async getLobbyStats(gameId?: string, region?: string): Promise<LobbyStats | null> {
    const params = new URLSearchParams();
    if (gameId) params.append('game_id', gameId);
    if (region) params.append('region', region);

    const url = `/api/lobbies/stats${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await this.client.get<LobbyStats>(url);
    return response.data || null;
  }

  /**
   * Subscribe to lobby updates via WebSocket
   * Returns unsubscribe function
   *
   * @deprecated Use the `useLobbyWebSocket` React hook instead.
   * This SDK method cannot use React hooks internally;
   * `useLobbyWebSocket` provides the same real-time lobby
   * updates with ready-check event callbacks.
   */
  subscribeToLobbyUpdates(
    lobbyId: string,
    onEvent: (event: LobbyEvent) => void,
    onError?: (error: Error) => void
  ): () => void {
    console.warn(
      '[LobbyAPI] subscribeToLobbyUpdates is deprecated. ' +
      'Use the useLobbyWebSocket() React hook for real-time updates.'
    );
    return () => {};
  }

  /**
   * Poll lobby status (fallback for when WebSocket isn't available)
   */
  async pollLobbyStatus(
    lobbyId: string,
    onUpdate: (lobby: MatchmakingLobby) => void,
    intervalMs: number = 2000
  ): Promise<() => void> {
    const poll = async () => {
      const result = await this.getLobby(lobbyId);
      if (result?.lobby) {
        onUpdate(result.lobby);
      }
    };

    // Initial poll
    await poll();

    // Set up interval
    const intervalId = setInterval(poll, intervalMs);

    // Return stop function
    return () => {
      clearInterval(intervalId);
    };
  }

  /**
   * Get featured lobbies for homepage display
   */
  async getFeaturedLobbies(gameId?: string, limit: number = 8): Promise<ListLobbiesResponse | null> {
    const params = new URLSearchParams();
    if (gameId) params.append('game_id', gameId);
    params.append('limit', limit.toString());

    const url = `/api/lobbies/featured${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await this.client.get<ListLobbiesResponse>(url);
    return response.data || null;
  }

  /**
   * Search lobbies with filters
   */
  async searchLobbies(request: SearchLobbiesRequest = {}): Promise<ListLobbiesResponse | null> {
    const params = new URLSearchParams();

    if (request.game_id) params.append('game_id', request.game_id);
    if (request.game_mode) params.append('game_mode', request.game_mode);
    if (request.region) params.append('region', request.region);
    if (request.status) params.append('status', request.status);
    if (request.visibility) params.append('visibility', request.visibility);
    if (request.type) params.append('type', request.type);
    if (request.featured !== undefined) params.append('featured', String(request.featured));
    if (request.q) params.append('q', request.q);
    if (request.offset) params.append('offset', request.offset.toString());
    if (request.limit) params.append('limit', request.limit.toString());

    const url = `/api/lobbies${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await this.client.get<ListLobbiesResponse>(url);
    return response.data || null;
  }

  /**
   * Seed demo lobbies (development only)
   */
  async seedDemoLobbies(): Promise<ListLobbiesResponse | null> {
    const response = await this.client.post<ListLobbiesResponse>('/api/lobbies/seed', {});
    return response.data || null;
  }

  // ─── Readiness Confirmation / Commitment ───────────────────────────

  /**
   * Confirm player readiness for a lobby's ready check
   */
  async confirmReadiness(lobbyId: string): Promise<CommitmentConfirmResponse | null> {
    const response = await this.client.post<CommitmentConfirmResponse>(
      `/api/lobbies/${lobbyId}/commitments/confirm`,
      {}
    );
    return response.data || null;
  }

  /**
   * Decline readiness for a lobby's ready check
   */
  async declineReadiness(lobbyId: string, reason?: string): Promise<CommitmentSummaryResponse | null> {
    const response = await this.client.post<CommitmentSummaryResponse>(
      `/api/lobbies/${lobbyId}/commitments/decline`,
      { reason }
    );
    return response.data || null;
  }

  /**
   * Get current commitment/readiness summary for a lobby
   */
  async getCommitmentSummary(lobbyId: string): Promise<CommitmentSummaryResponse | null> {
    const response = await this.client.get<CommitmentSummaryResponse>(
      `/api/lobbies/${lobbyId}/commitments`
    );
    return response.data || null;
  }

  /**
   * Get game connection info (available after all players confirm)
   */
  async getGameConnectionInfo(lobbyId: string): Promise<GameConnectionInfoResponse | null> {
    const response = await this.client.get<GameConnectionInfoResponse>(
      `/api/lobbies/${lobbyId}/connection-info`
    );
    return response.data || null;
  }
}

// Extended search request
export interface SearchLobbiesRequest extends ListLobbiesRequest {
  visibility?: string;
  type?: string;
  featured?: boolean;
  q?: string;  // Text search
}

// Readiness confirmation types
export interface CommitmentConfirmResponse {
  commitment: {
    id: string;
    lobby_id: string;
    player_id: string;
    status: 'confirmed';
    responded_at: string;
  };
  summary: CommitmentSummaryResponse;
  all_ready: boolean;
}

export interface CommitmentSummaryResponse {
  lobby_id: string;
  total_players: number;
  confirmed_count: number;
  pending_count: number;
  declined_count: number;
  expired_count: number;
  all_confirmed: boolean;
  has_declined_or_expired: boolean;
  commitments: Array<{
    player_id: string;
    status: string;
    responded_at?: string;
    expires_at: string;
  }>;
}

export interface GameConnectionInfoResponse {
  lobby_id: string;
  match_id: string;
  game_id: string;
  region: string;
  server_url?: string;
  server_ip?: string;
  port?: number;
  passcode?: string;
  qr_code_data?: string;
  deep_link?: string;
  instructions: string;
  expires_at?: string;
}

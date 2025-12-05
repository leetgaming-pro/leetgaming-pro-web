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
   * NOTE: WebSocket support is not yet implemented in ReplayApiClient
   * Use pollLobbyStatus() as a fallback for now
   */
  subscribeToLobbyUpdates(
    lobbyId: string,
    onEvent: (event: LobbyEvent) => void,
    onError?: (error: Error) => void
  ): () => void {
    // TODO: Implement WebSocket support when backend is ready
    console.warn('WebSocket not yet implemented, use pollLobbyStatus() instead');
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
}

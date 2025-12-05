/**
 * Tournament API SDK
 * Clean, minimal API wrapper for tournament operations
 * Follows Clean Architecture + CQRS pattern from backend
 */

import { ReplayApiClient } from './replay-api.client';
import type {
  Tournament,
  TournamentStatus,
  CreateTournamentRequest,
  UpdateTournamentRequest,
  RegisterPlayerRequest,
  CompleteTournamentRequest,
  CancelTournamentRequest,
  TournamentListFilters,
} from './tournament.types';

export interface TournamentsResult {
  tournaments: Tournament[];
  total: number;
  limit: number;
  offset: number;
}

export class TournamentAPI {
  constructor(private client: ReplayApiClient) {}

  // --- Query Operations (TournamentReader) ---

  /**
   * Get a single tournament by ID
   */
  async getTournament(tournamentId: string): Promise<Tournament | null> {
    const response = await this.client.get<Tournament>(`/tournaments/${tournamentId}`);
    if (response.error) {
      console.error('Failed to fetch tournament:', response.error);
      return null;
    }
    return response.data || null;
  }

  /**
   * List tournaments with optional filters
   */
  async listTournaments(filters: TournamentListFilters = {}): Promise<TournamentsResult | null> {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((v) => params.append(key, String(v)));
        } else {
          params.append(key, String(value));
        }
      }
    });

    const queryString = params.toString();
    const url = queryString ? `/tournaments?${queryString}` : '/tournaments';

    const response = await this.client.get<TournamentsResult>(url);
    if (response.error) {
      console.error('Failed to fetch tournaments:', response.error);
      return null;
    }
    return response.data || null;
  }

  /**
   * Get upcoming tournaments (registration open or starting soon)
   */
  async getUpcomingTournaments(gameId: string, limit = 10): Promise<Tournament[] | null> {
    const params = new URLSearchParams({
      game_id: gameId,
      limit: String(limit),
    });

    const response = await this.client.get<Tournament[]>(`/tournaments/upcoming?${params}`);
    if (response.error) {
      console.error('Failed to fetch upcoming tournaments:', response.error);
      return null;
    }
    return response.data || null;
  }

  /**
   * Get tournaments a player is registered in
   */
  async getPlayerTournaments(playerId: string): Promise<Tournament[] | null> {
    const response = await this.client.get<Tournament[]>(`/players/${playerId}/tournaments`);
    if (response.error) {
      console.error('Failed to fetch player tournaments:', response.error);
      return null;
    }
    return response.data || null;
  }

  /**
   * Get tournaments created by an organizer
   */
  async getOrganizerTournaments(organizerId: string): Promise<Tournament[] | null> {
    const response = await this.client.get<Tournament[]>(`/organizers/${organizerId}/tournaments`);
    if (response.error) {
      console.error('Failed to fetch organizer tournaments:', response.error);
      return null;
    }
    return response.data || null;
  }

  // --- Command Operations (TournamentCommand) ---

  /**
   * Create a new tournament
   */
  async createTournament(request: CreateTournamentRequest): Promise<Tournament | null> {
    const response = await this.client.post<Tournament>('/tournaments', request);
    if (response.error) {
      console.error('Failed to create tournament:', response.error);
      return null;
    }
    return response.data || null;
  }

  /**
   * Update tournament details (only before start)
   */
  async updateTournament(
    tournamentId: string,
    request: UpdateTournamentRequest
  ): Promise<Tournament | null> {
    const response = await this.client.put<Tournament>(`/tournaments/${tournamentId}`, request);
    if (response.error) {
      console.error('Failed to update tournament:', response.error);
      return null;
    }
    return response.data || null;
  }

  /**
   * Delete a tournament (only in draft/registration)
   */
  async deleteTournament(tournamentId: string): Promise<boolean> {
    const response = await this.client.delete(`/tournaments/${tournamentId}`);
    if (response.error) {
      console.error('Failed to delete tournament:', response.error);
      return false;
    }
    return response.status === 200 || response.status === 204;
  }

  /**
   * Register a player for the tournament
   */
  async registerPlayer(
    tournamentId: string,
    request: RegisterPlayerRequest
  ): Promise<Tournament | null> {
    const response = await this.client.post<Tournament>(
      `/tournaments/${tournamentId}/register`,
      request
    );
    if (response.error) {
      console.error('Failed to register player:', response.error);
      return null;
    }
    return response.data || null;
  }

  /**
   * Unregister a player from the tournament
   */
  async unregisterPlayer(tournamentId: string, playerId: string): Promise<Tournament | null> {
    const response = await this.client.delete<Tournament>(
      `/tournaments/${tournamentId}/players/${playerId}`
    );
    if (response.error) {
      console.error('Failed to unregister player:', response.error);
      return null;
    }
    return response.data || null;
  }

  /**
   * Open tournament registration
   */
  async openRegistration(tournamentId: string): Promise<Tournament | null> {
    const response = await this.client.post<Tournament>(
      `/tournaments/${tournamentId}/registration/open`,
      {}
    );
    if (response.error) {
      console.error('Failed to open registration:', response.error);
      return null;
    }
    return response.data || null;
  }

  /**
   * Close tournament registration
   */
  async closeRegistration(tournamentId: string): Promise<Tournament | null> {
    const response = await this.client.post<Tournament>(
      `/tournaments/${tournamentId}/registration/close`,
      {}
    );
    if (response.error) {
      console.error('Failed to close registration:', response.error);
      return null;
    }
    return response.data || null;
  }

  /**
   * Start the tournament
   */
  async startTournament(tournamentId: string): Promise<Tournament | null> {
    const response = await this.client.post<Tournament>(`/tournaments/${tournamentId}/start`, {});
    if (response.error) {
      console.error('Failed to start tournament:', response.error);
      return null;
    }
    return response.data || null;
  }

  /**
   * Complete the tournament with winners
   */
  async completeTournament(
    tournamentId: string,
    request: CompleteTournamentRequest
  ): Promise<Tournament | null> {
    const response = await this.client.post<Tournament>(
      `/tournaments/${tournamentId}/complete`,
      request
    );
    if (response.error) {
      console.error('Failed to complete tournament:', response.error);
      return null;
    }
    return response.data || null;
  }

  /**
   * Cancel the tournament
   */
  async cancelTournament(
    tournamentId: string,
    request: CancelTournamentRequest
  ): Promise<Tournament | null> {
    const response = await this.client.post<Tournament>(
      `/tournaments/${tournamentId}/cancel`,
      request
    );
    if (response.error) {
      console.error('Failed to cancel tournament:', response.error);
      return null;
    }
    return response.data || null;
  }
}

// Re-export types for convenience
export type {
  Tournament,
  TournamentStatus,
  TournamentFormat,
  TournamentRules,
  TournamentPlayer,
  TournamentMatch,
  TournamentWinner,
  CreateTournamentRequest,
  UpdateTournamentRequest,
  RegisterPlayerRequest,
  CompleteTournamentRequest,
  CancelTournamentRequest,
  TournamentListFilters,
} from './tournament.types';

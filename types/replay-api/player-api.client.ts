import { Loggable } from "@/lib/logger";
import { RouteBuilder } from "./replay-api.route-builder";
import {
  ReplayApiSettings,
  ReplayApiResourceType,
  ReplayApiSettingsMock,
} from "./settings";
import { PlayerProfile, CreatePlayerProfileRequest } from "./entities.types";
import {
  PlayerSkill,
  PlayerTrait,
  TeamHistoryEntry,
} from "./player-profile.types";

// Type aliases for backwards compatibility
type Player = PlayerProfile;
type PlayerSearchResult = PlayerProfile;

export interface PlayerApiClientConfig {
  settings?: ReplayApiSettings;
  logger: Loggable;
}

export class PlayerApiClient {
  private routeBuilder: RouteBuilder;
  private settings: ReplayApiSettings;
  private logger: Loggable;

  constructor(config: PlayerApiClientConfig) {
    this.settings = config.settings || {
      ...ReplayApiSettingsMock,
      baseUrl:
        process.env.NEXT_PUBLIC_REPLAY_API_URL ||
        process.env.REPLAY_API_URL ||
        "http://localhost:8080",
    };
    this.logger = config.logger;
    this.routeBuilder = new RouteBuilder(this.settings, this.logger);
  }

  async createPlayer(
    request: CreatePlayerProfileRequest,
    authToken: string
  ): Promise<PlayerProfile | undefined> {
    return this.routeBuilder.post<CreatePlayerProfileRequest, PlayerProfile>(
      ReplayApiResourceType.Player,
      request,
      authToken
    );
  }

  async searchPlayers(
    query: string,
    authToken?: string
  ): Promise<PlayerSearchResult | undefined> {
    return this.routeBuilder.search<PlayerSearchResult>(
      ReplayApiResourceType.Player,
      query,
      authToken
    );
  }

  async getPlayer(
    playerId: string,
    _authToken?: string
  ): Promise<Player | undefined> {
    // TODO: review _authToken?, its always mandatory! even unauth, we can generate guest tokens
    return new RouteBuilder(this.settings, this.logger)
      .route(ReplayApiResourceType.Player, { playerId })
      .get<Player>(ReplayApiResourceType.Player);
  }

  async getPlayerSkills(
    playerId: string,
  ): Promise<PlayerSkill[]> {
    try {
      const result = await new RouteBuilder(this.settings, this.logger)
        .route(ReplayApiResourceType.Player, { playerId })
        .get<PlayerSkill[]>("skills" as ReplayApiResourceType);
      return result || [];
    } catch {
      this.logger.warn("Failed to fetch player skills", { playerId });
      return [];
    }
  }

  async getPlayerTraits(
    playerId: string,
  ): Promise<PlayerTrait[]> {
    try {
      const result = await new RouteBuilder(this.settings, this.logger)
        .route(ReplayApiResourceType.Player, { playerId })
        .get<PlayerTrait[]>("traits" as ReplayApiResourceType);
      return result || [];
    } catch {
      this.logger.warn("Failed to fetch player traits", { playerId });
      return [];
    }
  }

  async getPlayerTeamHistory(
    playerId: string,
  ): Promise<TeamHistoryEntry[]> {
    try {
      const result = await new RouteBuilder(this.settings, this.logger)
        .route(ReplayApiResourceType.Player, { playerId })
        .get<TeamHistoryEntry[]>("team-history" as ReplayApiResourceType);
      return result || [];
    } catch {
      this.logger.warn("Failed to fetch player team history", { playerId });
      return [];
    }
  }

  async endorseSkill(
    playerId: string,
    skillId: string,
    authToken: string
  ): Promise<boolean> {
    try {
      await this.routeBuilder.post<{ skill_id: string }, Record<string, unknown>>(
        `players/${playerId}/skills/${skillId}/endorse` as unknown as ReplayApiResourceType,
        { skill_id: skillId },
        authToken
      );
      return true;
    } catch {
      this.logger.warn("Failed to endorse skill", { playerId, skillId });
      return false;
    }
  }

  async endorseTrait(
    playerId: string,
    traitId: string,
    authToken: string
  ): Promise<boolean> {
    try {
      await this.routeBuilder.post<{ trait_id: string }, Record<string, unknown>>(
        `players/${playerId}/traits/${traitId}/endorse` as unknown as ReplayApiResourceType,
        { trait_id: traitId },
        authToken
      );
      return true;
    } catch {
      this.logger.warn("Failed to endorse trait", { playerId, traitId });
      return false;
    }
  }
}

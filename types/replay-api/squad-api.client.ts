import { Loggable } from "@/lib/logger";
import { RouteBuilder } from "./replay-api.route-builder";
import {
  ReplayApiSettings,
  ReplayApiResourceType,
  ReplayApiSettingsMock,
} from "./settings";
import { Squad } from "./entities.types";
import { TeamRosterHistoryEntry } from "./player-profile.types";

// Type aliases for this client
type CreateSquadRequest = Partial<Squad>;
type SquadSearchResult = Squad;

export interface SquadApiClientConfig {
  settings?: ReplayApiSettings;
  logger: Loggable;
}

export class SquadApiClient {
  private routeBuilder: RouteBuilder;
  private settings: ReplayApiSettings;
  private logger: Loggable;

  constructor(config: SquadApiClientConfig) {
    this.settings = config.settings || {
      ...ReplayApiSettingsMock,
      baseUrl:
        process.env.NEXT_PUBLIC_REPLAY_API_URL ||
        process.env.REPLAY_API_URL ||
        "https://api.leetgaming.pro",
    };
    this.logger = config.logger;
    this.routeBuilder = new RouteBuilder(this.settings, this.logger);
  }

  async createSquad(
    request: CreateSquadRequest,
    authToken: string
  ): Promise<Squad | undefined> {
    return this.routeBuilder.post<CreateSquadRequest, Squad>(
      ReplayApiResourceType.Squad,
      request,
      authToken
    );
  }

  async searchSquads(
    query?: string | object,
    authToken?: string
  ): Promise<SquadSearchResult[] | undefined> {
    // Convert object to JSON string if needed
    const queryString = typeof query === 'object' ? JSON.stringify(query) : (query || '{}');

    const result = await this.routeBuilder.search<SquadSearchResult[] | SquadSearchResult>(
      ReplayApiResourceType.Squad,
      queryString,
      authToken
    );

    // Normalize to array
    if (Array.isArray(result)) {
      return result;
    } else if (result) {
      return [result];
    }
    return [];
  }

  async getSquad(
    squadId: string,
    _authToken?: string
  ): Promise<Squad | undefined> {
    // TODO: review _authToken?, its always mandatory! even unauth, we can generate guest tokens
    return new RouteBuilder(this.settings, this.logger)
      .route(ReplayApiResourceType.Squad, { squadId })
      .get<Squad>(ReplayApiResourceType.Squad);
  }

  async getSquadRosterHistory(
    squadId: string,
  ): Promise<TeamRosterHistoryEntry[]> {
    try {
      const result = await new RouteBuilder(this.settings, this.logger)
        .route(ReplayApiResourceType.Squad, { squadId })
        .get<TeamRosterHistoryEntry[]>("roster-history" as ReplayApiResourceType);
      return result || [];
    } catch {
      return [];
    }
  }
}

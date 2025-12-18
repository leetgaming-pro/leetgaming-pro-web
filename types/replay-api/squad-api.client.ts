import { Loggable } from "@/lib/logger";
import { RouteBuilder } from "./replay-api.route-builder";
import {
  ReplayApiSettings,
  ReplayApiResourceType,
  ReplayApiSettingsMock,
} from "./settings";
import { Squad } from "./entities.types";

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
        "http://localhost:8080",
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
    query: string,
    authToken?: string
  ): Promise<SquadSearchResult | undefined> {
    return this.routeBuilder.search<SquadSearchResult>(
      ReplayApiResourceType.Squad,
      query,
      authToken
    );
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
}

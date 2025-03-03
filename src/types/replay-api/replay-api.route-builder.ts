import { Loggable } from "@/lib/logger";
import { ApiResource, ReplayApiResourceType, ReplayApiSettings } from "./settings";
import { CSFilters, UUIDParams } from "./searchable";

export interface ResultOptions {
  offset?: string | number,
  sort?: string | string[]
}

export type RootFilterMethod = 'forGame' | 'forMatch' | 'forRound' | 'forPlayer' | 'forTeam'

export type ReplayApiAction = [string, ReplayApiResourceType, ({
  [key: string]: string;
} | undefined)?]

export class RouteBuilder { // TODO: refactor ==>> criar interface (generica) para retornos
  private pathSegments: string[] = [];
  private params: { [key: string]: string } = {};

  constructor(readonly settings: ReplayApiSettings, readonly logger: Loggable) { }

  withFilter({ gameIds, matchIds, roundNumbers, playerIds }: CSFilters): RouteBuilder {
    return this.forGame(gameIds)
    .forMatch(matchIds)
    .forRound(roundNumbers)
    .forPlayer(playerIds)
  }

  forGame(gameId?: UUIDParams): RouteBuilder {
    if (!gameId) {
      return this
    }

    if (Array.isArray(gameId)) {
      if (gameId.length > 1) {
        return this.filter({ gameId })
      }

      return this.route(ReplayApiResourceType.Game, { gameId: gameId[0] });
    }

    return this.route(ReplayApiResourceType.Game, { gameId: gameId });
  }

  forMatch(matchId?: UUIDParams): RouteBuilder {
    if (!matchId) {
      return this
    }

    if (Array.isArray(matchId)) {
      if (matchId.length > 1) {
        return this.filter({ matchId })
      }

      return this.route(ReplayApiResourceType.Match, { matchId: matchId[0] });
    }

    return this.route(ReplayApiResourceType.Match, { matchId }); 
  }

  forRound(roundId?: UUIDParams): RouteBuilder {
    if (!roundId) return this

    if (Array.isArray(roundId)) {
      if (roundId.length > 1) {
        return this.filter({ roundId })
      }

      return this.route(ReplayApiResourceType.Round, { roundId: roundId[0] });
    }

    return this.route(ReplayApiResourceType.Round, { roundId });
  }

  forPlayer(playerId?: UUIDParams): RouteBuilder {
    if (!playerId) return this

    if (Array.isArray(playerId)) {
      if (playerId.length > 1) {
        return this.filter({ playerId })
      }

      return this.route(ReplayApiResourceType.Round, { playerId: playerId[0] });
    }

    return this.route(ReplayApiResourceType.Player, { playerId });
  }

  forTeam(teamId: UUIDParams): RouteBuilder {
    if (Array.isArray(teamId)) {
      if (teamId.length > 1) {
        return this.filter({ teamId })
      }

      return this.route(ReplayApiResourceType.Round, { teamId: teamId[0] });
    }

    return this.route(ReplayApiResourceType.Team, { teamId });
  }

  async get<T extends Object>(resource: ReplayApiResourceType, resultOptions?: ResultOptions): Promise<T | undefined> {
    const url = this.buildUrl(resource, resultOptions)

    const res: Response = await fetch(url, {
      method: 'GET',
    })

    const content: T | undefined = await res.json().catch((e) => {
      this.logger.error(e, `json: error deserializing response body from: GET ${url} => ${res.status}-${res.statusText}`, resource, resultOptions)
      return undefined
    })

    if (!res.ok) {
      const msg = `Status: ${res.status}. Description: ${res.statusText}. (JSON: ${content}))`

      throw new Error(msg)
    }

    return content
  }

  route(
    resourceType: ReplayApiResourceType,
    params?: { [key: string]: string }
  ): RouteBuilder {
    const resource = this.findResource(resourceType, this.settings.resources);
    if (!resource) {
      throw new Error(`Resource not found: ${resourceType}`);
    }

    this.pathSegments.push(this.buildPath(resource, params));
    return this;
  }

  filter(params: { [key: string]: string[] }): RouteBuilder {
    this.params = Object.assign(this.params, params)

    return this
  }

  fromAction(...actions: ReplayApiAction[]): RouteBuilder  {
    for (const [action, resourceType, params] of actions) {
      if (!params) {
        continue
      }

      if (action === "with") {
        this.route(resourceType, params);
      } else if (action.startsWith("for")) {
        for (const k of Object.keys(params)) {
          this[action as RootFilterMethod](params[k] as any); 
        }
      }
    }

    return this
  }

  private buildQueryStrings(resultOptions?: ResultOptions): URLSearchParams {
    const params = new URLSearchParams();
    if (resultOptions) {
      for (const [key, value] of Object.entries(resultOptions)) {
        if (value !== undefined) {
          params.append(key, value.toString()); // Ensure value is a string
        }
      }
    }
    return params;
  }

  private buildPath(resource: ApiResource, params?: { [key: string]: string }): string {
    let path = resource.path;

    if (resource.dynamic && resource.paramName && params && params[resource.paramName]) {
      path = path.replace(`:${resource.paramName}`, encodeURIComponent(params[resource.paramName]));
      delete params[resource.paramName];
    }

    this.params = { ...this.params, ...params };
    return path;
  }

  public buildUrl(resource: ReplayApiResourceType, resultOptions?: ResultOptions, omitBaseUrl = false): string {
    const pathSegments = [...this.pathSegments, resource];
    const url = new URL(pathSegments.join('/'), this.settings.baseUrl);

    url.search = this.buildQueryStrings(resultOptions).toString();

    if (url.pathname.includes(":")) {
      throw new Error(`Missing required parameters in the route (${url.pathname})`);
    }

    return omitBaseUrl ? url.pathname + url.search : url.toString();
  }

  private findResource(
    resourceType: ReplayApiResourceType,
    resources: ApiResource[]
  ): ApiResource | null {
    for (const res of resources) {
      if (res.type === resourceType) return res;
      if (res.children) {
        const found = this.findResource(resourceType, res.children);
        if (found) return found;
      }
    }
    return null;
  }
}
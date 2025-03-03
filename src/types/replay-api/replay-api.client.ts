import { ReplayApiSettings, ReplayApiResourceType } from "./settings";
import { ResultOptions, RouteBuilder } from "./replay-api.route-builder";
import { Loggable } from "@/lib/logger";

export interface ApiResponse<T> {
  data?: T;
  error?: any;
  nextOffset?: number | string
}

export class ReplayApiClient {
  private routeBuilder: RouteBuilder;

  constructor(private settings: ReplayApiSettings, private logger: Loggable) {
    this.routeBuilder = new RouteBuilder(settings, logger);
  }

  async getResource<T>(
    resourceType: ReplayApiResourceType,
    filters: { resourceType: ReplayApiResourceType, params?: { [key: string]: string } }[],
    resultOptions?: ResultOptions
  ): Promise<ApiResponse<T> | undefined> {
    for (const { resourceType, params } of filters) {
      this.routeBuilder.route(resourceType, params);
    }

    return this.routeBuilder.get(resourceType, resultOptions);
  }
}

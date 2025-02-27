import { Loggable } from "@/lib/logger";
import { ResultOptions, RouteBuilder } from "./replay-api.route-builder";
import { ReplayApiSettingsMock, ReplayApiResourceType } from "./settings";
import { ClutchSituationStats, EconomyStats, EventStats, HighlightStats, MapRegionStats, MatchStats, Stats, StrategyStats } from "./stats.types";

const loggerMock: any = {
  error: (e: any) => console.error(e),
  info: (msg: string, ...args: any[]) => console.info(msg, args)
}

describe("RouteBuilder - Complex Scenarios", () => {
  const mapApi = new RouteBuilder<MapRegionStats>(ReplayApiSettingsMock, loggerMock);
  const strategyApi = new RouteBuilder<StrategyStats>(ReplayApiSettingsMock, loggerMock);
  const clutchApi = new RouteBuilder<ClutchSituationStats>(ReplayApiSettingsMock, loggerMock);
  const highlightApi = new RouteBuilder<HighlightStats>(ReplayApiSettingsMock, loggerMock);
  const eventApi = new RouteBuilder<EventStats>(ReplayApiSettingsMock, loggerMock);

  const testCases: {
    description: string;
    filters: [ReplayApiResourceType, { [key: string]: string }?][];
    endpoint: RouteBuilder<Stats>;
    resultOptions?: ResultOptions;
    mockStatusCode?: number;
    expectedRoute: string;
    resource: ReplayApiResourceType;
    error?: string;
  }[] = [
    {
      description: "Player economy stats in a specific game",
      filters: [
        [ReplayApiResourceType.Game, { gameId: "cs2" }],
        [ReplayApiResourceType.Player, { playerId: "player123" }],
      ],
      endpoint: new RouteBuilder<EconomyStats>(ReplayApiSettingsMock, loggerMock),
      resource: ReplayApiResourceType.Economy,
      expectedRoute: `/games/cs2/players/player123/economy`,
    },
    {
      description: "Team strategy stats in a specific round of a match",
      filters: [
        [ReplayApiResourceType.Game, { gameId: "cs2" }],
        [ReplayApiResourceType.Match, { matchId: "match456" }],
        [ReplayApiResourceType.Round, { roundId: "round789" }],
        [ReplayApiResourceType.Team, { teamId: "teamAlpha" }],
      ],
      endpoint: strategyApi,
      resource: ReplayApiResourceType.Strategy,
      expectedRoute: `/games/cs2/matches/match456/rounds/round789/teams/teamAlpha/strategy`,
    },
    {
      description: "Clutch stats for a specific player across all rounds of a match",
      filters: [
        [ReplayApiResourceType.Game, { gameId: "cs2" }],
        [ReplayApiResourceType.Match, { matchId: "match999" }],
        [ReplayApiResourceType.Player, { playerId: "pro1" }],
      ],
      endpoint: clutchApi,
      resource: ReplayApiResourceType.ClutchSituation,
      expectedRoute: `/games/cs2/matches/match999/players/pro1/clutch-situation`,
    },
    {
      description: "Nested highlights within a round of a game",
      filters: [
        [ReplayApiResourceType.Game, { gameId: "cs2" }],
        [ReplayApiResourceType.Round, { roundId: "round1" }],
      ],
      endpoint: highlightApi,
      resource: ReplayApiResourceType.Highlight,
      expectedRoute: `/games/cs2/rounds/round1/highlights`,
    },
    {
      description: "Player events across multiple matches (no round specified)",
      filters: [
        [ReplayApiResourceType.Game, { gameId: "cs2" }],
        [ReplayApiResourceType.Player, { playerId: "ninja" }],
      ],
      endpoint: eventApi,
      resource: ReplayApiResourceType.Event,
      expectedRoute: `/games/cs2/players/ninja/events`,
    },
    {
      description: "Player stats filtered by game, match, and round",
      filters: [
        [ReplayApiResourceType.Game, { gameId: "cs2" }],
        [ReplayApiResourceType.Match, { matchId: "match123" }],
        [ReplayApiResourceType.Round, { roundId: "round456" }],
        [ReplayApiResourceType.Player, { playerId: "player123" }],
      ],
      endpoint: new RouteBuilder<EconomyStats>(ReplayApiSettingsMock, loggerMock),
      resource: ReplayApiResourceType.Economy,
      resultOptions: { offset: "2", sort: "date_desc" },
      expectedRoute: `/games/cs2/matches/match123/rounds/round456/players/player123/economy?offset=2&sort=date_desc`,
    },
    {
      description: "List of matches for a game with pagination and sorting",
      filters: [
        [ReplayApiResourceType.Game, { gameId: "cs2" }],
      ],
      endpoint: new RouteBuilder<MatchStats>(ReplayApiSettingsMock, loggerMock),
      resource: ReplayApiResourceType.Match,
      resultOptions: { offset: "2", sort: "date_desc" },
      expectedRoute: `/games/cs2/matches?offset=2&sort=date_desc`,
    },
  ];

  testCases.forEach(({ description, filters, endpoint, resource, expectedRoute, resultOptions, error }) => {
    it(description, () => {
      const req = filters.reduce((acc, [resourceType, params]) => {
        return acc.route(resourceType, params);
      }, endpoint);
  
      const builtUrl = req.buildUrl(resource, resultOptions);
  
      if (error) {
        expect(() => req.buildUrl(resource, resultOptions)).toThrow(error);
      } else {
        expect(builtUrl).toEqual(`${ReplayApiSettingsMock.baseUrl}${expectedRoute}`);
      }
    });
  });

});
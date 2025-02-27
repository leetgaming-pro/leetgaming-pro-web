// replay-api-settings.ts

interface ApiSettings {
  baseUrl: string;
}

export interface ApiResource {
  type: ReplayApiResourceType;
  path: string;
  children?: ApiResource[];
  dynamic?: boolean;
  paramName?: string;
}

export enum ReplayApiResourceType {
  Health = "health",
  Game = "games",
  Highlight = "highlights",
  Event = "events",

  Economy = "economy",
  Strategy = "strategy",
  Positioning = "positioning",
  Utility = "utility",
  ClutchSituation = "clutch-situation",
  Ace = "ace",
  MapRegionStats = "map-region-stats",
  BattleStats = "battle-stats",

  Replay = "replays",
  Match = "matches",
  Round = "rounds",
  Player = "players",
  Side = "sides",
  Team = "teams",
  Onboarding = "onboarding",
  Steam = "steam",
}

export interface ReplayApiSettings extends ApiSettings {
  resources: ApiResource[];
}

const Resources: ApiResource[] = [
  { type: ReplayApiResourceType.Economy, path: "economy" },
  { type: ReplayApiResourceType.Strategy, path: "strategy" },
  { type: ReplayApiResourceType.Positioning, path: "positioning" },
  { type: ReplayApiResourceType.Utility, path: "utility" },
  { type: ReplayApiResourceType.ClutchSituation, path: "clutch-situation" },
  { type: ReplayApiResourceType.Ace, path: "ace" },
  { type: ReplayApiResourceType.MapRegionStats, path: "map-region-stats" },
  { type: ReplayApiResourceType.BattleStats, path: "battle-stats" },

  {
    type: ReplayApiResourceType.Game,
    path: "games/:gameId",
    dynamic: true,
    paramName: "gameId",
  },
  {
    type: ReplayApiResourceType.Match,
    path: "matches/:matchId",
    dynamic: true,
    paramName: "matchId",
  },
  {
    type: ReplayApiResourceType.Round,
    path: "rounds/:roundId",
    dynamic: true,
    paramName: "roundId",
  },
  {
    type: ReplayApiResourceType.Player,
    path: "players/:playerId",
    dynamic: true,
    paramName: "playerId",
  },
  { type: ReplayApiResourceType.Team, path: "teams/:teamId", dynamic: true, paramName: "teamId" },
  { type: ReplayApiResourceType.Event, path: "events" },
  { type: ReplayApiResourceType.Highlight, path: "highlights" },
  {
    type: ReplayApiResourceType.Replay,
    path: "replays/:replayId",
    dynamic: true,
    paramName: "replayId",
  },

  // Health Check
  { type: ReplayApiResourceType.Health, path: "health" },

  // Services
  { type: ReplayApiResourceType.Onboarding, path: "onboarding" },
  { type: ReplayApiResourceType.Steam, path: "steam" },
];


export const ReplayApiSettingsMock: ReplayApiSettings = {
  baseUrl: "http://replay.leetgaming.pro",
  resources: Resources,
};


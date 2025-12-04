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

/**
 * Resource type identifiers for API routing
 * Based on replay-api/pkg/domain/resource_type.go
 */
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
  PlayerProfile = "player-profiles",
  Side = "sides",
  Team = "teams",
  Squad = "squads",
  
  // IAM
  User = "users",
  Group = "groups",
  Profile = "profiles",
  Membership = "memberships",
  
  // Onboarding
  Onboarding = "onboarding",
  Steam = "steam",
  Google = "google",
  
  // Sharing
  ShareToken = "share-tokens",
}

/**
 * Supported game identifiers
 * Based on replay-api/pkg/domain/game_id_key.go
 */
export enum GameIDKey {
  CounterStrike2 = 'cs2',
  CounterStrikeGO = 'csgo',
  Valorant = 'valorant',
  LeagueOfLegends = 'lol',
  Dota2 = 'dota2',
}

/**
 * Network/platform identifiers
 * Based on replay-api/pkg/domain/network_id_key.go
 */
export enum NetworkIDKey {
  Valve = 'valve',
  FACEIT = 'faceit',
  ESEA = 'esea',
  Community = 'community',
  LAN = 'lan',
  Unknown = 'unknown',
}

/**
 * Visibility type enumeration
 * Based on replay-api/pkg/domain/entity.go
 */
export enum VisibilityTypeKey {
  Public = 'public',
  Restricted = 'restricted',
  Private = 'private',
  Custom = 'custom',
}

/**
 * Bit flags representing access levels in the resource hierarchy
 * Based on replay-api/pkg/domain/resource_owner.go
 */
export enum IntendedAudienceKey {
  UserAudienceIDKey = 1,    // bit 0
  GroupAudienceIDKey = 2,   // bit 1
  ClientAudienceIDKey = 4,  // bit 2
  TenantAudienceIDKey = 8,  // bit 3
}

/**
 * Share token status
 * Based on replay-api/pkg/domain/share_token.go
 */
export enum ShareTokenStatus {
  Active = 'active',
  Used = 'used',
  Expired = 'expired',
  Revoked = 'revoked',
}

/**
 * OAuth-like grant types for RID tokens
 * Based on replay-api/pkg/domain/rid_token.go
 */
export enum GrantType {
  AuthorizationCode = 'authorization_code',
  ClientCredentials = 'client_credentials',
  RefreshToken = 'refresh_token',
}

/**
 * RID token expiration duration (1 hour in milliseconds)
 */
export const RID_TOKEN_EXPIRATION_MS = 60 * 60 * 1000;

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


/**
 * Get the base URL for the replay API based on environment configuration
 * Supports multi-region deployments via REPLAY_API_URL and REPLAY_API_REGION
 */
function getReplayApiBaseUrl(): string {
  // Primary: Use explicit REPLAY_API_URL if set
  if (process.env.REPLAY_API_URL) {
    return process.env.REPLAY_API_URL;
  }

  // Secondary: Build URL from region if specified
  const region = process.env.REPLAY_API_REGION || 'local';
  const regionUrls: Record<string, string> = {
    local: 'http://localhost:8080',
    'na-east': 'https://api-na-east.leetgaming.pro',
    'na-west': 'https://api-na-west.leetgaming.pro',
    'eu-west': 'https://api-eu-west.leetgaming.pro',
    'eu-east': 'https://api-eu-east.leetgaming.pro',
    'sa': 'https://api-sa.leetgaming.pro',
    'asia': 'https://api-asia.leetgaming.pro',
    'oce': 'https://api-oce.leetgaming.pro',
  };

  return regionUrls[region] || regionUrls.local;
}

/**
 * Replay API Settings
 * Note: Named "Mock" for historical reasons but connects to real backend
 */
export const ReplayApiSettingsMock: ReplayApiSettings = {
  baseUrl: getReplayApiBaseUrl(),
  resources: Resources,
};

/**
 * Get region-specific API URL for matchmaking
 * Used when user selects a specific region for their match
 */
export function getRegionApiUrl(region: string): string {
  const regionUrls: Record<string, string> = {
    'na-east': process.env.REPLAY_API_URL_NA_EAST || 'https://api-na-east.leetgaming.pro',
    'na-west': process.env.REPLAY_API_URL_NA_WEST || 'https://api-na-west.leetgaming.pro',
    'eu-west': process.env.REPLAY_API_URL_EU_WEST || 'https://api-eu-west.leetgaming.pro',
    'eu-east': process.env.REPLAY_API_URL_EU_EAST || 'https://api-eu-east.leetgaming.pro',
    'sa': process.env.REPLAY_API_URL_SA || 'https://api-sa.leetgaming.pro',
    'asia': process.env.REPLAY_API_URL_ASIA || 'https://api-asia.leetgaming.pro',
    'oce': process.env.REPLAY_API_URL_OCE || 'https://api-oce.leetgaming.pro',
  };

  return regionUrls[region] || ReplayApiSettingsMock.baseUrl;
}


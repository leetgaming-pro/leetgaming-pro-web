/**
 * Replay API SDK - Main Entry Point
 * Complete TypeScript SDK for leetgaming-pro replay-api
 *
 * Usage:
 * ```typescript
 * import { ReplayAPISDK, ReplayApiSettingsMock } from '@/types/replay-api';
 * import { logger } from '@/lib/logger';
 *
 * const sdk = new ReplayAPISDK({ ...ReplayApiSettingsMock, baseUrl: '/api' }, logger);
 * const profile = await sdk.playerProfiles.getMyProfile();
 * ```
 */

// Core types and enums
export * from "./settings";
export * from "./replay-file";
export * from "./entities.types";
export * from "./searchable";

// Authentication
export * from "./auth";

// Search and filtering
export * from "./search-builder";
export * from "./search-schema.sdk";

// API clients
export * from "./replay-api.client";
export * from "./replay-api.route-builder";
export * from "./upload-client";

// High-level SDK (main entry point for all API operations)
export * from "./sdk";

// Domain types (prefer importing from here rather than deprecated .sdk files)
// Using explicit exports to avoid conflicts
export type { PlayerStats, PlayerStatus } from "./player.types";
export * from "./payment.types";
export type { Amount } from "./wallet.types";
export type { 
  MatchmakingLobby, 
  LobbyStatus, 
  LobbyVisibility, 
  LobbyType,
  PlayerSlot,
  QueueStats,
  PrizePoolConfig,
  CreateLobbyRequest,
  CreateLobbyResponse,
  JoinLobbyRequest,
  JoinLobbyResponse,
  GetLobbyResponse,
  ListLobbiesRequest,
  ListLobbiesResponse,
  LobbyStats
} from "./lobby.types";
export * from "./matchmaking.types";
export * from "./stats.types";
export * from "./challenge.types";
export type { GameEvent } from "./highlights.types";
export type { PrizePool, PrizePoolStatus } from "./prize-pool.types";
export type { PlayerStatus as TournamentPlayerStatus } from "./tournament.types";

// Blockchain types and SDK (multi-chain support)
export * from "./blockchain.types";
export type { PrizePoolAPI as BlockchainPrizePoolAPI } from "./blockchain.sdk";

// Common game-agnostic types (multi-game support)
export type { 
  Position3D as CommonPosition3D, 
  TrajectoryPoint as CommonTrajectoryPoint,
  PlayerTrajectory as CommonPlayerTrajectory,
  HeatmapCell as CommonHeatmapCell
} from "./common/game-types";

// Game-specific types
export * from "./games/cs2-types";
export * from "./games/valorant-types";

// Feature SDKs (all use ReplayApiClient base component)
export * from "./challenge.sdk";
export * from "./payment.sdk";
export * from "./wallet.sdk";
export { LobbyAPI } from "./lobby.sdk";
export type { SearchLobbiesRequest } from "./lobby.sdk";
export * from "./matchmaking.sdk";
export type { PrizePoolAPI } from "./prize-pool.sdk";
export * from "./tournament.sdk";
export * from "./match-analytics.sdk";
export * from "./settings.sdk";
export * from "./highlights.sdk";

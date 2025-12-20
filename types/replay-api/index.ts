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
export * from './settings';
export * from './replay-file';
export * from './entities.types';
export * from './searchable';

// Authentication
export * from './auth';

// Search and filtering
export * from './search-builder';

// API clients
export * from './replay-api.client';
export * from './replay-api.route-builder';
export * from './upload-client';

// High-level SDK (main entry point for all API operations)
export * from './sdk';

// Domain types (prefer importing from here rather than deprecated .sdk files)
export * from './player.types';
export * from './payment.types';
export * from './wallet.types';
export * from './lobby.types';
export * from './matchmaking.types';
export * from './stats.types';
export * from './challenge.types';
export * from './highlights.types';
export * from './prize-pool.types';
export * from './tournament.types';

// Feature SDKs (all use ReplayApiClient base component)
export * from './challenge.sdk';
export * from './payment.sdk';
export * from './wallet.sdk';
export * from './lobby.sdk';
export * from './matchmaking.sdk';
export * from './prize-pool.sdk';
export * from './tournament.sdk';
export * from './match-analytics.sdk';
export * from './settings.sdk';
export * from './highlights.sdk';

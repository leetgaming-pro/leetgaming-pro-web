/**
 * Usage examples for Replay API SDK
 * This file demonstrates common SDK patterns and can be used as a reference
 */

import { ReplayAPISDK } from './sdk';
import { ReplayApiSettingsMock, GameIDKey } from './settings';
import { logger } from '@/lib/logger';
import { ResourceOwner } from './replay-file';
import { SearchBuilder, SortDirection } from './search-builder';
import { UploadClient } from './upload-client';
import { getRIDTokenManager } from './auth';

// ============================================================================
// Example 1: Initialize SDK
// ============================================================================

export function initializeSDK() {
  const sdk = new ReplayAPISDK(ReplayApiSettingsMock, logger);
  return sdk;
}

// ============================================================================
// Example 2: Authentication Flow
// ============================================================================

export async function handleSteamLogin(steamProfile: any, verificationHash: string) {
  const sdk = initializeSDK();
  
  // Onboard user
  const response = await sdk.onboarding.onboardSteam(steamProfile, verificationHash);
  
  if (response) {
    // Store RID token
    getRIDTokenManager().setFromOnboarding(response);
    
    console.log('User authenticated:', response.user_id);
    return response;
  }
  
  return null;
}

// ============================================================================
// Example 3: Upload Replay with Progress Tracking
// ============================================================================

export async function uploadReplayWithProgress(
  file: File,
  onProgressUpdate: (percentage: number, phase: string) => void
) {
  const uploadClient = new UploadClient(ReplayApiSettingsMock, logger);
  
  const result = await uploadClient.uploadReplay(file, {
    gameId: GameIDKey.CounterStrike2,
    networkId: 'valve',
    metadata: {
      description: 'Competitive match',
      tags: ['competitive', 'ranked']
    },
    onProgress: (progress) => {
      onProgressUpdate(progress.percentage, progress.phase);
      
      if (progress.phase === 'completed') {
        console.log('Replay ready:', progress.replayFileId);
      }
    },
    pollInterval: 2000,
    maxPollAttempts: 60
  });
  
  return result;
}

// ============================================================================
// Example 4: Search Public Replays
// ============================================================================

export async function searchPublicReplays(gameId: string, mapName?: string) {
  const sdk = initializeSDK();
  
  const searchBuilder = new SearchBuilder()
    .withGameIds(gameId)
    .withResourceVisibilities('public')
    .sortDesc('created_at')
    .paginate(1, 20);
  
  if (mapName) {
    searchBuilder.withMaps(mapName);
  }
  
  const search = searchBuilder.build();
  const response = await sdk.client.search(search);
  
  return response.data || [];
}

// ============================================================================
// Example 5: Create and Manage Squad
// ============================================================================

export async function createCompetitiveSquad(name: string, symbol: string) {
  const sdk = initializeSDK();
  
  // Create squad
  const squad = await sdk.squads.createSquad({
    game_id: 'cs2',
    name,
    symbol,
    description: 'Competitive CS2 team',
    visibility_type: 'public'
  });
  
  if (!squad) {
    throw new Error('Failed to create squad');
  }
  
  // Create player profiles for squad members
  const playerProfile = await sdk.playerProfiles.createPlayerProfile({
    game_id: 'cs2',
    nickname: 'Captain',
    roles: ['igl', 'awper'],
    description: 'Team captain and AWP player'
  });
  
  return { squad, playerProfile };
}

// ============================================================================
// Example 6: Search User's Replays with Filters
// ============================================================================

export async function searchUserReplays(userId: string, filters: {
  dateFrom?: string;
  dateTo?: string;
  status?: string;
}) {
  const sdk = initializeSDK();
  const resourceOwner = ResourceOwner.fromUser(userId);
  
  const searchBuilder = new SearchBuilder()
    .withResourceOwners(userId)
    .withRequestSource(resourceOwner)
    .sortDesc('created_at')
    .limit(50);
  
  if (filters.dateFrom && filters.dateTo) {
    searchBuilder.withDateRanges([{
      start: filters.dateFrom,
      end: filters.dateTo
    }]);
  }
  
  if (filters.status) {
    searchBuilder.withResourceStatus(filters.status as any);
  }
  
  const search = searchBuilder.build();
  const response = await sdk.replayFiles.searchReplayFiles(search.filters);
  
  return response;
}

// ============================================================================
// Example 7: Share Replay with Token
// ============================================================================

export async function shareReplay(gameId: string, replayFileId: string, expiresInDays: number = 7) {
  const sdk = initializeSDK();
  
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);
  
  const tokenResponse = await sdk.shareTokens.createShareToken(gameId, replayFileId, {
    expires_at: expiresAt.toISOString(),
    visibility_type: 'public'
  });
  
  if (tokenResponse) {
    const shareUrl = `${window.location.origin}/replay/${replayFileId}?token=${tokenResponse.token}`;
    return shareUrl;
  }
  
  return null;
}

// ============================================================================
// Example 8: Batch Upload Multiple Replays
// ============================================================================

export async function batchUploadReplays(
  files: File[],
  onBatchProgress: (current: number, total: number) => void
) {
  const uploadClient = new UploadClient(ReplayApiSettingsMock, logger);
  
  const results = await uploadClient.uploadBatch(
    files,
    {
      gameId: GameIDKey.CounterStrike2,
      networkId: 'valve'
    },
    (completed, total, results) => {
      onBatchProgress(completed, total);
      
      const successCount = results.filter(r => r.success).length;
      console.log(`Uploaded: ${successCount}/${completed} successful`);
    }
  );
  
  return results;
}

// ============================================================================
// Example 9: Complex Match Search with Multiple Filters
// ============================================================================

export async function advancedMatchSearch(params: {
  gameId: string;
  maps?: string[];
  playerIds?: string[];
  teamIds?: string[];
  dateFrom?: string;
  dateTo?: string;
  gameMode?: string;
}) {
  const sdk = initializeSDK();
  
  const searchBuilder = new SearchBuilder()
    .withGameIds(params.gameId)
    .sortDesc('created_at');
  
  if (params.maps && params.maps.length > 0) {
    searchBuilder.withMaps(params.maps);
  }
  
  if (params.playerIds && params.playerIds.length > 0) {
    searchBuilder.withPlayerIds(params.playerIds);
  }
  
  if (params.teamIds && params.teamIds.length > 0) {
    searchBuilder.withTeamIds(params.teamIds);
  }
  
  if (params.dateFrom && params.dateTo) {
    searchBuilder.withDateRanges([{
      start: params.dateFrom,
      end: params.dateTo
    }]);
  }
  
  if (params.gameMode) {
    searchBuilder.withGameModes(params.gameMode as any);
  }
  
  const search = searchBuilder.build();
  const response = await sdk.matches.searchMatches(params.gameId, search.filters);
  
  return response;
}

// ============================================================================
// Example 10: Update Squad Information
// ============================================================================

export async function updateSquadInfo(squadId: string, updates: {
  name?: string;
  description?: string;
  logo_uri?: string;
}) {
  const sdk = initializeSDK();
  
  const updatedSquad = await sdk.squads.updateSquad(squadId, updates);
  
  if (updatedSquad) {
    console.log('Squad updated successfully:', updatedSquad);
    return updatedSquad;
  }
  
  throw new Error('Failed to update squad');
}

// ============================================================================
// Example 11: Check Authentication Status
// ============================================================================

export function checkAuthStatus() {
  const tokenManager = getRIDTokenManager();
  
  if (!tokenManager.isAuthenticated()) {
    return {
      authenticated: false,
      message: 'Please sign in to continue'
    };
  }
  
  const metadata = tokenManager.getMetadata();
  const resourceOwner = tokenManager.getResourceOwner();
  
  return {
    authenticated: true,
    userId: resourceOwner?.userId,
    groupId: resourceOwner?.groupId,
    expiresAt: metadata?.expiresAt,
    ownershipLevel: resourceOwner?.getLevel()
  };
}

// ============================================================================
// Example 12: Error Handling Pattern
// ============================================================================

export async function safeAPICall<T>(
  apiCall: () => Promise<T>,
  fallbackValue: T,
  errorHandler?: (error: any) => void
): Promise<T> {
  try {
    return await apiCall();
  } catch (error) {
    console.error('API call failed:', error);
    
    if (errorHandler) {
      errorHandler(error);
    }
    
    return fallbackValue;
  }
}

// Usage:
// const squads = await safeAPICall(
//   () => sdk.squads.searchSquads({ game_id: 'cs2' }),
//   [],
//   (error) => console.error('Failed to load squads:', error)
// );

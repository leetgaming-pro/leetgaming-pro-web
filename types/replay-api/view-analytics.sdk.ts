/**
 * View Analytics SDK
 * API wrapper for view tracking, statistics, and "who viewed" insights.
 * Follows Clean Architecture + CQRS pattern from backend.
 */

import { ReplayApiClient } from './replay-api.client';
import type {
  EntityType,
  RecordViewRequest,
  ViewStatistics,
  ViewInsightsResponse,
  MyAnalytics,
  ViewPrivacySettings,
  ViewStatsParams,
  ViewInsightsParams,
} from './view-analytics.types';

/**
 * Build the base path for a given entity type and ID.
 */
function buildEntityPath(entityType: EntityType, entityId: string, gameId?: string): string {
  switch (entityType) {
    case 'player':
      return `/players/${entityId}`;
    case 'team':
      return `/teams/${entityId}`;
    case 'match':
      return `/games/${gameId || 'cs2'}/matches/${entityId}`;
    case 'replay':
      return `/games/${gameId || 'cs2'}/replays/${entityId}`;
    default:
      return `/players/${entityId}`;
  }
}

export class ViewAnalyticsAPI {
  constructor(private client: ReplayApiClient) {}

  /**
   * Record a view on an entity (fire-and-forget, returns immediately)
   */
  async recordView(
    entityType: EntityType,
    entityId: string,
    request?: RecordViewRequest,
    gameId?: string,
  ): Promise<void> {
    const basePath = buildEntityPath(entityType, entityId, gameId);
    try {
      await this.client.post(`${basePath}/views`, request || {});
    } catch {
      // Fire-and-forget: silently ignore errors
    }
  }

  /**
   * Get view statistics for an entity
   */
  async getViewStatistics(
    entityType: EntityType,
    entityId: string,
    params?: ViewStatsParams,
    gameId?: string,
  ): Promise<ViewStatistics | null> {
    const basePath = buildEntityPath(entityType, entityId, gameId);
    const queryParams = new URLSearchParams();
    if (params?.period) queryParams.set('period', params.period);
    const qs = queryParams.toString();
    const url = `${basePath}/views/stats${qs ? `?${qs}` : ''}`;

    const response = await this.client.get<ViewStatistics>(url);
    return response.data || null;
  }

  /**
   * Get "who viewed" insights for an entity (requires auth + ownership)
   */
  async getViewInsights(
    entityType: EntityType,
    entityId: string,
    params?: ViewInsightsParams,
    gameId?: string,
  ): Promise<ViewInsightsResponse | null> {
    const basePath = buildEntityPath(entityType, entityId, gameId);
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.set('limit', String(params.limit));
    if (params?.offset) queryParams.set('offset', String(params.offset));
    if (params?.sort) queryParams.set('sort', params.sort);
    const qs = queryParams.toString();
    const url = `${basePath}/views/insights${qs ? `?${qs}` : ''}`;

    const response = await this.client.get<ViewInsightsResponse>(url);
    return response.data || null;
  }

  /**
   * Get aggregated analytics for the current user's entities
   */
  async getMyAnalytics(): Promise<MyAnalytics | null> {
    const response = await this.client.get<MyAnalytics>('/me/analytics/views');
    return response.data || null;
  }

  /**
   * Get current view privacy settings
   */
  async getViewPrivacy(): Promise<ViewPrivacySettings | null> {
    const response = await this.client.get<ViewPrivacySettings>('/me/settings/view-privacy');
    return response.data || null;
  }

  /**
   * Update view privacy settings
   */
  async updateViewPrivacy(settings: Partial<ViewPrivacySettings>): Promise<ViewPrivacySettings | null> {
    const response = await this.client.put<ViewPrivacySettings>('/me/settings/view-privacy', settings);
    return response.data || null;
  }
}

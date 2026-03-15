/**
 * View Analytics Types
 * TypeScript interfaces for view tracking, statistics, and "who viewed your profile" insights.
 */

/** Entity types that support view tracking */
export type EntityType = 'player' | 'team' | 'match' | 'replay';

/** View trend direction */
export type TrendDirection = 'up' | 'down' | 'stable';

/** Device type enum */
export type DeviceType = 'desktop' | 'mobile' | 'tablet' | 'unknown';

/** Referrer type enum */
export type ReferrerType = 'direct' | 'search' | 'social' | 'external' | 'internal' | 'unknown';

/** Single view event (for recording) */
export interface RecordViewRequest {
  referrer_type?: ReferrerType;
  device_type?: DeviceType;
  session_id?: string;
}

/** Pre-aggregated view statistics for an entity */
export interface ViewStatistics {
  id: string;
  entity_id: string;
  entity_type: EntityType;
  total_views: number;
  unique_viewers: number;
  views_by_day: Record<string, number>;
  views_by_region: Record<string, number>;
  views_by_device: Record<string, number>;
  views_by_referrer: Record<string, number>;
  trend_direction: TrendDirection;
  trend_percentage: number;
  period_start: string;
  period_end: string;
  last_updated: string;
}

/** A single viewer insight entry ("who viewed your profile" item) */
export interface ViewerInsight {
  id: string;
  entity_id: string;
  entity_type: EntityType;
  viewer_id: string;
  viewer_nickname: string;
  viewer_avatar: string;
  view_count: number;
  first_viewed_at: string;
  last_viewed_at: string;
  is_anonymous: boolean;
}

/** View insights response (paginated) */
export interface ViewInsightsResponse {
  items: ViewerInsight[];
  total: number;
  limit: number;
  offset: number;
}

/** User's aggregated analytics across all owned entities */
export interface MyAnalytics {
  total_views: number;
  unique_viewers: number;
  trend_direction: TrendDirection;
  trend_percentage: number;
  entities: ViewStatistics[];
}

/** View privacy settings for a user */
export interface ViewPrivacySettings {
  show_profile_views: boolean;
  allow_viewer_identification: boolean;
  anonymous_mode: boolean;
}

/** Query parameters for view statistics */
export interface ViewStatsParams {
  period?: '7d' | '30d' | '90d' | 'all';
}

/** Query parameters for view insights */
export interface ViewInsightsParams {
  limit?: number;
  offset?: number;
  sort?: 'recent' | 'frequent';
}

/**
 * View Analytics Demo Data
 * Provides fallback demo data when the API is unavailable.
 */

import type {
  ViewStatistics,
  ViewerInsight,
  ViewPrivacySettings,
} from "@/types/replay-api/view-analytics.types";

/**
 * Generate mock daily view data for the last N days
 */
function generateDailyViews(days: number, baseViews: number): Record<string, number> {
  const result: Record<string, number> = {};
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const key = date.toISOString().split("T")[0];
    // Slight randomness for realistic look
    result[key] = Math.max(0, Math.floor(baseViews + (Math.random() - 0.3) * baseViews));
  }
  return result;
}

export function getDemoViewStatistics(entityId: string): ViewStatistics {
  return {
    id: `demo-stats-${entityId}`,
    entity_id: entityId,
    entity_type: "player",
    total_views: 2847,
    unique_viewers: 1203,
    views_by_day: generateDailyViews(14, 45),
    views_by_region: {
      "North America": 892,
      Europe: 1104,
      "South America": 451,
      Asia: 302,
      Other: 98,
    },
    views_by_device: {
      desktop: 1654,
      mobile: 987,
      tablet: 206,
    },
    views_by_referrer: {
      direct: 943,
      search: 672,
      social: 534,
      internal: 498,
      external: 200,
    },
    trend_direction: "up",
    trend_percentage: 23,
    period_start: new Date(Date.now() - 30 * 86400000).toISOString(),
    period_end: new Date().toISOString(),
    last_updated: new Date().toISOString(),
  };
}

export function getDemoViewerInsights(): ViewerInsight[] {
  const now = Date.now();
  return [
    {
      id: "vi-demo-1",
      entity_id: "demo",
      entity_type: "player",
      viewer_id: "viewer-1",
      viewer_nickname: "ShadowStrike",
      viewer_avatar: "https://i.pravatar.cc/150?u=shadowstrike",
      view_count: 5,
      first_viewed_at: new Date(now - 7 * 86400000).toISOString(),
      last_viewed_at: new Date(now - 3600000).toISOString(),
      is_anonymous: false,
    },
    {
      id: "vi-demo-2",
      entity_id: "demo",
      entity_type: "player",
      viewer_id: "viewer-2",
      viewer_nickname: "NightHawk",
      viewer_avatar: "https://i.pravatar.cc/150?u=nighthawk",
      view_count: 3,
      first_viewed_at: new Date(now - 5 * 86400000).toISOString(),
      last_viewed_at: new Date(now - 7200000).toISOString(),
      is_anonymous: false,
    },
    {
      id: "vi-demo-3",
      entity_id: "demo",
      entity_type: "player",
      viewer_id: "viewer-3",
      viewer_nickname: "",
      viewer_avatar: "",
      view_count: 1,
      first_viewed_at: new Date(now - 2 * 86400000).toISOString(),
      last_viewed_at: new Date(now - 2 * 86400000).toISOString(),
      is_anonymous: true,
    },
    {
      id: "vi-demo-4",
      entity_id: "demo",
      entity_type: "player",
      viewer_id: "viewer-4",
      viewer_nickname: "CyberX",
      viewer_avatar: "https://i.pravatar.cc/150?u=cyberx",
      view_count: 8,
      first_viewed_at: new Date(now - 14 * 86400000).toISOString(),
      last_viewed_at: new Date(now - 86400000).toISOString(),
      is_anonymous: false,
    },
    {
      id: "vi-demo-5",
      entity_id: "demo",
      entity_type: "player",
      viewer_id: "viewer-5",
      viewer_nickname: "PhantomAce",
      viewer_avatar: "https://i.pravatar.cc/150?u=phantomace",
      view_count: 2,
      first_viewed_at: new Date(now - 3 * 86400000).toISOString(),
      last_viewed_at: new Date(now - 4 * 3600000).toISOString(),
      is_anonymous: false,
    },
  ];
}

export function getDemoViewPrivacy(): ViewPrivacySettings {
  return {
    show_profile_views: true,
    allow_viewer_identification: true,
    anonymous_mode: false,
  };
}

/**
 * View Analytics Hooks
 * React hooks for view tracking, statistics, and "who viewed" insights.
 */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useReplayApi } from "@/hooks/use-replay-api";
import type {
  EntityType,
  ViewStatistics,
  ViewerInsight,
  MyAnalytics,
  ViewPrivacySettings,
  ViewStatsParams,
  ViewInsightsParams,
} from "@/types/replay-api/view-analytics.types";

/**
 * Hook to track a view on an entity.
 * Fires once on mount (fire-and-forget). Debounces repeat calls.
 */
export function useViewTracking(
  entityType: EntityType,
  entityId: string | undefined,
  gameId?: string,
) {
  const { sdk } = useReplayApi();
  const hasFiredRef = useRef(false);

  useEffect(() => {
    if (!entityId || hasFiredRef.current) return;
    hasFiredRef.current = true;

    // Detect referrer type from browser
    const referrerType = detectReferrerType();
    const deviceType = detectDeviceType();

    sdk.viewAnalytics.recordView(entityType, entityId, {
      referrer_type: referrerType,
      device_type: deviceType,
      session_id: getSessionId(),
    }, gameId);
  }, [sdk, entityType, entityId, gameId]);
}

/**
 * Hook to fetch view statistics for an entity.
 */
export function useViewStatistics(
  entityType: EntityType,
  entityId: string | undefined,
  params?: ViewStatsParams,
  gameId?: string,
) {
  const { sdk } = useReplayApi();
  const [stats, setStats] = useState<ViewStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!entityId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await sdk.viewAnalytics.getViewStatistics(entityType, entityId, params, gameId);
      setStats(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load view statistics");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sdk, entityType, entityId, params?.period, gameId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
}

/**
 * Hook to fetch "who viewed" insights (owner-only).
 */
export function useViewInsights(
  entityType: EntityType,
  entityId: string | undefined,
  params?: ViewInsightsParams,
  gameId?: string,
) {
  const { sdk } = useReplayApi();
  const [insights, setInsights] = useState<ViewerInsight[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = useCallback(async () => {
    if (!entityId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await sdk.viewAnalytics.getViewInsights(entityType, entityId, params, gameId);
      if (result) {
        setInsights(result.items || []);
        setTotal(result.total || 0);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load view insights");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sdk, entityType, entityId, params?.limit, params?.offset, params?.sort, gameId]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  return { insights, total, loading, error, refetch: fetchInsights };
}

/**
 * Hook to fetch current user's aggregated analytics.
 */
export function useMyAnalytics() {
  const { sdk } = useReplayApi();
  const [analytics, setAnalytics] = useState<MyAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await sdk.viewAnalytics.getMyAnalytics();
      setAnalytics(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, [sdk]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return { analytics, loading, error, refetch: fetchAnalytics };
}

/**
 * Hook to manage view privacy settings.
 */
export function useViewPrivacy() {
  const { sdk } = useReplayApi();
  const [settings, setSettings] = useState<ViewPrivacySettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await sdk.viewAnalytics.getViewPrivacy();
      setSettings(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load privacy settings");
    } finally {
      setLoading(false);
    }
  }, [sdk]);

  const updateSettings = useCallback(async (update: Partial<ViewPrivacySettings>) => {
    setSaving(true);
    setError(null);
    try {
      const result = await sdk.viewAnalytics.updateViewPrivacy(update);
      if (result) setSettings(result);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update privacy settings");
      return null;
    } finally {
      setSaving(false);
    }
  }, [sdk]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return { settings, loading, saving, error, updateSettings, refetch: fetchSettings };
}

// ─── Utilities ─────────────────────────────────────────────

function detectReferrerType(): "direct" | "search" | "social" | "external" | "internal" | "unknown" {
  if (typeof window === "undefined") return "unknown";
  const ref = document.referrer;
  if (!ref) return "direct";
  try {
    const url = new URL(ref);
    if (url.hostname === window.location.hostname) return "internal";
    if (/google|bing|yahoo|duckduckgo|baidu/.test(url.hostname)) return "search";
    if (/twitter|facebook|instagram|linkedin|reddit|discord|tiktok/.test(url.hostname)) return "social";
    return "external";
  } catch {
    return "unknown";
  }
}

function detectDeviceType(): "desktop" | "mobile" | "tablet" | "unknown" {
  if (typeof window === "undefined") return "unknown";
  const ua = navigator.userAgent.toLowerCase();
  if (/tablet|ipad/.test(ua)) return "tablet";
  if (/mobile|android|iphone/.test(ua)) return "mobile";
  return "desktop";
}

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let sid = sessionStorage.getItem("__view_session_id");
  if (!sid) {
    sid = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem("__view_session_id", sid);
  }
  return sid;
}

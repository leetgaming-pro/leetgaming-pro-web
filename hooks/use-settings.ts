/**
 * User Settings Hook
 * Centralized settings management with local storage persistence
 * Per PRD D.3.1 - Settings & Preferences
 */

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Locale } from "@/lib/i18n";

// ============================================================================
// Types
// ============================================================================

export type ThemeMode = "light" | "dark" | "system";

export interface NotificationSettings {
  // Email notifications
  emailMatches: boolean;
  emailTeams: boolean;
  emailFriends: boolean;
  emailMarketing: boolean;
  emailTournaments: boolean;
  emailCoaching: boolean;
  // Push notifications
  pushMatches: boolean;
  pushFriends: boolean;
  pushMessages: boolean;
  pushTournaments: boolean;
  // In-app notifications
  inAppSounds: boolean;
  inAppVibration: boolean;
}

export interface PrivacySettings {
  profileVisibility: "public" | "friends" | "private";
  showOnlineStatus: boolean;
  showMatchHistory: boolean;
  showStatistics: boolean;
  allowFriendRequests: boolean;
  allowTeamInvites: boolean;
  showRealName: boolean;
  shareDataWithPartners: boolean;
}

export interface GameplaySettings {
  defaultRegion: string;
  preferredGameMode: "ranked" | "casual" | "custom";
  autoQueue: boolean;
  autoAccept: boolean;
  showTutorials: boolean;
  enableOverlay: boolean;
}

export interface AccessibilitySettings {
  reduceMotion: boolean;
  highContrast: boolean;
  fontSize: "small" | "medium" | "large";
  screenReaderOptimized: boolean;
  colorBlindMode: "none" | "protanopia" | "deuteranopia" | "tritanopia";
}

export interface UserSettings {
  // Appearance
  theme: ThemeMode;
  locale: Locale;
  timezone: string;
  dateFormat: "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD";
  timeFormat: "12h" | "24h";
  // Notifications
  notifications: NotificationSettings;
  // Privacy
  privacy: PrivacySettings;
  // Gameplay
  gameplay: GameplaySettings;
  // Accessibility
  accessibility: AccessibilitySettings;
}

// ============================================================================
// Defaults
// ============================================================================

const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  emailMatches: true,
  emailTeams: true,
  emailFriends: true,
  emailMarketing: false,
  emailTournaments: true,
  emailCoaching: true,
  pushMatches: true,
  pushFriends: true,
  pushMessages: true,
  pushTournaments: true,
  inAppSounds: true,
  inAppVibration: true,
};

const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  profileVisibility: "public",
  showOnlineStatus: true,
  showMatchHistory: true,
  showStatistics: true,
  allowFriendRequests: true,
  allowTeamInvites: true,
  showRealName: false,
  shareDataWithPartners: false,
};

const DEFAULT_GAMEPLAY_SETTINGS: GameplaySettings = {
  defaultRegion: "auto",
  preferredGameMode: "ranked",
  autoQueue: false,
  autoAccept: false,
  showTutorials: true,
  enableOverlay: true,
};

const DEFAULT_ACCESSIBILITY_SETTINGS: AccessibilitySettings = {
  reduceMotion: false,
  highContrast: false,
  fontSize: "medium",
  screenReaderOptimized: false,
  colorBlindMode: "none",
};

const DEFAULT_SETTINGS: UserSettings = {
  theme: "system",
  locale: "en-US",
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
  dateFormat: "MM/DD/YYYY",
  timeFormat: "12h",
  notifications: DEFAULT_NOTIFICATION_SETTINGS,
  privacy: DEFAULT_PRIVACY_SETTINGS,
  gameplay: DEFAULT_GAMEPLAY_SETTINGS,
  accessibility: DEFAULT_ACCESSIBILITY_SETTINGS,
};

const SETTINGS_STORAGE_KEY = "leetgaming_user_settings";

// ============================================================================
// Hook
// ============================================================================

export interface UseSettingsReturn {
  settings: UserSettings;
  isLoading: boolean;
  isDirty: boolean;
  error: string | null;

  // Update functions
  updateTheme: (theme: ThemeMode) => void;
  updateLocale: (locale: Locale) => void;
  updateTimezone: (timezone: string) => void;
  updateDateFormat: (format: UserSettings["dateFormat"]) => void;
  updateTimeFormat: (format: UserSettings["timeFormat"]) => void;
  updateNotifications: (notifications: Partial<NotificationSettings>) => void;
  updatePrivacy: (privacy: Partial<PrivacySettings>) => void;
  updateGameplay: (gameplay: Partial<GameplaySettings>) => void;
  updateAccessibility: (accessibility: Partial<AccessibilitySettings>) => void;

  // Batch operations
  updateSettings: (settings: Partial<UserSettings>) => void;
  resetSettings: () => void;
  resetSection: (section: keyof UserSettings) => void;

  // Persistence
  saveSettings: () => Promise<void>;
  loadSettings: () => Promise<void>;
  exportSettings: () => string;
  importSettings: (json: string) => boolean;
}

export function useSettings(): UseSettingsReturn {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [originalSettings, setOriginalSettings] =
    useState<UserSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if settings have been modified
  const isDirty = useMemo(() => {
    return JSON.stringify(settings) !== JSON.stringify(originalSettings);
  }, [settings, originalSettings]);

  // Load settings on mount
  useEffect(() => {
    const loadInitialSettings = () => {
      try {
        setIsLoading(true);
        const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          const merged = deepMerge(DEFAULT_SETTINGS, parsed);
          setSettings(merged);
          setOriginalSettings(merged);
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
        setError("Failed to load settings");
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialSettings();
  }, []);

  // Apply theme to document
  useEffect(() => {
    applyTheme(settings.theme);
  }, [settings.theme]);

  // Apply accessibility settings
  useEffect(() => {
    applyAccessibilitySettings(settings.accessibility);
  }, [settings.accessibility]);

  const loadFromStorage = useCallback(() => {
    try {
      setIsLoading(true);
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const merged = deepMerge(DEFAULT_SETTINGS, parsed);
        setSettings(merged);
        setOriginalSettings(merged);
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
      setError("Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveToStorage = useCallback(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
      setOriginalSettings(settings);
      setError(null);
    } catch (err) {
      console.error("Failed to save settings:", err);
      setError("Failed to save settings");
    }
  }, [settings]);

  // Individual update functions
  const updateTheme = useCallback((theme: ThemeMode) => {
    setSettings((prev) => ({ ...prev, theme }));
  }, []);

  const updateLocale = useCallback((locale: Locale) => {
    setSettings((prev) => ({ ...prev, locale }));
  }, []);

  const updateTimezone = useCallback((timezone: string) => {
    setSettings((prev) => ({ ...prev, timezone }));
  }, []);

  const updateDateFormat = useCallback(
    (dateFormat: UserSettings["dateFormat"]) => {
      setSettings((prev) => ({ ...prev, dateFormat }));
    },
    []
  );

  const updateTimeFormat = useCallback(
    (timeFormat: UserSettings["timeFormat"]) => {
      setSettings((prev) => ({ ...prev, timeFormat }));
    },
    []
  );

  const updateNotifications = useCallback(
    (notifications: Partial<NotificationSettings>) => {
      setSettings((prev) => ({
        ...prev,
        notifications: { ...prev.notifications, ...notifications },
      }));
    },
    []
  );

  const updatePrivacy = useCallback((privacy: Partial<PrivacySettings>) => {
    setSettings((prev) => ({
      ...prev,
      privacy: { ...prev.privacy, ...privacy },
    }));
  }, []);

  const updateGameplay = useCallback((gameplay: Partial<GameplaySettings>) => {
    setSettings((prev) => ({
      ...prev,
      gameplay: { ...prev.gameplay, ...gameplay },
    }));
  }, []);

  const updateAccessibility = useCallback(
    (accessibility: Partial<AccessibilitySettings>) => {
      setSettings((prev) => ({
        ...prev,
        accessibility: { ...prev.accessibility, ...accessibility },
      }));
    },
    []
  );

  // Batch update
  const updateSettings = useCallback((newSettings: Partial<UserSettings>) => {
    setSettings((prev) => deepMerge(prev, newSettings));
  }, []);

  // Reset functions
  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  const resetSection = useCallback((section: keyof UserSettings) => {
    setSettings((prev) => ({
      ...prev,
      [section]: DEFAULT_SETTINGS[section],
    }));
  }, []);

  // Persistence operations
  const saveSettings = useCallback(async () => {
    saveToStorage();
    // TODO: Sync with backend API
    // await api.updateUserSettings(settings);
  }, [saveToStorage]);

  const loadSettings = useCallback(async () => {
    loadFromStorage();
    // TODO: Fetch from backend API
    // const remoteSettings = await api.getUserSettings();
    // setSettings(deepMerge(DEFAULT_SETTINGS, remoteSettings));
  }, [loadFromStorage]);

  // Export/Import
  const exportSettings = useCallback(() => {
    return JSON.stringify(settings, null, 2);
  }, [settings]);

  const importSettings = useCallback((json: string): boolean => {
    try {
      const parsed = JSON.parse(json);
      const merged = deepMerge(DEFAULT_SETTINGS, parsed);
      setSettings(merged);
      return true;
    } catch {
      setError("Invalid settings format");
      return false;
    }
  }, []);

  return {
    settings,
    isLoading,
    isDirty,
    error,
    updateTheme,
    updateLocale,
    updateTimezone,
    updateDateFormat,
    updateTimeFormat,
    updateNotifications,
    updatePrivacy,
    updateGameplay,
    updateAccessibility,
    updateSettings,
    resetSettings,
    resetSection,
    saveSettings,
    loadSettings,
    exportSettings,
    importSettings,
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

function deepMerge<T extends object>(target: T, source: Partial<T>): T {
  const result = { ...target };

  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceValue = source[key];
      const targetValue = result[key];

      if (
        sourceValue !== null &&
        typeof sourceValue === "object" &&
        !Array.isArray(sourceValue) &&
        targetValue !== null &&
        typeof targetValue === "object" &&
        !Array.isArray(targetValue)
      ) {
        (result as Record<string, unknown>)[key] = deepMerge(
          targetValue as object,
          sourceValue as object
        );
      } else if (sourceValue !== undefined) {
        (result as Record<string, unknown>)[key] = sourceValue;
      }
    }
  }

  return result;
}

function applyTheme(theme: ThemeMode) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;

  if (theme === "system") {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    root.classList.toggle("dark", prefersDark);
  } else {
    root.classList.toggle("dark", theme === "dark");
  }
}

function applyAccessibilitySettings(settings: AccessibilitySettings) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;

  // Reduce motion
  root.style.setProperty(
    "--motion-reduce",
    settings.reduceMotion ? "reduce" : "no-preference"
  );

  // High contrast
  root.classList.toggle("high-contrast", settings.highContrast);

  // Font size
  const fontSizeMap = { small: "14px", medium: "16px", large: "18px" };
  root.style.setProperty("--base-font-size", fontSizeMap[settings.fontSize]);

  // Color blind mode
  root.dataset.colorBlindMode = settings.colorBlindMode;
}

// ============================================================================
// Exports
// ============================================================================

export {
  DEFAULT_SETTINGS,
  DEFAULT_NOTIFICATION_SETTINGS,
  DEFAULT_PRIVACY_SETTINGS,
  DEFAULT_GAMEPLAY_SETTINGS,
  DEFAULT_ACCESSIBILITY_SETTINGS,
};

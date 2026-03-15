'use client';

/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  🔔 LEETGAMING — NOTIFICATION PREFERENCES SYNC HOOK                         ║
 * ║══════════════════════════════════════════════════════════════════════════════║
 * ║                                                                              ║
 * ║  Manages notification preferences with local persistence (localStorage)      ║
 * ║  and optional server sync when the API endpoint is available.                ║
 * ║                                                                              ║
 * ║  Stores:                                                                     ║
 * ║   - Sound preferences (from useSound)                                        ║
 * ║   - Channel preferences per notification type                                ║
 * ║   - Do Not Disturb configuration                                             ║
 * ║                                                                              ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  SoundPreferences,
  loadSoundPrefs,
  saveSoundPrefs,
} from '@/hooks/use-sound';

// ── Types ───────────────────────────────────────────────────────────────────

export interface ChannelPreferences {
  in_app: boolean;
  email: boolean;
  push: boolean;
  sms: boolean;
}

export interface NotificationTypePreference {
  type: string;
  label: string;
  icon: string;
  enabled: boolean;
  channels: ChannelPreferences;
}

export interface DoNotDisturbConfig {
  enabled: boolean;
  startHour: number;
  endHour: number;
}

export interface NotificationPreferences {
  sound: SoundPreferences;
  types: NotificationTypePreference[];
  dnd: DoNotDisturbConfig;
  updatedAt: string;
}

// ── Constants ───────────────────────────────────────────────────────────────

const STORAGE_KEY = 'leet:notification-prefs';

const DEFAULT_TYPE_PREFS: NotificationTypePreference[] = [
  {
    type: 'match',
    label: 'Match Found',
    icon: 'solar:gameboy-bold',
    enabled: true,
    channels: { in_app: true, email: false, push: true, sms: false },
  },
  {
    type: 'ready_check',
    label: 'Ready Check',
    icon: 'solar:shield-check-bold',
    enabled: true,
    channels: { in_app: true, email: false, push: true, sms: false },
  },
  {
    type: 'team',
    label: 'Team Updates',
    icon: 'solar:users-group-rounded-bold',
    enabled: true,
    channels: { in_app: true, email: true, push: true, sms: false },
  },
  {
    type: 'friend',
    label: 'Friend Requests',
    icon: 'solar:user-plus-bold',
    enabled: true,
    channels: { in_app: true, email: true, push: false, sms: false },
  },
  {
    type: 'achievement',
    label: 'Achievements',
    icon: 'solar:cup-star-bold',
    enabled: true,
    channels: { in_app: true, email: false, push: false, sms: false },
  },
  {
    type: 'system',
    label: 'System Alerts',
    icon: 'solar:bell-bold',
    enabled: true,
    channels: { in_app: true, email: true, push: false, sms: false },
  },
];

const DEFAULT_DND: DoNotDisturbConfig = {
  enabled: false,
  startHour: 22,
  endHour: 8,
};

// ── Local Storage Helpers ───────────────────────────────────────────────────

function loadLocalPrefs(): NotificationPreferences {
  if (typeof window === 'undefined') {
    return {
      sound: { enabled: true, masterVolume: 0.7, hapticEnabled: true },
      types: DEFAULT_TYPE_PREFS,
      dnd: DEFAULT_DND,
      updatedAt: new Date().toISOString(),
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        sound: loadSoundPrefs(),
        types: DEFAULT_TYPE_PREFS,
        dnd: DEFAULT_DND,
        updatedAt: new Date().toISOString(),
      };
    }
    const parsed = JSON.parse(raw);
    return {
      sound: loadSoundPrefs(),
      types: parsed.types ?? DEFAULT_TYPE_PREFS,
      dnd: parsed.dnd ?? DEFAULT_DND,
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
    };
  } catch {
    return {
      sound: loadSoundPrefs(),
      types: DEFAULT_TYPE_PREFS,
      dnd: DEFAULT_DND,
      updatedAt: new Date().toISOString(),
    };
  }
}

function saveLocalPrefs(prefs: NotificationPreferences): void {
  if (typeof window === 'undefined') return;
  try {
    // Sound prefs are persisted separately via the useSound system
    saveSoundPrefs(prefs.sound);
    // Types and DND go here
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        types: prefs.types,
        dnd: prefs.dnd,
        updatedAt: prefs.updatedAt,
      }),
    );
  } catch {
    // localStorage unavailable
  }
}

// ── DND Active Check ────────────────────────────────────────────────────────

export function isDndActive(config: DoNotDisturbConfig): boolean {
  if (!config.enabled) return false;

  const now = new Date().getHours();
  if (config.startHour <= config.endHour) {
    // Same-day range (e.g., 09:00–17:00)
    return now >= config.startHour && now < config.endHour;
  }
  // Overnight range (e.g., 22:00–08:00)
  return now >= config.startHour || now < config.endHour;
}

// ── Hook ────────────────────────────────────────────────────────────────────

export interface UseNotificationPrefsReturn {
  /** Current preferences */
  prefs: NotificationPreferences;
  /** Whether data is loading */
  isLoading: boolean;
  /** Whether DND is currently active */
  isDndActive: boolean;
  /** Update sound preferences */
  updateSound: (sound: Partial<SoundPreferences>) => void;
  /** Update type preferences */
  updateTypes: (types: NotificationTypePreference[]) => void;
  /** Update DND config */
  updateDnd: (dnd: DoNotDisturbConfig) => void;
  /** Save all preferences (local + server) */
  save: () => Promise<void>;
  /** Check if a notification type + channel is allowed right now */
  isAllowed: (type: string, channel?: string) => boolean;
}

/**
 * Hook for managing notification preferences with local persistence
 * and optional server sync.
 *
 * @param apiEndpoint Optional API endpoint for syncing preferences to the server.
 *   When provided, preferences will be synced on save.
 */
export function useNotificationPrefs(
  apiEndpoint?: string,
): UseNotificationPrefsReturn {
  const [prefs, setPrefs] = useState<NotificationPreferences>(loadLocalPrefs);
  const [isLoading, setIsLoading] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const dndActive = isDndActive(prefs.dnd);

  const updateSound = useCallback((sound: Partial<SoundPreferences>) => {
    setPrefs((prev) => ({
      ...prev,
      sound: { ...prev.sound, ...sound },
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const updateTypes = useCallback((types: NotificationTypePreference[]) => {
    setPrefs((prev) => ({
      ...prev,
      types,
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const updateDnd = useCallback((dnd: DoNotDisturbConfig) => {
    setPrefs((prev) => ({
      ...prev,
      dnd,
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const save = useCallback(async () => {
    const updatedPrefs = { ...prefs, updatedAt: new Date().toISOString() };

    // Always persist locally
    saveLocalPrefs(updatedPrefs);

    // Optionally sync to server
    if (apiEndpoint) {
      setIsLoading(true);
      try {
        await fetch(apiEndpoint, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            types: updatedPrefs.types,
            dnd: updatedPrefs.dnd,
          }),
        });
      } catch {
        // Server sync failed — local persistence is the source of truth
        console.warn('[useNotificationPrefs] Server sync failed, using local preferences');
      } finally {
        if (mountedRef.current) {
          setIsLoading(false);
        }
      }
    }

    if (mountedRef.current) {
      setPrefs(updatedPrefs);
    }
  }, [prefs, apiEndpoint]);

  const isAllowed = useCallback(
    (type: string, channel?: string): boolean => {
      // DND blocks non-critical notifications
      if (dndActive) {
        const criticalTypes = ['match', 'ready_check'];
        if (!criticalTypes.includes(type)) return false;
      }

      const typePref = prefs.types.find((t) => t.type === type);
      if (!typePref || !typePref.enabled) return false;

      if (channel) {
        return typePref.channels[channel as keyof ChannelPreferences] ?? false;
      }

      return true;
    },
    [prefs.types, dndActive],
  );

  return {
    prefs,
    isLoading,
    isDndActive: dndActive,
    updateSound,
    updateTypes,
    updateDnd,
    save,
    isAllowed,
  };
}

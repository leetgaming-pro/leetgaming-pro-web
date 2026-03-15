'use client';

/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  🎮 LEETGAMING — ESPORTS SOUND SYSTEM                                       ║
 * ║══════════════════════════════════════════════════════════════════════════════║
 * ║                                                                              ║
 * ║  Centralized audio manager for competitive esports UX:                       ║
 * ║  • Named sound pools with preloading                                         ║
 * ║  • Per-sound volume control                                                  ║
 * ║  • User preference integration (mute, volume)                                ║
 * ║  • Haptic feedback on mobile via Vibration API                               ║
 * ║  • Graceful degradation when audio unavailable                               ║
 * ║                                                                              ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import { useCallback, useEffect, useRef } from 'react';

// ── Sound Registry ──────────────────────────────────────────────────────────
export type SoundName =
  | 'match-found'
  | 'ready-confirm'
  | 'ready-decline'
  | 'countdown-tick'
  | 'countdown-urgent'
  | 'all-ready'
  | 'notification-pop'
  | 'connection-ready'
  | 'achievement'
  | 'error';

interface SoundConfig {
  src: string;
  volume: number;
  /** Vibration pattern in ms — [vibrate, pause, vibrate, ...] */
  vibrationPattern?: number[];
}

const SOUND_REGISTRY: Record<SoundName, SoundConfig> = {
  'match-found': {
    src: '/sounds/match-found.mp3',
    volume: 0.6,
    vibrationPattern: [200, 100, 200],
  },
  'ready-confirm': {
    src: '/sounds/ready-confirm.mp3',
    volume: 0.4,
    vibrationPattern: [100],
  },
  'ready-decline': {
    src: '/sounds/ready-decline.mp3',
    volume: 0.4,
    vibrationPattern: [50, 50, 50],
  },
  'countdown-tick': {
    src: '/sounds/countdown-tick.mp3',
    volume: 0.2,
  },
  'countdown-urgent': {
    src: '/sounds/countdown-urgent.mp3',
    volume: 0.5,
    vibrationPattern: [80],
  },
  'all-ready': {
    src: '/sounds/all-ready.mp3',
    volume: 0.6,
    vibrationPattern: [100, 50, 100, 50, 200],
  },
  'notification-pop': {
    src: '/sounds/notification-pop.mp3',
    volume: 0.3,
  },
  'connection-ready': {
    src: '/sounds/connection-ready.mp3',
    volume: 0.5,
    vibrationPattern: [150, 50, 150],
  },
  achievement: {
    src: '/sounds/achievement.mp3',
    volume: 0.5,
    vibrationPattern: [100, 50, 100, 50, 300],
  },
  error: {
    src: '/sounds/error.mp3',
    volume: 0.3,
    vibrationPattern: [50, 30, 50],
  },
};

// ── Preferences ─────────────────────────────────────────────────────────────
const STORAGE_KEY = 'leet:sound-prefs';

export interface SoundPreferences {
  enabled: boolean;
  masterVolume: number; // 0–1
  hapticEnabled: boolean;
}

const DEFAULT_PREFS: SoundPreferences = {
  enabled: true,
  masterVolume: 0.7,
  hapticEnabled: true,
};

export function loadSoundPrefs(): SoundPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function saveSoundPrefs(prefs: Partial<SoundPreferences>): void {
  if (typeof window === 'undefined') return;
  try {
    const current = loadSoundPrefs();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...prefs }));
  } catch {
    // localStorage unavailable
  }
}

// ── Audio Pool (singleton) ──────────────────────────────────────────────────
const audioPool = new Map<SoundName, HTMLAudioElement>();

function getOrCreateAudio(name: SoundName): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null;

  const existing = audioPool.get(name);
  if (existing) return existing;

  try {
    const config = SOUND_REGISTRY[name];
    const audio = new Audio(config.src);
    audio.preload = 'auto';
    audio.volume = config.volume;
    audioPool.set(name, audio);
    return audio;
  } catch {
    return null;
  }
}

// ── Haptic Feedback ─────────────────────────────────────────────────────────
function triggerHaptic(pattern?: number[]): void {
  if (!pattern) return;
  try {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  } catch {
    // Vibration API not available
  }
}

// ── Hook ────────────────────────────────────────────────────────────────────
export interface UseSoundResult {
  /** Play a named sound. Returns a promise that resolves when playback starts. */
  play: (name: SoundName) => Promise<void>;
  /** Stop a currently playing sound. */
  stop: (name: SoundName) => void;
  /** Stop all sounds. */
  stopAll: () => void;
  /** Whether sounds are enabled per user preferences. */
  isEnabled: boolean;
  /** Trigger haptic feedback for a sound (mobile). */
  haptic: (name: SoundName) => void;
  /** Play sound + haptic together. */
  playWithHaptic: (name: SoundName) => Promise<void>;
  /** Preload specific sounds for instant playback. */
  preload: (...names: SoundName[]) => void;
}

export function useSound(): UseSoundResult {
  const prefsRef = useRef<SoundPreferences>(DEFAULT_PREFS);

  // Load preferences once on mount
  useEffect(() => {
    prefsRef.current = loadSoundPrefs();
  }, []);

  const play = useCallback(async (name: SoundName): Promise<void> => {
    const prefs = prefsRef.current;
    if (!prefs.enabled) return;

    const audio = getOrCreateAudio(name);
    if (!audio) return;

    const config = SOUND_REGISTRY[name];
    audio.volume = config.volume * prefs.masterVolume;
    audio.currentTime = 0;

    try {
      await audio.play();
    } catch {
      // Autoplay blocked or audio unavailable — swallow
    }
  }, []);

  const stop = useCallback((name: SoundName): void => {
    const audio = audioPool.get(name);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }, []);

  const stopAll = useCallback((): void => {
    audioPool.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });
  }, []);

  const haptic = useCallback((name: SoundName): void => {
    const prefs = prefsRef.current;
    if (!prefs.hapticEnabled) return;
    const config = SOUND_REGISTRY[name];
    triggerHaptic(config.vibrationPattern);
  }, []);

  const playWithHaptic = useCallback(
    async (name: SoundName): Promise<void> => {
      haptic(name);
      await play(name);
    },
    [play, haptic],
  );

  const preload = useCallback((...names: SoundName[]): void => {
    names.forEach(getOrCreateAudio);
  }, []);

  return {
    play,
    stop,
    stopAll,
    isEnabled: prefsRef.current.enabled,
    haptic,
    playWithHaptic,
    preload,
  };
}

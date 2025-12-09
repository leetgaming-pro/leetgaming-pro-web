/**
 * useKeyboardShortcut Hook
 * Global keyboard shortcut handler for application-wide hotkeys
 */

import { useEffect, useCallback } from 'react';

type KeyboardShortcutHandler = () => void;

interface UseKeyboardShortcutOptions {
  key: string;
  ctrl?: boolean;
  meta?: boolean; // Cmd on Mac, Win on Windows
  shift?: boolean;
  alt?: boolean;
  preventDefault?: boolean;
  enabled?: boolean;
}

export function useKeyboardShortcut(
  options: UseKeyboardShortcutOptions,
  callback: KeyboardShortcutHandler
) {
  const { 
    key, 
    ctrl = false, 
    meta = false, 
    shift = false, 
    alt = false, 
    preventDefault = true,
    enabled = true 
  } = options;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const keyMatches = event.key.toLowerCase() === key.toLowerCase();
      const ctrlMatches = ctrl ? event.ctrlKey : !event.ctrlKey;
      const metaMatches = meta ? event.metaKey : !event.metaKey;
      const shiftMatches = shift ? event.shiftKey : !event.shiftKey;
      const altMatches = alt ? event.altKey : !event.altKey;

      if (keyMatches && ctrlMatches && metaMatches && shiftMatches && altMatches) {
        if (preventDefault) {
          event.preventDefault();
        }
        callback();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [key, ctrl, meta, shift, alt, preventDefault, callback, enabled]);
}

/**
 * Hook for search shortcut (Cmd+K / Ctrl+K)
 */
export function useSearchShortcut(callback: KeyboardShortcutHandler, enabled = true) {
  // Mac: Cmd+K
  useKeyboardShortcut({ key: 'k', meta: true, enabled }, callback);
  // Windows/Linux: Ctrl+K
  useKeyboardShortcut({ key: 'k', ctrl: true, enabled }, callback);
}

/**
 * Hook for save shortcut (Cmd+S / Ctrl+S)
 */
export function useSaveShortcut(callback: KeyboardShortcutHandler, enabled = true) {
  useKeyboardShortcut({ key: 's', meta: true, enabled }, callback);
  useKeyboardShortcut({ key: 's', ctrl: true, enabled }, callback);
}

/**
 * Hook for escape shortcut
 */
export function useEscapeShortcut(callback: KeyboardShortcutHandler, enabled = true) {
  useKeyboardShortcut({ key: 'Escape', enabled }, callback);
}

// Legacy export for backwards compatibility - DO NOT USE in new code
// These are NOT hooks and will cause React Error #321 if used incorrectly
export const shortcuts = {
  search: () => {
    console.warn('shortcuts.search() is deprecated. Use useSearchShortcut() hook instead.');
  },
  save: () => {
    console.warn('shortcuts.save() is deprecated. Use useSaveShortcut() hook instead.');
  },
  escape: () => {
    console.warn('shortcuts.escape() is deprecated. Use useEscapeShortcut() hook instead.');
  },
};

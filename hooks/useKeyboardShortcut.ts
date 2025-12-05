/**
 * useKeyboardShortcut Hook
 * Global keyboard shortcut handler for application-wide hotkeys
 */

import { useEffect } from 'react';

type KeyboardShortcutHandler = (event: KeyboardEvent) => void;

interface UseKeyboardShortcutOptions {
  key: string;
  ctrl?: boolean;
  meta?: boolean; // Cmd on Mac, Win on Windows
  shift?: boolean;
  alt?: boolean;
  preventDefault?: boolean;
}

export function useKeyboardShortcut(
  options: UseKeyboardShortcutOptions,
  callback: KeyboardShortcutHandler
) {
  const { key, ctrl = false, meta = false, shift = false, alt = false, preventDefault = true } = options;

  useEffect(() => {
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
        callback(event);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [key, ctrl, meta, shift, alt, preventDefault, callback]);
}

/**
 * Common shortcut presets
 */
export const shortcuts = {
  // Search: Cmd+K (Mac) or Ctrl+K (Windows/Linux)
  search: (callback: KeyboardShortcutHandler) => {
    useKeyboardShortcut({ key: 'k', meta: true }, callback);
    useKeyboardShortcut({ key: 'k', ctrl: true }, callback);
  },

  // Save: Cmd+S or Ctrl+S
  save: (callback: KeyboardShortcutHandler) => {
    useKeyboardShortcut({ key: 's', meta: true }, callback);
    useKeyboardShortcut({ key: 's', ctrl: true }, callback);
  },

  // Escape
  escape: (callback: KeyboardShortcutHandler) => {
    useKeyboardShortcut({ key: 'Escape' }, callback);
  },
};

'use client';

/**
 * GlobalSearchProvider
 * Provides global search state accessible via keyboard shortcut (Cmd+K / Ctrl+K)
 * The actual SearchModal is rendered in the Navbar component - this provider
 * only manages state and keyboard shortcuts
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { useSearchShortcut, useEscapeShortcut } from '@/hooks/useKeyboardShortcut';

interface GlobalSearchContextValue {
  isOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  toggleSearch: () => void;
}

const GlobalSearchContext = createContext<GlobalSearchContextValue | null>(null);

export function useGlobalSearchContext() {
  const context = useContext(GlobalSearchContext);
  if (!context) {
    throw new Error('useGlobalSearchContext must be used within GlobalSearchProvider');
  }
  return context;
}

interface GlobalSearchProviderProps {
  children: React.ReactNode;
}

export function GlobalSearchProvider({ children }: GlobalSearchProviderProps) {
  const [isOpen, setIsOpen] = useState(false);

  const openSearch = useCallback(() => setIsOpen(true), []);
  const closeSearch = useCallback(() => setIsOpen(false), []);
  const toggleSearch = useCallback(() => setIsOpen((prev) => !prev), []);

  // Register keyboard shortcuts using proper hooks
  useSearchShortcut(openSearch);
  useEscapeShortcut(closeSearch, isOpen); // Only active when search is open

  const value: GlobalSearchContextValue = {
    isOpen,
    openSearch,
    closeSearch,
    toggleSearch,
  };

  return (
    <GlobalSearchContext.Provider value={value}>
      {children}
      {/* SearchModal is rendered in Navbar - not here to avoid duplicates */}
    </GlobalSearchContext.Provider>
  );
}

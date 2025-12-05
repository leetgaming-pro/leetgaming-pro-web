'use client';

/**
 * GlobalSearchProvider
 * Provides global search modal accessible via keyboard shortcut (Cmd+K / Ctrl+K)
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import SearchModal from './search-modal/search-modal';
import { shortcuts } from '@/hooks/useKeyboardShortcut';

interface GlobalSearchContextValue {
  isOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  toggleSearch: () => void;
}

const GlobalSearchContext = createContext<GlobalSearchContextValue | null>(null);

export function useGlobalSearch() {
  const context = useContext(GlobalSearchContext);
  if (!context) {
    throw new Error('useGlobalSearch must be used within GlobalSearchProvider');
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

  // Register keyboard shortcuts
  shortcuts.search(openSearch);
  shortcuts.escape(() => {
    if (isOpen) closeSearch();
  });

  const value: GlobalSearchContextValue = {
    isOpen,
    openSearch,
    closeSearch,
    toggleSearch,
  };

  return (
    <GlobalSearchContext.Provider value={value}>
      {children}
      <SearchModal />
    </GlobalSearchContext.Provider>
  );
}

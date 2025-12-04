/**
 * useReducedMotion Hook
 * Respects user's motion preferences for accessibility
 */

'use client';

import { useEffect, useState } from 'react';

export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if user prefers reduced motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return prefersReducedMotion;
}

// Helper to get simplified animations for reduced motion
export function getAccessibleAnimation<T>(
  normalAnimation: T,
  reducedAnimation: T,
  prefersReducedMotion: boolean
): T {
  return prefersReducedMotion ? reducedAnimation : normalAnimation;
}

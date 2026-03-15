/**
 * useScrollSections - Scroll-aware section tracking hook
 * Uses IntersectionObserver to track which landing section is visible
 * and provides lazy-mount signals for expensive 3D canvases
 */

"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

export interface SectionEntry {
  id: string;
  label: string;
}

export const LANDING_SECTIONS: SectionEntry[] = [
  { id: 'hero', label: 'Hero' },
  { id: 'product-overview', label: 'Platform' },
  { id: 'replay-analysis', label: 'AI Analysis' },
  { id: 'lobbies', label: 'Lobbies' },
  { id: 'tournaments', label: 'Tournaments' },
  { id: 'games', label: 'Games' },
  { id: 'social-proof', label: 'Community' },
  { id: 'final-cta', label: 'Get Started' },
];

export function useScrollSections() {
  const [activeSection, setActiveSection] = useState('hero');
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set(['hero']));
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const sectionId = entry.target.id;

          setVisibleSections((prev) => {
            const next = new Set(prev);
            if (entry.isIntersecting) {
              next.add(sectionId);
            }
            return next;
          });

          // Track the most visible section as active
          if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
            setActiveSection(sectionId);
          }
        });
      },
      {
        threshold: [0, 0.3, 0.5],
        rootMargin: '200px 0px 200px 0px', // Preload 200px ahead
      }
    );

    // Observe all sections
    LANDING_SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observerRef.current?.observe(el);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  const isSectionVisible = useCallback(
    (sectionId: string) => visibleSections.has(sectionId),
    [visibleSections]
  );

  const scrollToSection = useCallback((sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return {
    activeSection,
    visibleSections,
    isSectionVisible,
    scrollToSection,
    sections: LANDING_SECTIONS,
  };
}

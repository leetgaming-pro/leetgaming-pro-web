'use client';

/**
 * BreadcrumbBar wrapper with dynamic import to avoid SSR issues
 */

import dynamic from 'next/dynamic';

// Dynamic import with SSR disabled to prevent hydration issues
const BreadcrumbBar = dynamic(
  () => import('./breadcrumb-bar').then(mod => mod.BreadcrumbBar),
  { 
    ssr: false,
    loading: () => null // Don't show anything while loading
  }
);

export { BreadcrumbBar };
export default BreadcrumbBar;


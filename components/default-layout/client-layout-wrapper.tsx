'use client';

/**
 * ClientLayoutWrapper
 * Wraps the client-side only parts of the layout
 * Separating this from the Server Component layout avoids React Error #321
 */

import { useState, useEffect } from 'react';
import { Providers } from './providers';
import { Navbar } from '@/components/navbar';
import { BreadcrumbBar } from '@/components/breadcrumb';
import FooterColumns from '../footer-columns/app';
import { GlobalSearchProvider } from '@/components/search/global-search-provider';
import { ToastProvider } from '@/components/toast/toast-provider';
import Box from './box';

interface ClientLayoutWrapperProps {
  children: React.ReactNode;
}

export function ClientLayoutWrapper({ children }: ClientLayoutWrapperProps) {
  const [domLoaded, setDomLoaded] = useState(false);

  useEffect(() => {
    setDomLoaded(true);
  }, []);

  if (!domLoaded) {
    // Return a minimal loading state to prevent flash
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse">
          <div className="w-32 h-8 bg-default-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <Box>
      <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
        <ToastProvider>
          <GlobalSearchProvider>
            <div className="relative flex flex-col h-screen w-full">
              <Navbar />
              <BreadcrumbBar />
              <main className="flex w-full flex-col items-center flex-grow">
                <div className="w-full max-w-[1400px] mx-auto px-4 lg:px-6">
                  {children}
                </div>
              </main>
              <FooterColumns />
            </div>
          </GlobalSearchProvider>
        </ToastProvider>
      </Providers>
    </Box>
  );
}

export default ClientLayoutWrapper;


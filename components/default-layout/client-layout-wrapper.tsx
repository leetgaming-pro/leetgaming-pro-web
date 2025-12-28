'use client';

/**
 * ClientLayoutWrapper
 * Wraps the client-side only parts of the layout
 * Separating this from the Server Component layout avoids React Error #321
 *
 * Provider Hierarchy (defined in providers.tsx):
 * ================================================
 * NextUIProvider (UI framework)
 *   └── NextThemesProvider (dark/light mode)
 *         └── SessionProvider (NextAuth.js sessions)
 *               └── AuthSync (RID token synchronization)
 *                     └── SDKProvider (API SDK singleton)
 *                           └── GlobalSearchProvider (search)
 *                                 └── ToastProvider (notifications)
 *                                       └── Application Content
 */

import { Providers } from './providers';
import { Navbar } from '@/components/navbar';
import { BreadcrumbBar } from '@/components/breadcrumb';
import FooterColumns from '../footer-columns/app';
import Box from './box';
import { DevelopmentNotice } from '@/components/development-notice';

interface ClientLayoutWrapperProps {
  children: React.ReactNode;
}

export function ClientLayoutWrapper({ children }: ClientLayoutWrapperProps) {
  return (
    <Box>
      <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
        <div className="relative flex flex-col h-screen w-full">
          <Navbar />
          <BreadcrumbBar />
          <DevelopmentNotice />
          <main className="flex w-full flex-col items-center flex-grow">
            <div className="w-full max-w-[1400px] mx-auto px-4 lg:px-6">
              {children}
            </div>
          </main>
          <FooterColumns />
        </div>
      </Providers>
    </Box>
  );
}

export default ClientLayoutWrapper;


"use client";

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

import { Providers } from "./providers";
import { Navbar } from "@/components/navbar";
import { BreadcrumbBar } from "@/components/breadcrumb";
import FooterColumns from "../footer-columns/app";
import { MobileNavigation } from "@/components/ui/mobile-navigation";
import Box from "./box";
import { DevelopmentNotice } from "@/components/development-notice";
import type { Locale } from "@/lib/i18n";

interface ClientLayoutWrapperProps {
  children: React.ReactNode;
  nonce?: string;
  initialLocale?: Locale;
}

export function ClientLayoutWrapper({
  children,
  nonce,
  initialLocale,
}: ClientLayoutWrapperProps) {
  return (
    <Box>
      <Providers
        themeProps={{
          attribute: "class",
          defaultTheme: "dark",
          enableSystem: true,
          nonce,
        }}
        initialLocale={initialLocale}
      >
        <div className="relative flex flex-col h-screen w-full">
          <Navbar />
          <BreadcrumbBar />
          <DevelopmentNotice />
          <main className="flex w-full flex-col items-center flex-grow pb-20 md:pb-0">
            <div className="w-full max-w-[1400px] mx-auto px-4 lg:px-6">
              {children}
            </div>
          </main>
          <MobileNavigation />
          <FooterColumns />
        </div>
      </Providers>
    </Box>
  );
}

export default ClientLayoutWrapper;

"use client";

import * as React from "react";
import { NextUIProvider } from "@nextui-org/system";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ThemeProviderProps } from "next-themes/dist/types";
import { SessionProvider } from "next-auth/react";
import { AuthSync } from "@/components/auth/auth-sync";
import { SDKProvider } from "@/contexts/sdk-context";
import { ProfileProvider } from "@/contexts/profile-context";
import { GlobalSearchProvider } from "@/components/search/global-search-provider";
import { PlanLimitProvider, usePlanLimit } from "@/contexts/plan-limit-context";
import { ErrorProvider } from "@/contexts/error-context";
import { ToastProvider } from "@/components/toast/toast-provider";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

/**
 * Inner component that connects ErrorProvider to PlanLimitProvider
 * This avoids circular dependency by using composition instead of import
 */
function ErrorProviderWithPlanLimit({
  children,
}: {
  children: React.ReactNode;
}) {
  const { handleApiError } = usePlanLimit();
  return (
    <ErrorProvider onPlanLimitError={handleApiError}>{children}</ErrorProvider>
  );
}

/**
 * Provider Hierarchy:
 * ================================================
 * NextUIProvider (UI framework)
 *   └── NextThemesProvider (dark/light mode)
 *         └── SessionProvider (NextAuth.js sessions)
 *               └── AuthSync (RID token synchronization)
 *                     └── SDKProvider (API SDK singleton)
 *                           └── ProfileProvider (multi-game profiles)
 *                                 └── PlanLimitProvider (plan limit handling)
 *                                       └── ErrorProviderWithPlanLimit (error handling connected to plan limits)
 *                                             └── ToastProvider (simple success/info toasts)
 *                                                   └── GlobalSearchProvider (search)
 *                                                         └── Application Content
 */
export function Providers({ children, themeProps }: ProvidersProps) {
  const router = useRouter();

  return (
    <>
      <NextUIProvider navigate={router.push}>
        <NextThemesProvider {...themeProps}>
          <SessionProvider basePath="/api/auth">
            <AuthSync>
              <SDKProvider>
                <ProfileProvider>
                  <PlanLimitProvider>
                    <ErrorProviderWithPlanLimit>
                      <ToastProvider>
                        <GlobalSearchProvider>{children}</GlobalSearchProvider>
                      </ToastProvider>
                    </ErrorProviderWithPlanLimit>
                  </PlanLimitProvider>
                </ProfileProvider>
              </SDKProvider>
            </AuthSync>
          </SessionProvider>
        </NextThemesProvider>
      </NextUIProvider>
    </>
  );
}

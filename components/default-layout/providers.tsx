"use client";

/**
 * Application Providers
 * Central location for all React Context providers
 *
 * Provider Hierarchy (ORDER MATTERS):
 * ===================================
 * NextUIProvider (UI framework)
 *   └── NextThemesProvider (dark/light mode)
 *         └── SessionProvider (NextAuth.js sessions)
 *               └── AuthSync (RID token synchronization)
 *                     └── SDKProvider (API SDK singleton)
 *                           └── GlobalSearchProvider (search uses SDK)
 *                                 └── ToastProvider (notifications)
 *                                       └── Children
 */

import * as React from "react";
import { NextUIProvider } from "@nextui-org/system";
import { useRouter } from 'next/navigation'
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ThemeProviderProps } from "next-themes/dist/types";
import { SessionProvider } from 'next-auth/react'
import { AuthSync } from '@/components/auth/auth-sync';
import { SDKProvider } from '@/contexts/sdk-context';
import { GlobalSearchProvider } from '@/components/search/global-search-provider';
import { ToastProvider } from '@/components/toast/toast-provider';

export interface ProvidersProps {
	children: React.ReactNode;
	themeProps?: ThemeProviderProps;
}

export function Providers({ children, themeProps }: ProvidersProps) {
	const router = useRouter();

	return (
		<NextUIProvider navigate={router.push}>
			<NextThemesProvider {...themeProps}>
				<SessionProvider basePath='/api/auth'>
					<AuthSync>
						<SDKProvider>
							<GlobalSearchProvider>
								<ToastProvider>
									{children}
								</ToastProvider>
							</GlobalSearchProvider>
						</SDKProvider>
					</AuthSync>
				</SessionProvider>
			</NextThemesProvider>
		</NextUIProvider>
	);
}


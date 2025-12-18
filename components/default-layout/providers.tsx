"use client";

import * as React from "react";
import { NextUIProvider } from "@nextui-org/system";
import { useRouter } from 'next/navigation'
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ThemeProviderProps } from "next-themes/dist/types";
import { SessionProvider } from 'next-auth/react'
import { AuthSync } from '@/components/auth/auth-sync';

export interface ProvidersProps {
	children: React.ReactNode;
	themeProps?: ThemeProviderProps;
}

export function Providers({ children, themeProps }: ProvidersProps) {
	const router = useRouter();

	return (
		<>
			<NextUIProvider navigate={router.push}>
				<NextThemesProvider {...themeProps}>
					<SessionProvider basePath='/api/auth'>
						<AuthSync>{children}</AuthSync>
					</SessionProvider>
				</NextThemesProvider>
			</NextUIProvider>
		</>
	);
}


/* eslint-disable @next/next/no-head-element */
"use client"

import { Metadata, Viewport } from "next";
import { siteConfig } from "@/config/site";
import ConsoleLayout from '@/components/console-layout/console';
import Box from '../default-layout/box';
import { Providers } from '../default-layout/providers';

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
  width: 'device-width',
  initialScale: 1,
};

export { viewport };

export default function SessionConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>

      <head />
      <body>
        <Box>
          <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
            <ConsoleLayout>
              <div>
                {children}
              </div>
            </ConsoleLayout>
          </Providers>
        </Box>
      </body>
    </html>
  );
}

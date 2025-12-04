/* eslint-disable @next/next/no-head-element */
"use client"
import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import { siteConfig } from "@/config/site";
import { fontSans, pressStart2P } from "@/config/fonts";
import { Providers } from "./providers";
import { Navbar } from "@/components/navbar";
import clsx from "clsx";
import Box from './box';
import FooterColumns from '../footer-columns/app';
import { useEffect, useState } from "react";
import { GlobalSearchProvider } from '@/components/search/global-search-provider';
import { ToastProvider } from '@/components/toast/toast-provider';

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
  colorScheme: 'dark',
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
  width: 'device-width',
  initialScale: 1,
};

// Exporting this way to avoid NextJs 14 type error
export { viewport };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const [domLoaded, setDomLoaded] = useState(false);

  useEffect(() => {
    setDomLoaded(true);
  }, []);

  return (
    
    <html lang="en" suppressHydrationWarning={true}>
      
      <head />
      <body
        className={clsx(
          "min-h-screen bg-background bg-scroll blur-glow-pry-gh antialiased w-full overflow-x-hidden",
          pressStart2P.className
        )}
      >{ domLoaded && <Box>
          <Providers themeProps={{ attribute: "class", defaultTheme: "dark"}} >
            <ToastProvider>
            <GlobalSearchProvider>
              <div className="relative flex flex-col h-screen w-full">
                <Navbar  />
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
}
      </body>
    </html>
    
  );
}

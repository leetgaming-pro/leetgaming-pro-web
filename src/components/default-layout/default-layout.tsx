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
          "min-h-screen bg-background bg-scroll blur-glow-pry-gh antialiased w-full",
          pressStart2P.className
        )}
      >
      {domLoaded && (
          <Box>
            <Providers themeProps={{ attribute: "class", defaultTheme: "dark"}} >
              <div className="relative flex flex-col h-screen w-full">
                <Navbar  />
                {/* <main className="container mx-auto max-w-7xl pt-16 px-6 flex-grow"> */}
                <main className="flex w-full justify-center">
                  {children}
                </main>
                 <FooterColumns />
              </div>
            </Providers>
          </Box>
        )
      }
      </body>
    </html>

  );
}

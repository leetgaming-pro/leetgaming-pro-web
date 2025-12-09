/* eslint-disable @next/next/no-head-element */
import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import { siteConfig } from "@/config/site";
import { pressStart2P } from "@/config/fonts";
import clsx from "clsx";
import { ClientLayoutWrapper } from './client-layout-wrapper';

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
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head />
      <body
        className={clsx(
          "min-h-screen bg-background bg-scroll blur-glow-pry-gh antialiased w-full overflow-x-hidden",
          pressStart2P.className
        )}
      >
        <ClientLayoutWrapper>
          {children}
        </ClientLayoutWrapper>
      </body>
    </html>
  );
}

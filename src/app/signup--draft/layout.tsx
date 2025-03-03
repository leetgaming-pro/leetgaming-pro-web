import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import { siteConfig } from "@/config/site";
import { fontSans, pressStart2P } from "@/config/fonts";
import { Navbar } from "@/components/navbar";
import { Link } from "@nextui-org/link";
import clsx from "clsx";
import { logo } from '@/components/primitives';
import { Chip, Divider, LinkIcon, Spacer } from '@nextui-org/react';
import Box from '@/components/default-layout/box';
import { Providers } from '@/components/default-layout/providers';

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

// Exporting this way to avoid NextJs 14 type error
export { viewport };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html  suppressHydrationWarning>
      <head />
      <body
        className={clsx(
          "min-h-screen bg-background bg-scroll blur-glow-pry-gh antialiased",
          pressStart2P.className
        )}
      >
        <Box>
          <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
            <div>
              <main>
                {children}
              </main>
            </div>
          </Providers>
        </Box>
      </body>
    </html>
  );
}

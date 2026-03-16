import type { Metadata } from "next";
import { metadataBase } from "@/lib/metadata-base";

export const metadata: Metadata = {
  metadataBase,
  title: "Pitch Deck — LeetGaming.PRO | Esports Competition Platform",
  description:
    "Interactive investor deck for LeetGaming.PRO — the esports competition platform combining replay analysis, verified scores, matchmaking, tournaments, and prize distribution for 63M+ players.",
  openGraph: {
    title: "Pitch Deck — LeetGaming.PRO",
    description:
      "Interactive investor pitch deck for LeetGaming.PRO and its verified score intelligence infrastructure.",
    type: "website",
    images: [{ url: "/investors/og-investors.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pitch Deck — LeetGaming.PRO",
    description:
      "Investor deck covering the LeetGaming competition platform and verified score infrastructure.",
  },
  robots: "index, follow",
};

export default function PitchDeckLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

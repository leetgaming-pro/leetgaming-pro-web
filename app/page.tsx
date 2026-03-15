"use client";
import React from "react";
import dynamic from "next/dynamic";
import LobbiesShowcase from "@/components/landing/LobbiesShowcase";
import MatchesShowcase from "@/components/landing/MatchesShowcase";
import { MobileNavigation } from "@/components/ui";

// Dynamic imports for heavy 3D/animation sections
const HeroScene3D = dynamic(
  () => import("@/components/landing/HeroScene3D"),
  { ssr: false }
);
const ProductOverview = dynamic(
  () => import("@/components/landing/ProductOverview"),
  { ssr: false }
);
const ReplayAnalysisShowcase = dynamic(
  () => import("@/components/landing/ReplayAnalysisShowcase"),
  { ssr: false }
);
const TournamentsShowcase = dynamic(
  () => import("@/components/landing/TournamentsShowcase"),
  { ssr: false }
);
const UpcomingGamesSection = dynamic(
  () => import("@/components/upcoming-games/UpcomingGamesSection"),
  { ssr: false }
);
const GamesGallery = dynamic(
  () => import("@/components/landing/GamesGallery"),
  { ssr: false }
);
const SocialProofSection = dynamic(
  () => import("@/components/landing/SocialProofSection"),
  { ssr: false }
);
const FinalCTA = dynamic(
  () => import("@/components/landing/FinalCTA"),
  { ssr: false }
);

export default function Component() {
  return (
    <div className="relative flex min-h-dvh w-full flex-col bg-background left-0 right-0 pb-20 md:pb-0">
      {/* Section 1: Immersive 3D Hero */}
      <section id="hero">
        <HeroScene3D />
      </section>

      {/* Gradient divider */}
      <div className="landing-gradient-divider" />

      {/* Section 2: Product Overview - What is LeetGaming.PRO? */}
      <section id="product-overview">
        <ProductOverview />
      </section>

      {/* Section 3: AI Replay Analysis Deep Dive */}
      <section id="replay-analysis">
        <ReplayAnalysisShowcase />
      </section>

      {/* Gradient divider */}
      <div className="landing-gradient-divider" />

      {/* Section 4: Live Matchmaking / Lobbies */}
      <section id="lobbies">
        <LobbiesShowcase />
      </section>

      {/* Section 4.5: Upcoming & Live Games */}
      <section id="upcoming-games">
        <UpcomingGamesSection />
      </section>

      {/* Section 5: Tournaments & Prize Pools */}
      <section id="tournaments">
        <TournamentsShowcase />
      </section>

      {/* Section 6: Supported Games Gallery */}
      <section id="games">
        <GamesGallery />
      </section>

      {/* Section 7: Social Proof & Stats */}
      <section id="social-proof">
        <SocialProofSection />
      </section>

      {/* Section 8: Recent Matches */}
      <MatchesShowcase />

      {/* Section 9: Final CTA */}
      <section id="final-cta">
        <FinalCTA />
      </section>

      {/* Mobile Navigation */}
      <MobileNavigation />
    </div>
  );
}

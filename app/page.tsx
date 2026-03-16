"use client";
import React from "react";
import dynamic from "next/dynamic";
import LobbiesShowcase from "@/components/landing/LobbiesShowcase";
import MatchesShowcase from "@/components/landing/MatchesShowcase";
import { SectionErrorBoundary } from "@/components/landing/SectionErrorBoundary";

// Dynamic imports for heavy 3D/animation sections with error recovery
const DynamicFallback = () => null;

const HeroScene3D = dynamic(
  () => import("@/components/landing/HeroScene3D").catch(() => ({ default: DynamicFallback })),
  { ssr: false }
);
const ProductOverview = dynamic(
  () => import("@/components/landing/ProductOverview").catch(() => ({ default: DynamicFallback })),
  { ssr: false }
);
const ReplayAnalysisShowcase = dynamic(
  () => import("@/components/landing/ReplayAnalysisShowcase").catch(() => ({ default: DynamicFallback })),
  { ssr: false }
);
const TournamentsShowcase = dynamic(
  () => import("@/components/landing/TournamentsShowcase").catch(() => ({ default: DynamicFallback })),
  { ssr: false }
);
const UpcomingGamesSection = dynamic(
  () => import("@/components/upcoming-games/UpcomingGamesSection").catch(() => ({ default: DynamicFallback })),
  { ssr: false }
);
const GamesGallery = dynamic(
  () => import("@/components/landing/GamesGallery").catch(() => ({ default: DynamicFallback })),
  { ssr: false }
);
const SocialProofSection = dynamic(
  () => import("@/components/landing/SocialProofSection").catch(() => ({ default: DynamicFallback })),
  { ssr: false }
);
const FinalCTA = dynamic(
  () => import("@/components/landing/FinalCTA").catch(() => ({ default: DynamicFallback })),
  { ssr: false }
);

export default function Component() {
  return (
    <div className="relative flex min-h-dvh w-full flex-col bg-background left-0 right-0 pb-20 md:pb-0">
      {/* Section 1: Hero */}
      <SectionErrorBoundary>
        <section id="hero">
          <HeroScene3D />
        </section>
      </SectionErrorBoundary>

      {/* Gradient divider */}
      <div className="landing-gradient-divider" />

      {/* Section 2: Product Overview */}
      <SectionErrorBoundary>
        <section id="product-overview">
          <ProductOverview />
        </section>
      </SectionErrorBoundary>

      {/* Section 3: AI Replay Analysis */}
      <SectionErrorBoundary>
        <section id="replay-analysis">
          <ReplayAnalysisShowcase />
        </section>
      </SectionErrorBoundary>

      {/* Gradient divider */}
      <div className="landing-gradient-divider" />

      {/* Section 4: Live Matchmaking / Lobbies */}
      <SectionErrorBoundary>
        <section id="lobbies">
          <LobbiesShowcase />
        </section>
      </SectionErrorBoundary>

      {/* Section 4.5: Upcoming & Live Games */}
      <SectionErrorBoundary>
        <section id="upcoming-games">
          <UpcomingGamesSection />
        </section>
      </SectionErrorBoundary>

      {/* Section 5: Tournaments & Prize Pools */}
      <SectionErrorBoundary>
        <section id="tournaments">
          <TournamentsShowcase />
        </section>
      </SectionErrorBoundary>

      {/* Section 6: Games Gallery */}
      <SectionErrorBoundary>
        <section id="games">
          <GamesGallery />
        </section>
      </SectionErrorBoundary>

      {/* Section 7: Social Proof */}
      <SectionErrorBoundary>
        <section id="social-proof">
          <SocialProofSection />
        </section>
      </SectionErrorBoundary>

      {/* Section 8: Recent Matches */}
      <SectionErrorBoundary>
        <MatchesShowcase />
      </SectionErrorBoundary>

      {/* Section 9: Final CTA */}
      <SectionErrorBoundary>
        <section id="final-cta">
          <FinalCTA />
        </section>
      </SectionErrorBoundary>
    </div>
  );
}

/**
 * SocialProofSection - Platform capabilities & trust indicators
 * Navy background section highlighting core platform capabilities
 */

"use client";

import React from "react";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { useTheme } from "next-themes";
import { Electrolize } from "next/font/google";
import { scrollAnimations, scrollViewport, springs } from "@/lib/design/animations";
import { Icon } from "@iconify/react";

const electrolize = Electrolize({ weight: "400", subsets: ["latin"] });

// ─── Platform Capabilities ─────────────────────────────────────────────────

const CAPABILITIES = [
  {
    icon: "solar:cpu-bolt-bold",
    title: "AI REPLAY ANALYSIS",
    description: "Frame-by-frame analysis powered by computer vision. Get actionable insights on aim, positioning, and utility usage.",
  },
  {
    icon: "solar:shield-check-bold",
    title: "FAIR MATCHMAKING",
    description: "Elo-based skill matching across multiple game modes. Every match is balanced for a truly competitive experience.",
  },
  {
    icon: "solar:wallet-money-bold",
    title: "INSTANT PAYOUTS",
    description: "On-chain prize distribution via smart contracts. Winnings hit your wallet the moment the match is verified.",
  },
  {
    icon: "solar:earth-bold",
    title: "MULTI-REGION SUPPORT",
    description: "Low-latency infrastructure across global regions. Play competitive matches with minimal ping, wherever you are.",
  },
];

// ─── Trust Indicators ───────────────────────────────────────────────────────

const TRUST_ITEMS = [
  { icon: "solar:lock-keyhole-bold", text: "Transparent Smart Contracts" },
  { icon: "solar:verified-check-bold", text: "Anti-Cheat Integrated" },
  { icon: "solar:server-bold", text: "99.9% Uptime Target" },
];

// ─── Main Component ─────────────────────────────────────────────────────────

export default function SocialProofSection() {
  const { theme } = useTheme();

  return (
    <section
      className="landing-section relative py-24 md:py-32 overflow-hidden"
      style={{
        background:
          theme === "dark"
            ? "linear-gradient(135deg, #1e2a38 0%, #34445C 50%, #1e2a38 100%)"
            : "linear-gradient(135deg, #34445C 0%, #2a3749 50%, #34445C 100%)",
      }}
    >
      {/* Decorative grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(rgba(220,255,55,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(220,255,55,0.5) 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
        }}
      />

      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ background: "linear-gradient(90deg, #FF4654, #FFC700, #DCFF37)" }}
      />

      <div className="container mx-auto px-6 sm:px-8 lg:px-12 max-w-7xl relative z-10">
        <LazyMotion features={domAnimation}>
          {/* Section Header */}
          <m.div
            className="text-center mb-16"
            initial="offscreen"
            whileInView="onscreen"
            viewport={scrollViewport}
            variants={scrollAnimations.fadeInUp}
          >
            <span
              className={`${electrolize.className} text-xs sm:text-sm uppercase tracking-[0.3em] text-[#DCFF37] mb-4 block`}
            >
              WHY LEETGAMING
            </span>
            <h2
              className={`${electrolize.className} text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F5F0E1] mb-4 uppercase tracking-tight`}
            >
              BUILT FOR{" "}
              <span className="text-[#DCFF37]">COMPETITORS</span>
            </h2>
            <p className="text-sm sm:text-base text-[#F5F0E1]/60 max-w-xl mx-auto">
              Every feature is designed to give you an edge — from AI-driven
              analysis to trustless prize distribution.
            </p>
          </m.div>

          {/* Capabilities Grid */}
          <m.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-16"
            initial="offscreen"
            whileInView="onscreen"
            viewport={scrollViewport}
            variants={{
              offscreen: {},
              onscreen: { transition: { staggerChildren: 0.1 } },
            }}
          >
            {CAPABILITIES.map((cap, i) => (
              <m.div
                key={i}
                className="p-6 border border-[#DCFF37]/15 bg-[#DCFF37]/5 backdrop-blur-sm"
                style={{
                  clipPath:
                    "polygon(0 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%)",
                }}
                variants={{
                  offscreen: { opacity: 0, y: 30, scale: 0.95 },
                  onscreen: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: springs.gentle,
                  },
                }}
              >
                <div
                  className="w-10 h-10 mb-4 flex items-center justify-center bg-[#DCFF37]/10"
                  style={{
                    clipPath:
                      "polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)",
                  }}
                >
                  <Icon icon={cap.icon} width={20} className="text-[#DCFF37]" />
                </div>
                <h3
                  className={`${electrolize.className} text-sm font-bold text-[#DCFF37] uppercase tracking-wider mb-2`}
                >
                  {cap.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#F5F0E1]/60 leading-relaxed">
                  {cap.description}
                </p>
              </m.div>
            ))}
          </m.div>

          {/* Trust row */}
          <m.div
            className="flex flex-wrap justify-center gap-x-8 gap-y-3"
            initial="offscreen"
            whileInView="onscreen"
            viewport={scrollViewport}
            variants={scrollAnimations.fadeInUp}
          >
            {TRUST_ITEMS.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-xs sm:text-sm text-[#F5F0E1]/50"
              >
                <Icon icon={item.icon} width={16} className="text-[#DCFF37]/60" />
                <span className={electrolize.className}>{item.text}</span>
              </div>
            ))}
          </m.div>
        </LazyMotion>
      </div>

      {/* Bottom accent line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1"
        style={{ background: "linear-gradient(90deg, #DCFF37, #FFC700, #FF4654)" }}
      />
    </section>
  );
}

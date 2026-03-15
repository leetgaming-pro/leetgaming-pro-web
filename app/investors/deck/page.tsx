"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardBody, Chip } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import { title } from "@/components/primitives";
import { EsportsButton } from "@/components/ui/esports-button";
import { InvestorSubNav } from "@/components/investors/investor-sub-nav";

/* ──────────────────────────────────────────────────────────────────
 *  Constants
 * ────────────────────────────────────────────────────────────────── */
const CALENDLY_URL = "https://calendly.com/leetgaming-pro/investor-meeting";
const CONTACT_EMAIL = "investors@leetgaming.pro";
const TOTAL_SLIDES = 14;

/* ──────────────────────────────────────────────────────────────────
 *  Slide transitions
 * ────────────────────────────────────────────────────────────────── */
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction < 0 ? "100%" : "-100%",
    opacity: 0,
  }),
};

/* ──────────────────────────────────────────────────────────────────
 *  Branded building blocks
 * ────────────────────────────────────────────────────────────────── */
function SlideContainer({
  children,
  gradient,
}: {
  children: React.ReactNode;
  gradient?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center px-6 sm:px-10 lg:px-20 py-12 min-h-[calc(100vh-180px)] ${
        gradient ?? "bg-white dark:bg-[#0a0a0a]"
      }`}
    >
      {children}
    </div>
  );
}

function SlideBadge({ text }: { text: string }) {
  return (
    <Chip
      size="sm"
      variant="flat"
      className="bg-[#FF4654]/10 dark:bg-[#DCFF37]/10 text-[#FF4654] dark:text-[#DCFF37] font-bold uppercase tracking-widest mb-6"
    >
      {text}
    </Chip>
  );
}

function BrandIcon({ icon, large }: { icon: string; large?: boolean }) {
  const size = large ? "w-20 h-20" : "w-14 h-14";
  const iconSize = large ? 40 : 28;
  return (
    <div
      className={`${size} flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C] mx-auto mb-6`}
      style={{
        clipPath:
          "polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%)",
      }}
    >
      <Icon
        icon={icon}
        className="text-[#F5F0E1] dark:text-[#34445C]"
        width={iconSize}
      />
    </div>
  );
}

function StatGrid({
  stats,
}: {
  stats: { value: string; label: string }[];
}) {
  return (
    <div className="flex flex-wrap justify-center gap-6 mt-8">
      {stats.map((s) => (
        <div
          key={s.label}
          className="flex flex-col items-center px-6 py-4 border border-[#FF4654]/20 dark:border-[#DCFF37]/20 bg-[#FF4654]/5 dark:bg-[#DCFF37]/5 min-w-[140px]"
          style={{
            clipPath:
              "polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)",
          }}
        >
          <span className="text-3xl lg:text-4xl font-bold text-[#FF4654] dark:text-[#DCFF37]">
            {s.value}
          </span>
          <span className="text-xs text-default-500 uppercase tracking-wider mt-1">
            {s.label}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────
 *  Individual Slides
 * ────────────────────────────────────────────────────────────────── */
function Slide1Cover() {
  return (
    <SlideContainer gradient="bg-gradient-to-br from-[#34445C] to-[#1e2a38]">
      <div className="mb-4">
        <span className="text-4xl md:text-6xl lg:text-7xl font-bold text-[#F5F0E1]">
          LEET<span className="text-[#DCFF37]">GAMING</span>.PRO
        </span>
      </div>
      <h2 className="text-xl md:text-2xl lg:text-3xl text-[#F5F0E1]/80 font-medium mb-4 max-w-2xl">
        The all-in-one esports competition platform powered by verified score
        intelligence
      </h2>
      <p className="text-lg text-[#DCFF37] font-semibold tracking-wider mb-8">
        Compete · Analyze · Earn
      </p>
      <StatGrid
        stats={[
          { value: "$21.9B", label: "TAM" },
          { value: "63M+", label: "Players" },
          { value: "5:1–15:1", label: "LTV:CAC" },
        ]}
      />
    </SlideContainer>
  );
}

function Slide2Problem() {
  const problems = [
    {
      icon: "solar:danger-triangle-bold",
      title: "Fragmented Tools",
      desc: "Players juggle 4-5 separate apps for analytics, matchmaking, tournaments, and earnings.",
    },
    {
      icon: "solar:shield-warning-bold",
      title: "No Trust in Prizes",
      desc: "Prize distribution is opaque — late payments, disputes, and no verification.",
    },
    {
      icon: "solar:map-point-wave-bold",
      title: "Regional Exclusion",
      desc: "LATAM, SEA, MENA — massive player bases, zero local platforms with fair payouts.",
    },
    {
      icon: "solar:ghost-bold",
      title: "Skill Gap",
      desc: "No affordable path from casual play to professional competition.",
    },
  ];

  return (
    <SlideContainer>
      <SlideBadge text="THE PROBLEM" />
      <h2 className={title({ size: "lg", class: "text-[#34445C] dark:text-[#F5F0E1] mb-4 text-3xl lg:text-5xl" })}>
        Competitive Gamers Deserve Better
      </h2>
      <p className="text-default-500 max-w-2xl mb-10">
        63 million players. No single platform serves them end-to-end.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl w-full">
        {problems.map((p) => (
          <Card key={p.title} className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20 text-left">
            <CardBody className="p-6 flex flex-row items-start gap-4">
              <div
                className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-[#FF4654]/10 dark:bg-[#DCFF37]/10"
                style={{
                  clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)",
                }}
              >
                <Icon icon={p.icon} className="text-[#FF4654] dark:text-[#DCFF37]" width={20} />
              </div>
              <div>
                <h4 className="font-bold text-[#34445C] dark:text-[#F5F0E1] mb-1">{p.title}</h4>
                <p className="text-sm text-default-500">{p.desc}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </SlideContainer>
  );
}

function Slide3Solution() {
  const pillars = [
    { icon: "solar:video-frame-play-horizontal-bold", label: "AI Replay Analysis", desc: "Deep performance insights from every match" },
    { icon: "solar:users-group-rounded-bold", label: "Skill-Based Matchmaking", desc: "Fair, competitive matches via Elo/Glicko" },
    { icon: "solar:shield-check-bold", label: "Verified Scores", desc: "Trusted result verification for payouts, rankings, and disputes" },
    { icon: "solar:wallet-money-bold", label: "Transparent Prizes", desc: "Escrow and payout flows triggered by trusted outcomes" },
  ];

  return (
    <SlideContainer>
      <SlideBadge text="THE SOLUTION" />
      <BrandIcon icon="solar:gamepad-bold" large />
      <h2 className={title({ size: "lg", class: "text-[#34445C] dark:text-[#F5F0E1] mb-4 text-3xl lg:text-5xl" })}>
        One Platform. Full Stack.
      </h2>
      <p className="text-default-500 max-w-2xl mb-10">
        The first platform integrating analytics, competition, and earning into a single ecosystem.
      </p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl w-full">
        {pillars.map((p) => (
          <div key={p.label} className="flex flex-col items-center text-center gap-3 p-4">
            <div
              className="w-14 h-14 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]"
              style={{ clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)" }}
            >
              <Icon icon={p.icon} className="text-[#F5F0E1] dark:text-[#34445C]" width={28} />
            </div>
            <h4 className="font-bold text-[#34445C] dark:text-[#F5F0E1] text-sm">{p.label}</h4>
            <p className="text-xs text-default-500">{p.desc}</p>
          </div>
        ))}
      </div>
    </SlideContainer>
  );
}

function Slide4ScoresMoat() {
  const pillars = [
    {
      icon: "solar:database-bold",
      title: "Multi-Source Ingestion",
      desc: "Scores aggregate from 6 external providers instead of relying on a single opaque source.",
    },
    {
      icon: "solar:shield-check-bold",
      title: "Consensus Verification",
      desc: "Weighted validation and dispute windows create a financial-grade result lifecycle.",
    },
    {
      icon: "solar:wallet-money-bold",
      title: "Outcome Settlement",
      desc: "Verified results can safely trigger prize distribution, ranking changes, and reward logic.",
    },
  ];

  return (
    <SlideContainer gradient="bg-gradient-to-br from-[#34445C]/5 to-[#FF4654]/5 dark:from-[#DCFF37]/5 dark:to-[#34445C]/10">
      <SlideBadge text="CORE MOAT" />
      <BrandIcon icon="solar:shield-check-bold" large />
      <h2 className={title({ size: "lg", class: "text-[#34445C] dark:text-[#F5F0E1] mb-4 text-3xl lg:text-5xl" })}>
        Verified Scores Are the Trust Engine
      </h2>
      <p className="text-default-500 max-w-3xl mb-10">
        In esports, the hardest problem is not displaying a score. It is
        proving a result strongly enough that money, rankings, and external
        ecosystems can rely on it.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full mb-10">
        {pillars.map((pillar) => (
          <Card key={pillar.title} className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20 text-left h-full">
            <CardBody className="p-6">
              <div className="w-11 h-11 flex items-center justify-center bg-[#FF4654]/10 dark:bg-[#DCFF37]/10 mb-4"
                style={{ clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)" }}>
                <Icon icon={pillar.icon} className="text-[#FF4654] dark:text-[#DCFF37]" width={22} />
              </div>
              <h4 className="font-bold text-[#34445C] dark:text-[#F5F0E1] mb-2">{pillar.title}</h4>
              <p className="text-sm text-default-500">{pillar.desc}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      <StatGrid
        stats={[
          { value: "6", label: "Providers" },
          { value: "72h", label: "Dispute Window" },
          { value: "2", label: "Chain Targets" },
        ]}
      />
    </SlideContainer>
  );
}

function Slide5Infrastructure() {
  const ecosystems = [
    {
      title: "LeetGaming Core Product",
      desc: "Matchmaking, rankings, disputes, and payouts all become more trusted when results are verified.",
      icon: "solar:gamepad-bold",
    },
    {
      title: "Prediction & Wager Rails",
      desc: "Verified outcomes can resolve prediction markets and skill-based wagering products with less manual adjudication.",
      icon: "solar:chart-square-bold",
    },
    {
      title: "Partner Infrastructure",
      desc: "External tournaments, publishers, and community operators can embed score intelligence instead of rebuilding it.",
      icon: "solar:server-square-cloud-bold",
    },
  ];

  return (
    <SlideContainer>
      <SlideBadge text="PLATFORM LEVERAGE" />
      <h2 className={title({ size: "lg", class: "text-[#34445C] dark:text-[#F5F0E1] mb-4 text-3xl lg:text-5xl" })}>
        One Score Layer. Multiple Markets.
      </h2>
      <p className="text-default-500 max-w-3xl mb-10">
        The same score infrastructure that powers our own product can become a
        reusable B2B surface for external ecosystems.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full mb-10">
        {ecosystems.map((item) => (
          <Card key={item.title} className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20 h-full text-left">
            <CardBody className="p-6">
              <Icon icon={item.icon} className="text-[#FF4654] dark:text-[#DCFF37] mb-4" width={24} />
              <h4 className="font-bold text-[#34445C] dark:text-[#F5F0E1] mb-2">{item.title}</h4>
              <p className="text-sm text-default-500">{item.desc}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="w-full max-w-4xl p-6 border border-[#FF4654]/20 dark:border-[#DCFF37]/20 bg-gradient-to-r from-[#34445C] to-[#1e2a38] text-left"
        style={{ clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)" }}>
        <p className="text-sm uppercase tracking-widest text-[#DCFF37] font-bold mb-2">Investor takeaway</p>
        <p className="text-lg text-[#F5F0E1] leading-relaxed">
          Scores are both a <span className="text-[#DCFF37] font-semibold">product moat</span> and a <span className="text-[#DCFF37] font-semibold">future infrastructure business</span>.
        </p>
      </div>
    </SlideContainer>
  );
}

function Slide6Market() {
  const segments = [
    { label: "Esports", value: "$1.86B", growth: "8.1%" },
    { label: "Analytics", value: "$2.1B", growth: "23.7%" },
    { label: "Prediction & Wagering", value: "$16B", growth: "15%" },
    { label: "Coaching", value: "$1.5B", growth: "12%" },
    { label: "Tournaments", value: "$450M", growth: "18%" },
  ];

  return (
    <SlideContainer>
      <SlideBadge text="MARKET OPPORTUNITY" />
      <h2 className={title({ size: "lg", class: "text-[#34445C] dark:text-[#F5F0E1] mb-2 text-3xl lg:text-5xl" })}>
        <span className="text-[#FF4654] dark:text-[#DCFF37]">$21.9B</span> Total Addressable Market
      </h2>
      <p className="text-default-500 max-w-2xl mb-10">Across five converging market segments</p>
      <div className="flex flex-wrap justify-center gap-4 max-w-4xl">
        {segments.map((seg) => (
          <Card key={seg.label} className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20 min-w-[150px]">
            <CardBody className="p-5 text-center">
              <span className="text-2xl font-bold text-[#34445C] dark:text-[#F5F0E1]">{seg.value}</span>
              <p className="text-xs text-default-500 mt-1">{seg.label}</p>
              <Chip size="sm" variant="flat" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mt-2">
                {seg.growth} CAGR
              </Chip>
            </CardBody>
          </Card>
        ))}
      </div>
    </SlideContainer>
  );
}

function Slide7BusinessModel() {
  return (
    <SlideContainer>
      <SlideBadge text="REVENUE" />
      <BrandIcon icon="solar:hand-money-bold" />
      <h2 className={title({ size: "lg", class: "text-[#34445C] dark:text-[#F5F0E1] mb-4 text-3xl lg:text-5xl" })}>
        Four Revenue Streams
      </h2>

      {/* Revenue split bar */}
      <div
        className="w-full max-w-3xl h-10 flex overflow-hidden mb-8"
        style={{ clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)" }}
      >
        {[
          { label: "Subs 40%", flex: 40, bg: "#FF4654" },
          { label: "Tx / Escrow 30%", flex: 30, bg: "#34445C" },
          { label: "Value-Add 20%", flex: 20, bg: "#FFC700" },
          { label: "Ads 10%", flex: 10, bg: "#e5e7eb" },
        ].map((seg) => (
          <div key={seg.label} className="flex items-center justify-center" style={{ flex: seg.flex, backgroundColor: seg.bg }}>
            <span className="text-xs font-bold text-white mix-blend-difference">{seg.label}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl w-full text-left">
        {[
          { title: "Subscriptions", desc: "Free / Pro $9.99 / Team $29.99 — analytics, matchmaking, team management", icon: "solar:crown-bold" },
          { title: "Wager Rake (5–10%)", desc: "Platform fee on skill-based wager matches with verified scores and transparent escrow", icon: "solar:hand-money-bold" },
          { title: "Tournament Fees", desc: "Hosting fees & entry commissions with automated bracket management", icon: "solar:cup-star-bold" },
          { title: "Coaching Marketplace", desc: "Commission connecting players with verified pro coaches", icon: "solar:square-academic-cap-bold" },
        ].map((stream) => (
          <Card key={stream.title} className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
            <CardBody className="p-5 flex flex-row items-start gap-3">
              <Icon icon={stream.icon} className="text-[#FF4654] dark:text-[#DCFF37] mt-0.5" width={20} />
              <div>
                <h4 className="font-bold text-[#34445C] dark:text-[#F5F0E1] text-sm mb-1">{stream.title}</h4>
                <p className="text-xs text-default-500">{stream.desc}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="mt-8 max-w-4xl w-full p-5 border border-[#FF4654]/20 dark:border-[#DCFF37]/20 bg-[#FF4654]/5 dark:bg-[#DCFF37]/5 text-left"
        style={{ clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)" }}>
        <p className="text-xs uppercase tracking-widest text-[#FF4654] dark:text-[#DCFF37] font-bold mb-2">Expansion line</p>
        <p className="text-sm text-[#34445C] dark:text-[#F5F0E1]">
          Verified score intelligence also creates a future infrastructure surface for partner tournaments, prediction products, and external competition ecosystems.
        </p>
      </div>
    </SlideContainer>
  );
}

function Slide8Competitive() {
  const features = ["Replay Analysis", "Skill Matchmaking", "Verified Scores", "Prize Distribution", "Multi-Game", "Partner APIs"];
  const competitors: Record<string, boolean[]> = {
    "LeetGaming.PRO": [true, true, true, true, true, true],
    FACEIT: [false, true, false, true, true, false],
    Leetify: [true, false, false, false, false, false],
    ESEA: [false, true, false, true, false, false],
  };

  return (
    <SlideContainer>
      <SlideBadge text="COMPETITIVE EDGE" />
      <h2 className={title({ size: "lg", class: "text-[#34445C] dark:text-[#F5F0E1] mb-4 text-3xl lg:text-5xl" })}>
        Only Full-Stack + Verified Score Solution
      </h2>
      <p className="text-default-500 max-w-3xl mb-8">
        Competitors can own pieces of the workflow. None combine analytics,
        competition, monetization, and score verification into a single system.
      </p>
      <div className="w-full max-w-4xl overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#34445C]">
              <th className="px-4 py-3 text-left text-sm font-bold text-[#F5F0E1]">Feature</th>
              {Object.keys(competitors).map((name) => (
                <th
                  key={name}
                  className={`px-4 py-3 text-center text-sm font-bold ${
                    name === "LeetGaming.PRO" ? "text-[#DCFF37] bg-[#FF4654]/20" : "text-[#F5F0E1]"
                  }`}
                >
                  {name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {features.map((feat, i) => (
              <tr key={feat} className={`border-b border-default-100 dark:border-default-50/10 ${i % 2 === 0 ? "bg-default-50/50 dark:bg-default-50/5" : ""}`}>
                <td className="px-4 py-2.5 text-sm text-[#34445C] dark:text-[#F5F0E1] font-medium">{feat}</td>
                {Object.entries(competitors).map(([name, vals]) => (
                  <td key={name} className={`px-4 py-2.5 text-center ${name === "LeetGaming.PRO" ? "bg-[#FF4654]/5 dark:bg-[#DCFF37]/5" : ""}`}>
                    {vals[i] ? (
                      <Icon icon="solar:check-circle-bold" className="text-emerald-500 inline" width={18} />
                    ) : (
                      <Icon icon="solar:close-circle-bold" className="text-default-300 inline" width={18} />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SlideContainer>
  );
}

function Slide9Traction() {
  return (
    <SlideContainer>
      <SlideBadge text="TRACTION" />
      <BrandIcon icon="solar:rocket-2-bold" />
      <h2 className={title({ size: "lg", class: "text-[#34445C] dark:text-[#F5F0E1] mb-4 text-3xl lg:text-5xl" })}>
        Built & Shipping
      </h2>
      <p className="text-default-500 max-w-2xl mb-10">
        Not a concept deck — a production-oriented platform with real product,
        payout, and score-verification infrastructure.
      </p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl w-full">
        {[
          { label: "Infrastructure", pct: 95 },
          { label: "Frontend", pct: 93 },
          { label: "Auth & Billing", pct: 90 },
          { label: "Backend Services", pct: 85 },
          { label: "Wallet System", pct: 85 },
          { label: "Payments", pct: 80 },
          { label: "Testing", pct: 50 },
          { label: "Blockchain", pct: 30 },
        ].map((item) => (
          <div
            key={item.label}
            className="p-4 border border-[#FF4654]/20 dark:border-[#DCFF37]/20 text-center"
            style={{ clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)" }}
          >
            <span className="text-3xl font-bold text-[#FF4654] dark:text-[#DCFF37]">{item.pct}%</span>
            <p className="text-xs text-default-500 mt-1">{item.label}</p>
          </div>
        ))}
      </div>
    </SlideContainer>
  );
}

function Slide10Financials() {
  return (
    <SlideContainer>
      <SlideBadge text="FINANCIALS" />
      <h2 className={title({ size: "lg", class: "text-[#34445C] dark:text-[#F5F0E1] mb-4 text-3xl lg:text-5xl" })}>
        Revenue Projections
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl w-full mb-8">
        {[
          { scenario: "Conservative", mrr: "$90K", color: "border-default-300" },
          { scenario: "Moderate", mrr: "$400K", color: "border-[#FF4654] dark:border-[#DCFF37] border-2" },
          { scenario: "Aggressive", mrr: "$1.8M", color: "border-default-300" },
        ].map((proj) => (
          <Card key={proj.scenario} className={`rounded-none ${proj.color}`}>
            <CardBody className="p-6 text-center">
              <p className="text-sm font-medium text-default-500 mb-2">{proj.scenario}</p>
              <span className="text-4xl font-bold text-[#FF4654] dark:text-[#DCFF37]">{proj.mrr}</span>
              <p className="text-xs text-default-400 mt-1">MRR Target</p>
            </CardBody>
          </Card>
        ))}
      </div>
      <StatGrid
        stats={[
          { value: "$5–15", label: "CAC" },
          { value: "$50–200", label: "LTV" },
          { value: "2–4 mo", label: "Payback" },
          { value: "5:1–15:1", label: "LTV:CAC" },
        ]}
      />
    </SlideContainer>
  );
}

function Slide11Roadmap() {
  const phases = [
    { label: "Phase 1", title: "Production Stabilization", period: "Q4 2025", status: "✅ Complete", items: "Infra, auth, billing, replay engine" },
    { label: "Phase 2", title: "Core Feature Completion", period: "Q1 2026", status: "🔄 In Progress", items: "Tournaments, advanced analytics, verified score surfaces" },
    { label: "Phase 3", title: "Infrastructure Expansion", period: "Q1–Q2 2026", status: "⏳ Upcoming", items: "Partner APIs, external score rails, settlement integrations" },
    { label: "Phase 4", title: "Scale & Expansion", period: "Q2–Q3 2026", status: "⏳ Upcoming", items: "Multi-region, 500K users, $2.5M monthly volume" },
  ];

  return (
    <SlideContainer>
      <SlideBadge text="ROADMAP" />
      <BrandIcon icon="solar:route-bold" />
      <h2 className={title({ size: "lg", class: "text-[#34445C] dark:text-[#F5F0E1] mb-8 text-3xl lg:text-5xl" })}>
        Path to Scale
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl w-full">
        {phases.map((phase, i) => (
          <Card
            key={phase.label}
            className={`rounded-none border ${
              i === 1
                ? "border-[#FF4654] dark:border-[#DCFF37] border-2 shadow-lg shadow-[#FF4654]/10 dark:shadow-[#DCFF37]/10"
                : "border-default-200 dark:border-default-100/10"
            }`}
          >
            <CardBody className="p-5">
              <Chip size="sm" variant="flat" className="bg-[#34445C] text-[#F5F0E1] font-bold mb-2">
                {phase.label}
              </Chip>
              <h4 className="font-bold text-[#34445C] dark:text-[#F5F0E1] text-sm mb-1">{phase.title}</h4>
              <p className="text-xs text-default-400 mb-2">{phase.period} — {phase.status}</p>
              <p className="text-xs text-default-500">{phase.items}</p>
            </CardBody>
          </Card>
        ))}
      </div>
    </SlideContainer>
  );
}

function Slide12Team() {
  return (
    <SlideContainer>
      <SlideBadge text="TEAM" />
      <BrandIcon icon="solar:users-group-rounded-bold" large />
      <h2 className={title({ size: "lg", class: "text-[#34445C] dark:text-[#F5F0E1] mb-6 text-3xl lg:text-5xl" })}>
        Leadership
      </h2>

      <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20 max-w-2xl w-full mb-8">
        <CardBody className="p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row items-center gap-6 text-left">
            <div
              className="w-20 h-20 flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]"
              style={{ clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%)" }}
            >
              <Icon icon="solar:user-bold" className="text-[#F5F0E1] dark:text-[#34445C]" width={36} />
            </div>
            <div>
              <h4 className="text-xl font-bold text-[#34445C] dark:text-[#F5F0E1]">Pedro Savelis</h4>
              <Chip size="sm" variant="flat" className="bg-[#FF4654]/10 dark:bg-[#DCFF37]/10 text-[#FF4654] dark:text-[#DCFF37] mt-1 mb-2">
                CTO & Founder
              </Chip>
              <p className="text-sm text-default-500">
                Former competitive FPS player. 15+ yrs software engineering.
                Enterprise distributed systems, blockchain, gaming infrastructure.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-3 gap-4 max-w-2xl w-full">
        {["Esports Advisor", "Technical Advisor", "Growth Advisor"].map((role) => (
          <Card key={role} className="rounded-none border-2 border-dashed border-[#FF4654]/30 dark:border-[#DCFF37]/30">
            <CardBody className="p-4 text-center">
              <Icon icon="solar:user-plus-bold" className="text-default-300 mx-auto mb-2" width={24} />
              <p className="text-xs font-bold text-default-400">{role}</p>
              <p className="text-[10px] text-default-300 mt-1">Open Position</p>
            </CardBody>
          </Card>
        ))}
      </div>

      <p className="text-sm text-default-500 mt-6">
        Growing from <strong className="text-[#34445C] dark:text-[#F5F0E1]">4 → 20+</strong> team members in 2026
      </p>
    </SlideContainer>
  );
}

function Slide13WhyNow() {
  const reasons = [
    { icon: "solar:tv-bold", text: "Esports viewership surpassing traditional sports demographics" },
    { icon: "solar:map-point-wave-bold", text: "Underserved regions (LATAM, SEA, MENA) — massive player bases, zero local platforms" },
    { icon: "solar:link-circle-bold", text: "Verified score infrastructure enables transparent payout, prediction, and partner integrations" },
    { icon: "solar:bolt-circle-bold", text: "No platform integrates analytics + competition + verified scoring + earning — first mover advantage" },
  ];

  return (
    <SlideContainer gradient="bg-gradient-to-br from-[#FF4654]/5 to-[#FFC700]/5 dark:from-[#DCFF37]/5 dark:to-[#34445C]/5">
      <SlideBadge text="TIMING" />
      <BrandIcon icon="solar:bolt-circle-bold" large />
      <h2 className={title({ size: "lg", class: "text-[#34445C] dark:text-[#F5F0E1] mb-8 text-3xl lg:text-5xl" })}>
        Why <span className="text-[#FF4654] dark:text-[#DCFF37]">Now</span>?
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl w-full">
        {reasons.map((r) => (
          <div key={r.text} className="flex items-start gap-4 text-left">
            <div
              className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]"
              style={{ clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)" }}
            >
              <Icon icon={r.icon} className="text-[#F5F0E1] dark:text-[#34445C]" width={22} />
            </div>
            <p className="text-sm text-[#34445C] dark:text-[#F5F0E1] leading-relaxed pt-1">{r.text}</p>
          </div>
        ))}
      </div>
    </SlideContainer>
  );
}

function Slide14CTA() {
  return (
    <SlideContainer gradient="bg-gradient-to-br from-[#34445C] to-[#1e2a38]">
      <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-[#F5F0E1] mb-4 max-w-3xl">
        Let&apos;s Build the Future of Esports{" "}
        <span className="text-[#DCFF37]">Together</span>
      </h2>
      <p className="text-lg text-[#F5F0E1]/70 max-w-2xl mb-10">
        We&apos;re raising to accelerate platform completion, scale to 100K competitors,
        and turn verified scores into both a category-defining moat and a platform layer for the wider esports ecosystem.
      </p>
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        <EsportsButton variant="action" size="lg" as="a" href={CALENDLY_URL} startContent={<Icon icon="solar:calendar-bold" width={20} />}>
          Schedule a Meeting
        </EsportsButton>
        <EsportsButton variant="ghost" size="lg" as="a" href={`mailto:${CONTACT_EMAIL}`} startContent={<Icon icon="solar:letter-bold" width={20} />}>
          {CONTACT_EMAIL}
        </EsportsButton>
      </div>
      <div className="flex justify-center gap-6">
        {[
          { icon: "fontisto:linkedin", href: "https://linkedin.com/company/leetgaming" },
          { icon: "fontisto:twitter", href: "https://twitter.com/leetgamingpro" },
          { icon: "fontisto:discord", href: "https://discord.gg/leetgaming" },
        ].map((s) => (
          <a
            key={s.icon}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#F5F0E1]/40 hover:text-[#DCFF37] transition-colors"
          >
            <Icon icon={s.icon} width={22} />
          </a>
        ))}
      </div>
    </SlideContainer>
  );
}

const slides = [
  Slide1Cover,
  Slide2Problem,
  Slide3Solution,
  Slide4ScoresMoat,
  Slide5Infrastructure,
  Slide6Market,
  Slide7BusinessModel,
  Slide8Competitive,
  Slide9Traction,
  Slide10Financials,
  Slide11Roadmap,
  Slide12Team,
  Slide13WhyNow,
  Slide14CTA,
];

/* ──────────────────────────────────────────────────────────────────
 *  Main Pitch Deck Page
 * ────────────────────────────────────────────────────────────────── */
export default function PitchDeckPage() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPresenting, setIsPresenting] = useState(false);

  const goTo = useCallback(
    (index: number) => {
      if (index < 0 || index >= TOTAL_SLIDES) return;
      setDirection(index > current ? 1 : -1);
      setCurrent(index);
    },
    [current]
  );

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "Enter") {
        e.preventDefault();
        next();
      }
      if (e.key === "ArrowLeft" || e.key === "Backspace") {
        e.preventDefault();
        prev();
      }
      if (e.key === "f" || e.key === "F") {
        setIsPresenting((p) => !p);
      }
      if (e.key === "Escape") {
        setIsPresenting(false);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [next, prev]);

  const SlideComponent = slides[current];

  return (
    <div
      className={`flex flex-col ${
        isPresenting
          ? "fixed inset-0 z-50 bg-white dark:bg-[#0a0a0a]"
          : ""
      }`}
    >
      {/* Sub-nav (hidden in presentation mode) */}
      {!isPresenting && (
        <div className="px-4 sm:px-6 lg:px-12 xl:px-24 2xl:px-32 pt-8">
          <InvestorSubNav />
        </div>
      )}

      {/* Slide area */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={current}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <SlideComponent />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation bar */}
      <div
        className={`flex items-center justify-between px-4 sm:px-8 py-3 border-t border-default-200 dark:border-default-100/10 bg-default-50/80 dark:bg-default-50/5 backdrop-blur ${
          isPresenting ? "fixed bottom-0 left-0 right-0 z-[60]" : ""
        }`}
      >
        <div className="flex items-center gap-2">
          <EsportsButton
            variant="ghost"
            size="sm"
            onClick={prev}
            disabled={current === 0}
            startContent={<Icon icon="solar:alt-arrow-left-bold" width={16} />}
          >
            Prev
          </EsportsButton>
        </div>

        {/* Slide indicator dots */}
        <div className="flex items-center gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`w-2.5 h-2.5 transition-all ${
                i === current
                  ? "bg-[#FF4654] dark:bg-[#DCFF37] scale-125"
                  : "bg-default-200 dark:bg-default-100/20 hover:bg-default-300"
              }`}
              style={{
                clipPath:
                  "polygon(0 0, 100% 0, 100% calc(100% - 2px), calc(100% - 2px) 100%, 0 100%)",
              }}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
          <span className="ml-3 text-xs text-default-400 font-mono">
            {current + 1}/{TOTAL_SLIDES}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPresenting((p) => !p)}
            className="text-default-400 hover:text-[#FF4654] dark:hover:text-[#DCFF37] transition-colors p-1"
            title={isPresenting ? "Exit presentation (Esc)" : "Enter presentation mode (F)"}
          >
            <Icon
              icon={isPresenting ? "solar:quit-full-screen-bold" : "solar:full-screen-bold"}
              width={18}
            />
          </button>
          <EsportsButton
            variant="ghost"
            size="sm"
            onClick={next}
            disabled={current === TOTAL_SLIDES - 1}
            startContent={<Icon icon="solar:alt-arrow-right-bold" width={16} />}
          >
            Next
          </EsportsButton>
        </div>
      </div>
    </div>
  );
}

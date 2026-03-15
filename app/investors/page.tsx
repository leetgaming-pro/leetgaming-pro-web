"use client";

import React, { useState } from "react";
import { Card, CardBody, Chip } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { title, subtitle } from "@/components/primitives";
import { EsportsButton } from "@/components/ui/esports-button";
import { RoadmapTimeline } from "@/components/investors/roadmap-timeline";
import { CompetitiveMatrix } from "@/components/investors/competitive-matrix";
import { EmailCaptureModal } from "@/components/investors/email-capture-modal";
import { InvestorSubNav } from "@/components/investors/investor-sub-nav";
import { PdfDownloadButton } from "@/components/investors/pdf-download-button";
import { ProductStatus } from "@/components/investors/product-status";
import { SuccessMetrics } from "@/components/investors/success-metrics";
import { UseOfFunds } from "@/components/investors/use-of-funds";
const CALENDLY_URL = "https://calendly.com/leetgaming-pro/investor-meeting";
const CONTACT_EMAIL = "investors@leetgaming.pro";

const marketSegments = [
  {
    label: "Esports Market",
    value: "$1.86B",
    growth: "8.1% CAGR",
    icon: "solar:cup-star-bold",
  },
  {
    label: "Gaming Analytics",
    value: "$2.1B",
    growth: "23.7% CAGR",
    icon: "solar:chart-2-bold",
  },
  {
    label: "Esports Betting",
    value: "$16B",
    growth: "15% CAGR",
    icon: "solar:wallet-money-bold",
  },
  {
    label: "Gaming Coaching",
    value: "$1.5B",
    growth: "12% CAGR",
    icon: "solar:diploma-verified-bold",
  },
  {
    label: "Tournament Platforms",
    value: "$450M",
    growth: "18% CAGR",
    icon: "solar:medal-ribbons-star-bold",
  },
];

const revenueStreams = [
  {
    title: "Subscription Tiers",
    description:
      "Free, Pro ($9.99/mo), and Team ($29.99/mo) plans with advanced analytics, priority matchmaking, and team features.",
    icon: "solar:crown-bold",
  },
  {
    title: "Wager Rake (5–10%)",
    description:
      "Platform fee on skill-based wager matches with verified scores, transparent escrow, and instant payouts.",
    icon: "solar:hand-money-bold",
  },
  {
    title: "Tournament Entry Fees",
    description:
      "Hosting fees and entry commissions for organized tournaments with automated bracket management.",
    icon: "solar:cup-star-bold",
  },
  {
    title: "Coaching Marketplace",
    description:
      "Commission on coaching sessions connecting aspiring players with verified pro coaches.",
    icon: "solar:square-academic-cap-bold",
  },
];

const scoreInfrastructurePillars = [
  {
    title: "Verified Score Truth Layer",
    description:
      "Multi-source score verification protects payouts, reduces disputes, and creates trust where money and competition intersect.",
    icon: "solar:shield-check-bold",
    chips: ["6 data providers", "Consensus verified", "Dispute resistant"],
  },
  {
    title: "Core Product Engine",
    description:
      "Scores are the connective tissue between matchmaking, match results, prize distribution, rankings, and player reputation.",
    icon: "solar:graph-up-bold",
    chips: ["Matchmaking", "Leaderboards", "Payouts"],
  },
  {
    title: "External Ecosystem Rails",
    description:
      "The same infrastructure can power prediction markets, skill-based wagering products, tournaments, rewards, and partner platforms.",
    icon: "solar:widget-4-bold",
    chips: ["Prediction markets", "Partner APIs", "Rewards systems"],
  },
];

const scoreInfrastructureStats = [
  {
    value: "6",
    label: "Independent sources",
    caption: "Consensus-driven verification across external providers.",
  },
  {
    value: "72h",
    label: "Dispute window",
    caption: "Financial-grade result lifecycle before finalization.",
  },
  {
    value: "2",
    label: "Blockchain targets",
    caption: "Designed for verified settlement and portable score attestations.",
  },
];

const ecosystemExpansionCards = [
  {
    title: "Internal Moat",
    description:
      "LeetGaming wins when competitors trust that match outcomes, rankings, and prizes are objectively verified.",
    icon: "solar:cup-star-bold",
  },
  {
    title: "Infrastructure Revenue",
    description:
      "Score intelligence can become a licensable platform layer for external tournaments, prediction products, and partner apps.",
    icon: "solar:server-square-cloud-bold",
  },
  {
    title: "Regulated Expansion",
    description:
      "Use cases extend beyond our app into prediction and skill-based ecosystems without relying on opaque manual adjudication.",
    icon: "solar:scale-bold",
  },
];

const unitEconomics = [
  {
    label: "Customer Acquisition Cost",
    value: "$5–15",
    icon: "solar:magnet-bold",
  },
  { label: "Lifetime Value", value: "$50–200", icon: "solar:graph-up-bold" },
  { label: "Payback Period", value: "2–4 mo", icon: "solar:clock-circle-bold" },
  { label: "LTV : CAC Ratio", value: "5:1–15:1", icon: "solar:chart-bold" },
];

const advisorSlots = [
  {
    role: "Esports Industry Advisor",
    description:
      "Experienced esports executive to guide go-to-market strategy, partnership development, and league/tournament operator relationships.",
    icon: "solar:gamepad-bold",
    skills: ["Esports Operations", "Business Development", "Industry Network"],
  },
  {
    role: "Technical Advisor",
    description:
      "Deep expertise in distributed systems, blockchain integration, or gaming infrastructure to guide architecture decisions at scale.",
    icon: "solar:code-square-bold",
    skills: ["Distributed Systems", "Blockchain", "Gaming Infra"],
  },
  {
    role: "Growth & Investment Advisor",
    description:
      "Track record scaling consumer platforms or esports ventures. Experience with fundraising, unit economics optimization, and market expansion.",
    icon: "solar:graph-up-bold",
    skills: ["Growth Strategy", "Fundraising", "Market Expansion"],
  },
];

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function InvestorsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex w-full flex-col items-center gap-16 md:gap-20 lg:gap-24 px-4 py-8 md:py-12 lg:py-16 sm:px-6 lg:px-12 xl:px-24 2xl:px-32">
      {/* Investor Sub-Navigation */}
      <InvestorSubNav />

      {/* ============================================================ */}
      {/* SECTION A — Hero / Elevator Pitch */}
      {/* ============================================================ */}
      <motion.div
        className="flex w-full max-w-7xl flex-col items-center text-center gap-8"
        initial="hidden"
        animate="visible"
        variants={stagger}
      >
        <motion.div variants={fadeUp}>
          <div
            className="w-20 h-20 lg:w-24 lg:h-24 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C] mx-auto"
            style={{
              clipPath:
                "polygon(0 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%)",
            }}
          >
            <Icon
              icon="solar:chart-2-bold"
              width={44}
              className="text-[#F5F0E1] dark:text-[#34445C] lg:w-14 lg:h-14"
            />
          </div>
        </motion.div>

        <motion.div variants={fadeUp}>
          <h2 className="text-[#FF4654] dark:text-[#DCFF37] font-medium text-lg lg:text-xl tracking-wide uppercase">
            For Investors
          </h2>
        </motion.div>

        <motion.div variants={fadeUp}>
          <h1
            className={title({
              size: "lg",
              class:
                "text-[#34445C] dark:text-[#F5F0E1] text-4xl md:text-5xl lg:text-6xl xl:text-7xl",
            })}
          >
            The All-in-One Esports{" "}
            <span
              className={title({
                size: "lg",
                color: "battleOrange",
                class:
                  "text-4xl md:text-5xl lg:text-6xl xl:text-7xl dark:bg-gradient-to-r dark:from-[#DCFF37] dark:to-[#b8d930]",
              })}
            >
              Competition Platform
            </span>
          </h1>
        </motion.div>

        <motion.div variants={fadeUp}>
          <p
            className={subtitle({
              class:
                "mt-2 max-w-4xl text-lg lg:text-xl xl:text-2xl leading-relaxed mx-auto text-center",
            })}
          >
            Compete &middot; Analyze &middot; Earn &mdash; a full-stack platform
            combining replay analysis, skill-based matchmaking, tournaments,
            verified scores, and transparent prize distribution for{" "}
            <strong className="text-[#34445C] dark:text-[#F5F0E1]">
              63M+ competitive FPS players
            </strong>
            .
          </p>
        </motion.div>

        {/* Hero metrics */}
        <motion.div
          variants={fadeUp}
          className="flex flex-wrap justify-center gap-4 lg:gap-6"
        >
          {[
            { label: "Total Addressable Market", value: "$21.9B" },
            { label: "Addressable Players", value: "63M+" },
            { label: "LTV : CAC", value: "5:1–15:1" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center px-6 py-4 border border-[#FF4654]/20 dark:border-[#DCFF37]/20 bg-[#FF4654]/5 dark:bg-[#DCFF37]/5"
              style={{
                clipPath:
                  "polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)",
              }}
            >
              <span className="text-2xl lg:text-3xl font-bold text-[#FF4654] dark:text-[#DCFF37]">
                {stat.value}
              </span>
              <span className="text-xs text-default-500 uppercase tracking-wider mt-1">
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Hero CTAs */}
        <motion.div
          variants={fadeUp}
          className="flex flex-wrap justify-center gap-4"
        >
          <PdfDownloadButton
            variant="primary"
            size="lg"
            onBeforeDownload={() => {
              setIsModalOpen(true);
              return false; // Modal handles the download
            }}
          />
          <EsportsButton
            variant="ghost"
            size="lg"
            as="a"
            href={CALENDLY_URL}
            startContent={<Icon icon="solar:calendar-bold" width={20} />}
          >
            Schedule a Meeting
          </EsportsButton>
        </motion.div>
      </motion.div>

      {/* ============================================================ */}
      {/* SECTION B — Market Opportunity */}
      {/* ============================================================ */}
      <div className="w-full max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 lg:mb-14"
        >
          <h2 className="text-[#FF4654] dark:text-[#DCFF37] font-medium text-base tracking-wide uppercase mb-3">
            Opportunity
          </h2>
          <h3 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-[#34445C] dark:text-[#F5F0E1]">
            Market Opportunity
          </h3>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
          {marketSegments.map((segment, i) => (
            <motion.div
              key={segment.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20 hover:shadow-xl hover:shadow-[#FF4654]/10 dark:hover:shadow-[#DCFF37]/10 transition-all duration-300 hover:-translate-y-1 h-full">
                <CardBody className="p-4 lg:p-6 text-center flex flex-col items-center gap-3">
                  <div
                    className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]"
                    style={{
                      clipPath:
                        "polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)",
                    }}
                  >
                    <Icon
                      icon={segment.icon}
                      className="text-[#F5F0E1] dark:text-[#34445C]"
                      width={24}
                    />
                  </div>
                  <div className="text-2xl lg:text-3xl font-bold text-[#34445C] dark:text-[#F5F0E1]">
                    {segment.value}
                  </div>
                  <div className="text-xs text-default-500 font-medium">
                    {segment.label}
                  </div>
                  <Chip
                    size="sm"
                    variant="flat"
                    className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  >
                    {segment.growth}
                  </Chip>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Why Now card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-8 lg:mt-12"
        >
          <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20 bg-gradient-to-br from-[#FF4654]/5 to-[#FFC700]/5 dark:from-[#DCFF37]/5 dark:to-[#34445C]/5">
            <CardBody className="p-6 lg:p-10">
              <div className="flex flex-col lg:flex-row items-start gap-6">
                <div
                  className="w-14 h-14 flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]"
                  style={{
                    clipPath:
                      "polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)",
                  }}
                >
                  <Icon
                    icon="solar:bolt-circle-bold"
                    className="text-[#F5F0E1] dark:text-[#34445C]"
                    width={28}
                  />
                </div>
                <div>
                  <h4 className="text-xl lg:text-2xl font-bold text-[#34445C] dark:text-[#F5F0E1] mb-3">
                    Why Now?
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      "Esports mainstreaming — viewership surpassing traditional sports demographics",
                      "Underserved regions (LATAM, SEA, MENA) with massive player bases and zero local platforms",
                      "Blockchain maturity enabling transparent, verifiable prize distribution at scale",
                      "No single platform integrates analytics + competition + earning — we are the first full-stack solution",
                    ].map((reason, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Icon
                          icon="solar:arrow-right-bold"
                          className="text-[#FF4654] dark:text-[#DCFF37] mt-0.5 flex-shrink-0"
                          width={16}
                        />
                        <span className="text-sm text-default-600">
                          {reason}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>

      {/* ============================================================ */}
      {/* SECTION C — Competitive Advantage */}
      {/* ============================================================ */}
      <div className="w-full max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 lg:mb-14"
        >
          <h2 className="text-[#FF4654] dark:text-[#DCFF37] font-medium text-base tracking-wide uppercase mb-3">
            Competitive Edge
          </h2>
          <h3 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-[#34445C] dark:text-[#F5F0E1]">
            What Sets Us Apart
          </h3>
          <p className="mt-3 text-default-500 max-w-2xl mx-auto">
            The only platform integrating deep analytics, competitive play,
            verified score infrastructure, and real-money earning in a single
            ecosystem.
          </p>
        </motion.div>

        <CompetitiveMatrix />
      </div>

      {/* ============================================================ */}
      {/* SECTION C2 — Scores Infrastructure / Trust Layer */}
      {/* ============================================================ */}
      <div className="w-full max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 lg:mb-14"
        >
          <h2 className="text-[#FF4654] dark:text-[#DCFF37] font-medium text-base tracking-wide uppercase mb-3">
            Core Moat
          </h2>
          <h3 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-[#34445C] dark:text-[#F5F0E1]">
            Verified Scores Power the Entire Ecosystem
          </h3>
          <p className="mt-3 text-default-500 max-w-4xl mx-auto leading-relaxed">
            Scores are not a cosmetic feature. They are the trust layer that
            connects matchmaking, result verification, dispute handling, prize
            distribution, rankings, and future external ecosystems such as
            prediction markets and skill-based wagering infrastructure.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_0.95fr] gap-6 lg:gap-8 items-stretch">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20 bg-gradient-to-br from-[#FF4654]/5 via-transparent to-[#FFC700]/5 dark:from-[#DCFF37]/5 dark:to-[#34445C]/5 h-full">
              <CardBody className="p-6 lg:p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div
                    className="w-14 h-14 flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]"
                    style={{
                      clipPath:
                        "polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)",
                    }}
                  >
                    <Icon
                      icon="solar:shield-check-bold"
                      className="text-[#F5F0E1] dark:text-[#34445C]"
                      width={28}
                    />
                  </div>
                  <div>
                    <h4 className="text-xl lg:text-2xl font-bold text-[#34445C] dark:text-[#F5F0E1] mb-2">
                      From match result to monetizable infrastructure
                    </h4>
                    <p className="text-sm lg:text-base text-default-600 leading-relaxed">
                      Our score system already maps to the most sensitive part
                      of the platform: verified outcomes that can unlock payouts,
                      settle disputes, support rewards, and expose trustworthy
                      data rails to third-party ecosystems.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {scoreInfrastructurePillars.map((pillar, i) => (
                    <motion.div
                      key={pillar.title}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08, duration: 0.4 }}
                      className="p-4 border border-[#FF4654]/15 dark:border-[#DCFF37]/15 bg-[#F5F0E1]/70 dark:bg-[#34445C]/10"
                      style={{
                        clipPath:
                          "polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)",
                      }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Icon
                          icon={pillar.icon}
                          className="text-[#FF4654] dark:text-[#DCFF37]"
                          width={20}
                        />
                        <h5 className="font-bold text-[#34445C] dark:text-[#F5F0E1] text-sm lg:text-base">
                          {pillar.title}
                        </h5>
                      </div>
                      <p className="text-sm text-default-600 leading-relaxed mb-3">
                        {pillar.description}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {pillar.chips.map((chip) => (
                          <Chip
                            key={chip}
                            size="sm"
                            variant="flat"
                            className="bg-[#FF4654]/10 dark:bg-[#DCFF37]/10 text-[#FF4654] dark:text-[#DCFF37]"
                          >
                            {chip}
                          </Chip>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="grid grid-cols-1 gap-4"
          >
            {scoreInfrastructureStats.map((stat) => (
              <div
                key={stat.label}
                className="p-5 lg:p-6 border border-[#FF4654]/20 dark:border-[#DCFF37]/20 bg-default-50/60 dark:bg-default-50/5"
                style={{
                  clipPath:
                    "polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)",
                }}
              >
                <div className="text-3xl lg:text-4xl font-bold text-[#FF4654] dark:text-[#DCFF37]">
                  {stat.value}
                </div>
                <div className="text-sm font-semibold uppercase tracking-wider text-[#34445C] dark:text-[#F5F0E1] mt-1">
                  {stat.label}
                </div>
                <p className="text-sm text-default-500 mt-2 leading-relaxed">
                  {stat.caption}
                </p>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mt-6 lg:mt-8">
          {ecosystemExpansionCards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.45 }}
            >
              <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20 h-full">
                <CardBody className="p-5 lg:p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 flex items-center justify-center bg-[#FF4654]/10 dark:bg-[#DCFF37]/10"
                      style={{
                        clipPath:
                          "polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)",
                      }}
                    >
                      <Icon
                        icon={card.icon}
                        className="text-[#FF4654] dark:text-[#DCFF37]"
                        width={20}
                      />
                    </div>
                    <h4 className="font-bold text-[#34445C] dark:text-[#F5F0E1]">
                      {card.title}
                    </h4>
                  </div>
                  <p className="text-sm text-default-600 leading-relaxed">
                    {card.description}
                  </p>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="mt-6 lg:mt-8"
        >
          <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20 bg-[#34445C] dark:bg-[#1e2a38] overflow-hidden">
            <CardBody className="p-6 lg:p-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
              <div className="max-w-3xl">
                <h4 className="text-xl lg:text-2xl font-bold text-[#F5F0E1] mb-2">
                  This is where platform trust becomes platform leverage.
                </h4>
                <p className="text-[#F5F0E1]/70 leading-relaxed text-sm lg:text-base">
                  Investors should view scores as our trust engine and our future
                  infrastructure surface: valuable inside LeetGaming and reusable
                  outside it.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <EsportsButton
                  variant="action"
                  size="md"
                  as="a"
                  href="/docs/leetscores"
                  startContent={<Icon icon="solar:code-bold" width={18} />}
                >
                  Explore LeetScores
                </EsportsButton>
                <EsportsButton
                  variant="ghost"
                  size="md"
                  as="a"
                  href="/investors/deck"
                  startContent={<Icon icon="solar:presentation-graph-bold" width={18} />}
                >
                  View investor deck
                </EsportsButton>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>

      {/* ============================================================ */}
      {/* SECTION D — Business Model & Key Metrics */}
      {/* ============================================================ */}
      <div className="w-full max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 lg:mb-14"
        >
          <h2 className="text-[#FF4654] dark:text-[#DCFF37] font-medium text-base tracking-wide uppercase mb-3">
            Revenue
          </h2>
          <h3 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-[#34445C] dark:text-[#F5F0E1]">
            Business Model
          </h3>
        </motion.div>

        {/* Revenue Streams */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {revenueStreams.map((stream, i) => (
            <motion.div
              key={stream.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20 hover:shadow-xl hover:shadow-[#FF4654]/10 dark:hover:shadow-[#DCFF37]/10 transition-all duration-300 hover:-translate-y-1 h-full">
                <CardBody className="p-6 lg:p-8">
                  <div
                    className="w-12 h-12 mb-4 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]"
                    style={{
                      clipPath:
                        "polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)",
                    }}
                  >
                    <Icon
                      icon={stream.icon}
                      className="text-[#F5F0E1] dark:text-[#34445C]"
                      width={24}
                    />
                  </div>
                  <h4 className="text-lg font-bold text-[#34445C] dark:text-[#F5F0E1] mb-2">
                    {stream.title}
                  </h4>
                  <p className="text-sm text-default-600 leading-relaxed">
                    {stream.description}
                  </p>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Unit Economics */}
        <div className="mt-10 lg:mt-14">
          <h4 className="text-xl lg:text-2xl font-bold text-[#34445C] dark:text-[#F5F0E1] mb-6 text-center">
            Unit Economics
          </h4>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {unitEconomics.map((metric, i) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="flex flex-col items-center text-center p-5 lg:p-6 border border-[#FF4654]/20 dark:border-[#DCFF37]/20 bg-[#FF4654]/5 dark:bg-[#DCFF37]/5"
                style={{
                  clipPath:
                    "polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)",
                }}
              >
                <Icon
                  icon={metric.icon}
                  className="text-[#FF4654] dark:text-[#DCFF37] mb-2"
                  width={24}
                />
                <div className="text-2xl lg:text-3xl font-bold text-[#FF4654] dark:text-[#DCFF37]">
                  {metric.value}
                </div>
                <div className="text-xs text-default-500 mt-1 uppercase tracking-wider">
                  {metric.label}
                </div>
              </motion.div>
            ))}
          </div>
          <div className="mt-6 lg:mt-8 p-5 lg:p-6 border border-[#FF4654]/20 dark:border-[#DCFF37]/20 bg-gradient-to-r from-[#FF4654]/5 to-[#FFC700]/5 dark:from-[#DCFF37]/5 dark:to-[#34445C]/5">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:justify-between">
              <div className="max-w-3xl">
                <h5 className="text-lg font-bold text-[#34445C] dark:text-[#F5F0E1] mb-1">
                  Expansion revenue unlocked by verified scores
                </h5>
                <p className="text-sm text-default-600 leading-relaxed">
                  Beyond direct consumer monetization, the score layer creates a
                  future enterprise surface for partner tournaments, prediction
                  products, and external competition ecosystems.
                </p>
              </div>
              <Chip
                size="lg"
                variant="flat"
                className="bg-[#34445C] text-[#F5F0E1] dark:bg-[#DCFF37] dark:text-[#34445C] font-semibold px-3"
              >
                Future API / infra upside
              </Chip>
            </div>
          </div>
          <p className="text-xs text-default-400 text-center mt-4 italic">
            Detailed financial projections available in our one-pager.
          </p>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SECTION D2 — Use of Funds */}
      {/* ============================================================ */}
      <div className="w-full max-w-7xl">
        <UseOfFunds />
      </div>

      {/* ============================================================ */}
      {/* SECTION D3 — Product Status */}
      {/* ============================================================ */}
      <div className="w-full max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 lg:mb-14"
        >
          <h2 className="text-[#FF4654] dark:text-[#DCFF37] font-medium text-base tracking-wide uppercase mb-3">
            Progress
          </h2>
          <h3 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-[#34445C] dark:text-[#F5F0E1]">
            Product Status
          </h3>
          <p className="mt-3 text-default-500 max-w-2xl mx-auto">
            Live development progress across all platform systems — updated in
            real-time.
          </p>
        </motion.div>
        <ProductStatus />
      </div>

      {/* ============================================================ */}
      {/* SECTION E — Roadmap / Milestones */}
      {/* ============================================================ */}
      <div className="w-full max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 lg:mb-14"
        >
          <h2 className="text-[#FF4654] dark:text-[#DCFF37] font-medium text-base tracking-wide uppercase mb-3">
            Milestones
          </h2>
          <h3 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-[#34445C] dark:text-[#F5F0E1]">
            Product Roadmap
          </h3>
          <p className="mt-3 text-default-500 max-w-2xl mx-auto">
            From production-ready infrastructure to 500K users and $2.5M monthly
            transaction volume.
          </p>
        </motion.div>

        <RoadmapTimeline />
      </div>

      {/* ============================================================ */}
      {/* SECTION E2 — Success Metrics */}
      {/* ============================================================ */}
      <div className="w-full max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 lg:mb-14"
        >
          <h2 className="text-[#FF4654] dark:text-[#DCFF37] font-medium text-base tracking-wide uppercase mb-3">
            KPIs
          </h2>
          <h3 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-[#34445C] dark:text-[#F5F0E1]">
            Success Metrics
          </h3>
          <p className="mt-3 text-default-500 max-w-2xl mx-auto">
            Key performance indicators and targets for the first 12 months.
          </p>
        </motion.div>
        <SuccessMetrics />
      </div>

      {/* ============================================================ */}
      {/* SECTION F — Team & Advisors */}
      {/* ============================================================ */}
      <div className="w-full max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 lg:mb-14"
        >
          <h2 className="text-[#FF4654] dark:text-[#DCFF37] font-medium text-base tracking-wide uppercase mb-3">
            Leadership
          </h2>
          <h3 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-[#34445C] dark:text-[#F5F0E1]">
            Team
          </h3>
        </motion.div>

        {/* Founder card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20 mb-8 lg:mb-12">
            <CardBody className="p-6 lg:p-10">
              <div className="flex flex-col md:flex-row items-center gap-6 lg:gap-10">
                {/* Avatar container */}
                <div
                  className="w-28 h-28 lg:w-36 lg:h-36 flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]"
                  style={{
                    clipPath:
                      "polygon(0 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%)",
                  }}
                >
                  <Icon
                    icon="solar:user-bold"
                    className="text-[#F5F0E1] dark:text-[#34445C]"
                    width={56}
                  />
                </div>

                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                    <h4 className="text-2xl lg:text-3xl font-bold text-[#34445C] dark:text-[#F5F0E1]">
                      Pedro Savelis
                    </h4>
                    <Chip
                      size="sm"
                      variant="flat"
                      className="bg-[#FF4654]/10 dark:bg-[#DCFF37]/10 text-[#FF4654] dark:text-[#DCFF37] w-fit mx-auto md:mx-0"
                    >
                      CTO & Founder
                    </Chip>
                  </div>
                  <p className="text-default-600 leading-relaxed mb-4 max-w-2xl">
                    Former competitive FPS player with 15+ years of software
                    engineering experience. Built enterprise-scale distributed
                    systems and combines deep technical expertise with hands-on
                    understanding of the competitive gaming ecosystem.
                    Passionate about democratizing access to professional-grade
                    esports tools.
                  </p>
                  <div className="flex flex-wrap justify-center md:justify-start gap-2">
                    <Chip
                      size="sm"
                      variant="bordered"
                      className="border-default-300 text-default-500"
                    >
                      Full-Stack Engineering
                    </Chip>
                    <Chip
                      size="sm"
                      variant="bordered"
                      className="border-default-300 text-default-500"
                    >
                      Distributed Systems
                    </Chip>
                    <Chip
                      size="sm"
                      variant="bordered"
                      className="border-default-300 text-default-500"
                    >
                      Blockchain
                    </Chip>
                    <Chip
                      size="sm"
                      variant="bordered"
                      className="border-default-300 text-default-500"
                    >
                      Competitive Gaming
                    </Chip>
                  </div>
                  <div className="flex justify-center md:justify-start gap-3 mt-4">
                    <a
                      href="https://linkedin.com/in/psavelis"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-default-400 hover:text-[#FF4654] dark:hover:text-[#DCFF37] transition-colors"
                      aria-label="LinkedIn"
                    >
                      <Icon icon="fontisto:linkedin" width={20} />
                    </a>
                    <a
                      href="https://github.com/psavelis"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-default-400 hover:text-[#FF4654] dark:hover:text-[#DCFF37] transition-colors"
                      aria-label="GitHub"
                    >
                      <Icon icon="fontisto:github" width={20} />
                    </a>
                    <a
                      href="https://twitter.com/leetgamingpro"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-default-400 hover:text-[#FF4654] dark:hover:text-[#DCFF37] transition-colors"
                      aria-label="Twitter"
                    >
                      <Icon icon="fontisto:twitter" width={20} />
                    </a>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Open Advisor Slots */}
        <div className="mb-8">
          <h4 className="text-xl lg:text-2xl font-bold text-[#34445C] dark:text-[#F5F0E1] mb-6 text-center">
            Open Advisor Positions
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {advisorSlots.map((slot, i) => (
              <motion.div
                key={slot.role}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
              >
                <Card className="rounded-none border-2 border-dashed border-[#FF4654]/30 dark:border-[#DCFF37]/30 hover:border-[#FF4654]/60 dark:hover:border-[#DCFF37]/60 hover:shadow-xl hover:shadow-[#FF4654]/10 dark:hover:shadow-[#DCFF37]/10 transition-all duration-300 h-full">
                  <CardBody className="p-6 lg:p-8 flex flex-col">
                    <div
                      className="w-12 h-12 mb-4 flex items-center justify-center bg-[#FF4654]/10 dark:bg-[#DCFF37]/10"
                      style={{
                        clipPath:
                          "polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)",
                      }}
                    >
                      <Icon
                        icon={slot.icon}
                        className="text-[#FF4654] dark:text-[#DCFF37]"
                        width={24}
                      />
                    </div>
                    <h5 className="text-lg font-bold text-[#34445C] dark:text-[#F5F0E1] mb-2">
                      {slot.role}
                    </h5>
                    <p className="text-sm text-default-600 leading-relaxed mb-4 flex-1">
                      {slot.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {slot.skills.map((skill) => (
                        <Chip
                          key={skill}
                          size="sm"
                          variant="flat"
                          className="bg-[#FF4654]/10 dark:bg-[#DCFF37]/10 text-[#FF4654] dark:text-[#DCFF37] text-xs"
                        >
                          {skill}
                        </Chip>
                      ))}
                    </div>
                    <EsportsButton
                      variant="ghost"
                      size="sm"
                      fullWidth
                      as="a"
                      href={`mailto:${CONTACT_EMAIL}?subject=Advisor Interest: ${slot.role}`}
                      startContent={<Icon icon="solar:link-bold" width={16} />}
                    >
                      Connect
                    </EsportsButton>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Team Growth */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center p-6 border border-default-200 dark:border-default-100/10 bg-default-50/50 dark:bg-default-50/5"
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <Icon
              icon="solar:users-group-rounded-bold"
              className="text-[#FF4654] dark:text-[#DCFF37]"
              width={24}
            />
            <span className="text-lg font-bold text-[#34445C] dark:text-[#F5F0E1]">
              Growing from 4 → 20+ team members in 2026
            </span>
          </div>
          <p className="text-sm text-default-500">
            Key open roles: Frontend Engineers, Backend Engineers (Go),
            DevOps/SRE, Community Managers
          </p>
        </motion.div>
      </div>

      {/* ============================================================ */}
      {/* SECTION G — CTA / Contact Footer */}
      {/* ============================================================ */}
      <div className="w-full -mx-4 sm:-mx-6 lg:-mx-12 xl:-mx-24 2xl:-mx-32 px-4 sm:px-6 lg:px-12 xl:px-24 2xl:px-32">
        <Card className="rounded-none overflow-hidden bg-gradient-to-br from-[#34445C] to-[#1e2a38] border-t-2 border-[#FF4654] dark:border-[#DCFF37]">
          <CardBody className="p-8 lg:p-12 xl:p-16 relative">
            {/* Background pattern overlay */}
            <div className="absolute inset-0 opacity-5">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,0.05) 35px, rgba(255,255,255,0.05) 36px)`,
                }}
              />
            </div>

            <div className="relative z-10">
              <div className="text-center mb-10 lg:mb-14">
                <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-[#F5F0E1] mb-4">
                  Let&apos;s Build the Future of Esports{" "}
                  <span className="text-[#DCFF37]">Together</span>
                </h2>
                <p className="text-[#F5F0E1]/70 text-lg max-w-2xl mx-auto">
                  Whether you&#39;re an investor, advisor, or potential partner
                  — we&apos;d love to connect and share our vision.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-4xl mx-auto">
                {/* Download One-Pager */}
                <div className="flex flex-col items-center text-center gap-4 p-6">
                  <div
                    className="w-14 h-14 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700]"
                    style={{
                      clipPath:
                        "polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)",
                    }}
                  >
                    <Icon
                      icon="solar:document-bold"
                      className="text-white"
                      width={28}
                    />
                  </div>
                  <h4 className="text-lg font-bold text-[#F5F0E1]">
                    Download One-Pager
                  </h4>
                  <p className="text-sm text-[#F5F0E1]/60">
                    Investment overview with financials, market analysis, and
                    detailed projections.
                  </p>
                  <PdfDownloadButton
                    variant="primary"
                    size="md"
                    fullWidth
                    label="Get One-Pager"
                    onBeforeDownload={() => {
                      setIsModalOpen(true);
                      return false;
                    }}
                  />
                </div>

                {/* Schedule a Meeting */}
                <div className="flex flex-col items-center text-center gap-4 p-6">
                  <div
                    className="w-14 h-14 flex items-center justify-center bg-gradient-to-br from-[#DCFF37] to-[#b8d930]"
                    style={{
                      clipPath:
                        "polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)",
                    }}
                  >
                    <Icon
                      icon="solar:calendar-bold"
                      className="text-[#34445C]"
                      width={28}
                    />
                  </div>
                  <h4 className="text-lg font-bold text-[#F5F0E1]">
                    Schedule a Meeting
                  </h4>
                  <p className="text-sm text-[#F5F0E1]/60">
                    Book a 30-minute call to discuss the opportunity and answer
                    any questions.
                  </p>
                  <EsportsButton
                    variant="action"
                    size="md"
                    fullWidth
                    as="a"
                    href={CALENDLY_URL}
                    startContent={
                      <Icon icon="solar:calendar-bold" width={18} />
                    }
                  >
                    Book a Call
                  </EsportsButton>
                </div>

                {/* Email Us */}
                <div className="flex flex-col items-center text-center gap-4 p-6">
                  <div
                    className="w-14 h-14 flex items-center justify-center border-2 border-[#F5F0E1]/20"
                    style={{
                      clipPath:
                        "polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)",
                    }}
                  >
                    <Icon
                      icon="solar:letter-bold"
                      className="text-[#F5F0E1]"
                      width={28}
                    />
                  </div>
                  <h4 className="text-lg font-bold text-[#F5F0E1]">Email Us</h4>
                  <p className="text-sm text-[#F5F0E1]/60">
                    Reach out directly — we respond to all investor inquiries
                    within 24 hours.
                  </p>
                  <EsportsButton
                    variant="ghost"
                    size="md"
                    fullWidth
                    as="a"
                    href={`mailto:${CONTACT_EMAIL}`}
                    startContent={<Icon icon="solar:letter-bold" width={18} />}
                  >
                    {CONTACT_EMAIL}
                  </EsportsButton>
                </div>
              </div>

              {/* Social links */}
              <div className="flex justify-center gap-4 mt-10 pt-8 border-t border-[#F5F0E1]/10">
                {[
                  {
                    icon: "fontisto:linkedin",
                    href: "https://linkedin.com/company/leetgaming",
                    label: "LinkedIn",
                  },
                  {
                    icon: "fontisto:twitter",
                    href: "https://twitter.com/leetgamingpro",
                    label: "Twitter",
                  },
                  {
                    icon: "fontisto:discord",
                    href: "https://discord.gg/leetgaming",
                    label: "Discord",
                  },
                  {
                    icon: "fontisto:youtube-play",
                    href: "https://youtube.com/@leetgamingpro",
                    label: "YouTube",
                  },
                ].map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#F5F0E1]/40 hover:text-[#DCFF37] transition-colors"
                    aria-label={social.label}
                  >
                    <Icon icon={social.icon} width={22} />
                  </a>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Email Capture Modal */}
      <EmailCaptureModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        source="investor-overview-one-pager"
      />
    </div>
  );
}

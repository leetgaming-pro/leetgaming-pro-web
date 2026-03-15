"use client";

import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Divider,
  Chip,
  Code,
  Snippet,
  Tabs,
  Tab,
  Button,
  Link,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { title, subtitle } from "@/components/primitives";
import { ScoreDisplay, KDADisplay, RatingDisplay } from "@/components/ui/stat-displays";
import { MatchScoreboard } from "@/components/match/MatchScoreboard";
import { PremiumHighlights } from "@/components/matches";
import {
  mockTeam1Scoreboard,
  mockTeam2Scoreboard,
  mockHighlights,
} from "./mock-data";

// ============================================================================
// LeetScores Product + Documentation Page
// ============================================================================

/** Grid overlay for branded sections */
const gridOverlayStyle = (isDark = false) => ({
  backgroundImage: `linear-gradient(rgba(${isDark ? "220,255,55" : "245,240,225"}, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(${isDark ? "220,255,55" : "245,240,225"}, 0.08) 1px, transparent 1px)`,
  backgroundSize: "60px 60px",
});

/** Angular clip-path used throughout the design system */
const clipPathStyle = (cutSize = 14) => ({
  clipPath: `polygon(0 0, 100% 0, 100% calc(100% - ${cutSize}px), calc(100% - ${cutSize}px) 100%, 0 100%)`,
});

/** Card className standard */
const cardClass =
  "rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20";

/** Section header component */
function SectionHeader({
  icon,
  label,
  heading,
  description,
}: {
  icon: string;
  label: string;
  heading: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center text-center gap-4 mb-8">
      <div
        className="w-14 h-14 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]"
        style={clipPathStyle(10)}
      >
        <Icon icon={icon} width={28} className="text-[#F5F0E1] dark:text-[#34445C]" />
      </div>
      <p className="text-[#FF4654] dark:text-[#DCFF37] font-medium text-sm tracking-widest uppercase">
        {label}
      </p>
      <h2 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-[#34445C] dark:text-[#F5F0E1]">
        {heading}
      </h2>
      {description && (
        <p className="text-default-600 max-w-2xl text-base lg:text-lg">
          {description}
        </p>
      )}
    </div>
  );
}

/** Feature card */
function FeatureCard({
  icon,
  iconLabel,
  heading,
  description,
  chips,
}: {
  icon: string;
  iconLabel?: string;
  heading: string;
  description: string;
  chips?: string[];
}) {
  return (
    <Card
      className={`${cardClass} hover:shadow-xl hover:shadow-[#FF4654]/10 dark:hover:shadow-[#DCFF37]/10 transition-all duration-300 hover:-translate-y-1`}
    >
      <CardBody className="p-6 lg:p-8 text-center">
        <div
          className="w-14 h-14 mx-auto mb-4 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]"
          style={clipPathStyle(10)}
        >
          <Icon icon={icon} width={28} className="text-[#F5F0E1] dark:text-[#34445C]" />
        </div>
        {iconLabel && (
          <Chip size="sm" variant="flat" color="warning" className="mb-2">
            {iconLabel}
          </Chip>
        )}
        <h3 className="text-lg lg:text-xl font-semibold mb-3 text-[#34445C] dark:text-[#F5F0E1]">
          {heading}
        </h3>
        <p className="text-sm lg:text-base text-default-600 leading-relaxed mb-3">
          {description}
        </p>
        {chips && (
          <div className="flex flex-wrap gap-1 justify-center mt-2">
            {chips.map((c) => (
              <Chip key={c} size="sm" variant="flat" className="text-xs">
                {c}
              </Chip>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}

/** Demo wrapper with optional code toggle */
function DemoSection({
  label,
  children,
  codeSnippet,
}: {
  label: string;
  children: React.ReactNode;
  codeSnippet?: string;
}) {
  const [showCode, setShowCode] = useState(false);
  return (
    <Card className={`${cardClass} overflow-hidden`}>
      <CardHeader className="flex justify-between items-center px-6 py-3 bg-[#34445C]/5 dark:bg-[#DCFF37]/5">
        <div className="flex items-center gap-2">
          <Icon icon="solar:monitor-bold" width={18} className="text-[#FF4654] dark:text-[#DCFF37]" />
          <span className="text-sm font-semibold text-[#34445C] dark:text-[#F5F0E1]">
            {label}
          </span>
          <Chip size="sm" variant="flat" color="success">
            Live Demo
          </Chip>
        </div>
        {codeSnippet && (
          <Button
            size="sm"
            variant="light"
            startContent={<Icon icon={showCode ? "solar:eye-bold" : "solar:code-bold"} width={16} />}
            onPress={() => setShowCode(!showCode)}
          >
            {showCode ? "Preview" : "Code"}
          </Button>
        )}
      </CardHeader>
      <CardBody className="p-4 lg:p-6">
        {showCode && codeSnippet ? (
          <Snippet
            symbol=""
            variant="flat"
            className="w-full text-xs whitespace-pre-wrap"
            hideCopyButton={false}
          >
            {codeSnippet}
          </Snippet>
        ) : (
          children
        )}
      </CardBody>
    </Card>
  );
}

/** Pricing tier card */
function PricingCard({
  tier,
  price,
  period,
  description,
  features,
  cta,
  highlight,
  badge,
}: {
  tier: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  cta: string;
  highlight?: boolean;
  badge?: string;
}) {
  return (
    <Card
      className={`${cardClass} ${
        highlight
          ? "border-[#FF4654] dark:border-[#DCFF37] shadow-lg shadow-[#FF4654]/20 dark:shadow-[#DCFF37]/20"
          : ""
      }`}
    >
      <CardHeader className="flex flex-col items-start gap-2 px-6 pt-6">
        <div className="flex items-center gap-2 w-full">
          <h3 className="text-xl font-bold text-[#34445C] dark:text-[#F5F0E1]">
            {tier}
          </h3>
          {badge && (
            <Chip size="sm" color={highlight ? "danger" : "default"} variant="flat">
              {badge}
            </Chip>
          )}
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-[#34445C] dark:text-[#F5F0E1]">
            {price}
          </span>
          {period && (
            <span className="text-default-500 text-sm">{period}</span>
          )}
        </div>
        <p className="text-default-600 text-sm">{description}</p>
      </CardHeader>
      <Divider />
      <CardBody className="px-6 py-4">
        <ul className="space-y-2">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm">
              <Icon
                icon="solar:check-circle-bold"
                width={18}
                className="text-[#FF4654] dark:text-[#DCFF37] mt-0.5 flex-shrink-0"
              />
              <span className="text-default-700">{f}</span>
            </li>
          ))}
        </ul>
        <Button
          className="w-full mt-6 rounded-none font-semibold"
          color={highlight ? "danger" : "default"}
          variant={highlight ? "solid" : "bordered"}
          style={clipPathStyle(8)}
        >
          {cta}
        </Button>
      </CardBody>
    </Card>
  );
}

/** Stat counter for the stats bar */
function StatCounter({ value, label, dark }: { value: string; label: string; dark?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className={`text-2xl lg:text-3xl font-bold ${dark ? "text-[#F5F0E1] dark:text-[#34445C]" : "text-[#FF4654] dark:text-[#DCFF37]"}`}>
        {value}
      </span>
      <span className={`text-xs lg:text-sm text-center ${dark ? "text-[#F5F0E1]/70 dark:text-[#34445C]/70" : "text-default-600"}`}>{label}</span>
    </div>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function LeetScoresPage() {
  return (
    <div className="flex w-full flex-col items-center">
      {/* ================================================================== */}
      {/* SECTION 1: HERO — Full-bleed branded background */}
      {/* ================================================================== */}
      <div className="relative w-full bg-[#34445C] overflow-hidden">
        {/* Grid overlay */}
        <div className="absolute inset-0" style={gridOverlayStyle(true)} />
        {/* Radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#DCFF37]/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-[#FF4654]/8 blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex w-full flex-col items-center text-center gap-6 px-4 py-20 md:py-28 lg:py-32 sm:px-6 lg:px-12 xl:px-24 2xl:px-32 max-w-7xl mx-auto">
          <div
            className="w-20 h-20 lg:w-24 lg:h-24 flex items-center justify-center bg-gradient-to-br from-[#DCFF37] to-[#DCFF37]/70"
            style={clipPathStyle(16)}
          >
            <Icon
              icon="solar:chart-2-bold"
              width={44}
              className="text-[#34445C] lg:w-14 lg:h-14"
            />
          </div>
          <p className="text-[#DCFF37] font-semibold text-sm tracking-[0.3em] uppercase">
            LeetScores
          </p>
          <h1
            className={title({
              size: "lg",
              color: "battleCream",
              class: "text-4xl md:text-5xl lg:text-6xl xl:text-7xl",
            })}
          >
            Esports Score Intelligence{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#DCFF37] to-[#DCFF37]/70">
              as a Service
            </span>
          </h1>
          <p className="text-[#F5F0E1]/70 max-w-3xl lg:max-w-4xl text-lg lg:text-xl xl:text-2xl leading-relaxed">
            Real-time score ingestion, multi-provider consensus, on-chain
            verification, and award-winning UI components — available as an
            embeddable service for any esports platform.
          </p>

          <div className="flex flex-wrap gap-3 justify-center mt-4">
            <Button
              as="a"
              href="#sdk"
              variant="solid"
              size="lg"
              className="esports-btn esports-btn-action font-semibold uppercase tracking-wider"
              startContent={<Icon icon="solar:code-bold" width={20} />}
            >
              Explore SDK
            </Button>
            <Button
              as="a"
              href="#pricing"
              variant="bordered"
              size="lg"
              className="rounded-none font-semibold border-[#DCFF37] text-[#DCFF37] hover:bg-[#DCFF37]/10 uppercase tracking-wider"
              style={clipPathStyle(8)}
              startContent={<Icon icon="solar:tag-price-bold" width={20} />}
            >
              View Pricing
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Bar — Bold accent strip */}
      <div className="w-full bg-gradient-to-r from-[#FF4654] via-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:via-[#DCFF37] dark:to-[#34445C]">
        <div className="max-w-7xl mx-auto py-5 px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 lg:gap-8">
            <StatCounter value="11" label="Games Supported" dark />
            <StatCounter value="75+" label="Statistics Tracked" dark />
            <StatCounter value="6" label="Data Providers" dark />
            <StatCounter value="<2s" label="Latency" dark />
            <StatCounter value="2" label="Blockchains" dark />
            <StatCounter value="18" label="Highlight Types" dark />
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* CONTENT SECTIONS — Standard background with padding */}
      {/* ================================================================== */}
      <div className="flex w-full flex-col items-center gap-16 md:gap-20 lg:gap-24 px-4 py-16 md:py-20 lg:py-24 sm:px-6 lg:px-12 xl:px-24 2xl:px-32">

      {/* ================================================================== */}
      {/* SECTION 2: PRODUCT OVERVIEW */}
      {/* ================================================================== */}
      <div className="w-full max-w-7xl">
        <SectionHeader
          icon="solar:widget-2-bold"
          label="Platform Capabilities"
          heading="What LeetScores Delivers"
          description="From raw game telemetry to verified on-chain scores, LeetScores handles the entire score lifecycle."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
          <FeatureCard
            icon="solar:shield-check-bold"
            heading="Multi-Provider Consensus"
            description="Ingest from 6 independent data providers with dual-level consensus (round + match). Byzantine fault tolerant scoring eliminates single points of failure."
            chips={["HLTV", "FACEIT", "Valve GC", "ESEA", "PandaScore", "GameState"]}
          />
          <FeatureCard
            icon="solar:chart-2-bold"
            heading="75+ Statistics Engine"
            description="Track K/D/A, ADR, KAST, HLTV 2.0 Rating, headshot %, entry frags, clutch rates, trade kills, utility damage, economy, and dozens more per player per round."
            chips={["Per-Round", "Per-Map", "Per-Player", "Historical"]}
          />
          <FeatureCard
            icon="solar:monitor-smartphone-bold"
            heading="Award-Winning UI Library"
            description="Production-ready React components with the LeetGaming esports design system — angular cuts, live animations, side-colored scoreboards, heatmaps, and timelines."
            chips={["ScoreDisplay", "Heatmap", "Timeline", "Highlights"]}
          />
          <FeatureCard
            icon="solar:link-circle-bold"
            heading="On-Chain Verification"
            description="Scores verified on Polygon PoS via Chainlink oracle networks and bridged to Solana via Wormhole. Tamper-proof scoring for prize pools and prediction markets."
            chips={["Polygon", "Solana", "Chainlink", "Wormhole"]}
          />
          <FeatureCard
            icon="solar:gamepad-bold"
            heading="11 Games, One API"
            description="CS2, Valorant, League of Legends, Dota 2, Fortnite, Apex Legends, R6 Siege, Rocket League, Overwatch 2, PUBG, and Call of Duty — unified schema."
            chips={["FPS", "MOBA", "Battle Royale", "Tactical"]}
          />
          <FeatureCard
            icon="solar:wallet-money-bold"
            heading="Monetization Built-In"
            description="Escrow prize pools, prediction markets, wager matches, and ERC-4337 smart accounts. Revenue streams ready on day one with on-chain settlement."
            chips={["Escrow", "Predictions", "Prizes", "Smart Wallets"]}
          />
        </div>
      </div>

      {/* ================================================================== */}
      {/* SECTION 3: LIVE DEMOS — CORE SCORES */}
      {/* ================================================================== */}
      <div className="w-full max-w-7xl" id="demos">
        <SectionHeader
          icon="solar:star-bold"
          label="Live Component Demos"
          heading="Award-Winning Score UI"
          description="These are real, interactive components — not screenshots. Try hovering, clicking, and exploring."
        />

        <div className="grid gap-8">
          {/* ScoreDisplay + KDADisplay side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DemoSection
              label="ScoreDisplay"
              codeSnippet={`import { ScoreDisplay } from "@/components/ui/stat-displays";

<ScoreDisplay
  team1Score={16}
  team2Score={11}
  team1Name="PHANTOM"
  team2Name="SPECTRA"
  team1Side="CT"
  team2Side="T"
  size="lg"
  showWinner={true}
/>`}
            >
              <div className="flex justify-center py-4">
                <ScoreDisplay
                  team1Score={16}
                  team2Score={11}
                  team1Name="PHANTOM"
                  team2Name="SPECTRA"
                  team1Side="CT"
                  team2Side="T"
                  size="lg"
                  showWinner={true}
                />
              </div>
            </DemoSection>

            <DemoSection
              label="KDADisplay + RatingDisplay"
              codeSnippet={`import { KDADisplay, RatingDisplay } from "@/components/ui/stat-displays";

<KDADisplay kills={28} deaths={11} assists={4} size="lg" showLabels />
<RatingDisplay rating={1.52} label="HLTV 2.0" variant="hltv2" size="lg" />`}
            >
              <div className="flex flex-col items-center gap-4 py-4">
                <KDADisplay kills={28} deaths={11} assists={4} size="lg" showLabels />
                <RatingDisplay rating={1.52} label="HLTV 2.0" variant="hltv2" size="lg" />
              </div>
            </DemoSection>
          </div>

          {/* Full Scoreboard */}
          <DemoSection
            label="MatchScoreboard — Full Detailed View"
            codeSnippet={`import { MatchScoreboard } from "@/components/match/MatchScoreboard";

<MatchScoreboard
  team1Scoreboard={team1Data}
  team2Scoreboard={team2Data}
  variant="detailed"
  showAdvancedStats={true}
/>`}
          >
            <MatchScoreboard
              team1Scoreboard={mockTeam1Scoreboard}
              team2Scoreboard={mockTeam2Scoreboard}
              variant="detailed"
              showAdvancedStats={true}
            />
          </DemoSection>
        </div>
      </div>

      {/* ================================================================== */}
      {/* SECTION 4: LIVE DEMOS — PREMIUM ANALYTICS */}
      {/* ================================================================== */}
      <div className="w-full max-w-7xl">
        <SectionHeader
          icon="solar:star-shine-bold"
          label="Premium Match Intelligence"
          heading="Highlights & Analytics"
          description="Detect aces, clutches, multi-kills, and 15 other highlight types automatically from match telemetry."
        />

        <div className="grid gap-8">
          <DemoSection
            label="PremiumHighlights — Auto-Detected Plays"
            codeSnippet={`import { PremiumHighlights } from "@/components/matches";

<PremiumHighlights
  highlights={matchHighlights}
  loading={false}
  matchId="demo-match-001"
  gameId="cs2"
/>`}
          >
            <PremiumHighlights
              highlights={mockHighlights}
              loading={false}
              matchId="demo-match-001"
              gameId="cs2"
            />
          </DemoSection>
        </div>
      </div>

      {/* ================================================================== */}
      {/* SECTION 5: GAME COVERAGE */}
      {/* ================================================================== */}
      <div className="w-full max-w-7xl">
        <SectionHeader
          icon="solar:gamepad-bold"
          label="Game Coverage"
          heading="11 Games, Unified Schema"
          description="One API, one type system, one UI library — across every major esports title."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {[
            { name: "Counter-Strike 2", icon: "mdi:target", stats: "75+ stats", modes: "5v5 Competitive, Wingman", status: "GA" },
            { name: "Valorant", icon: "mdi:sword-cross", stats: "60+ stats", modes: "Competitive, Unrated", status: "GA" },
            { name: "League of Legends", icon: "mdi:crown", stats: "55+ stats", modes: "Ranked, Draft", status: "GA" },
            { name: "Dota 2", icon: "mdi:shield-sword", stats: "55+ stats", modes: "Ranked, Turbo", status: "GA" },
            { name: "Fortnite", icon: "mdi:pistol", stats: "30+ stats", modes: "BR, Zero Build", status: "Beta" },
            { name: "Apex Legends", icon: "mdi:bullseye-arrow", stats: "35+ stats", modes: "Ranked BR, Arenas", status: "Beta" },
            { name: "Rainbow Six Siege", icon: "mdi:security", stats: "40+ stats", modes: "Ranked, Unranked", status: "Beta" },
            { name: "Rocket League", icon: "mdi:car-sports", stats: "25+ stats", modes: "Competitive, Extras", status: "Beta" },
          ].map((game) => (
            <Card key={game.name} className={cardClass}>
              <CardBody className="p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon icon={game.icon} width={20} className="text-[#FF4654] dark:text-[#DCFF37]" />
                    <span className="font-semibold text-sm text-[#34445C] dark:text-[#F5F0E1]">
                      {game.name}
                    </span>
                  </div>
                  <Chip
                    size="sm"
                    variant="flat"
                    color={game.status === "GA" ? "success" : "warning"}
                  >
                    {game.status}
                  </Chip>
                </div>
                <p className="text-xs text-default-500">{game.stats} · {game.modes}</p>
              </CardBody>
            </Card>
          ))}
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm text-default-500">
            + Overwatch 2, PUBG, Call of Duty coming Q3 2026
          </p>
        </div>
      </div>

      {/* ================================================================== */}
      {/* SECTION 6: SDK / API REFERENCE */}
      {/* ================================================================== */}
      <div className="w-full max-w-7xl" id="sdk">
        <SectionHeader
          icon="solar:code-bold"
          label="Developer Experience"
          heading="SDK & API Reference"
          description="Integrate LeetScores in minutes. TypeScript SDK, REST API, webhooks, and embeddable widgets."
        />

        <Tabs
          variant="underlined"
          classNames={{
            tabList: "gap-4 w-full relative border-b border-divider",
            cursor: "w-full bg-[#FF4654] dark:bg-[#DCFF37]",
            tab: "max-w-fit px-2 h-12",
            tabContent:
              "group-data-[selected=true]:text-[#FF4654] dark:group-data-[selected=true]:text-[#DCFF37] font-medium",
          }}
        >
          {/* TypeScript SDK Tab */}
          <Tab
            key="sdk"
            title={
              <div className="flex items-center gap-2">
                <Icon icon="mdi:language-typescript" width={18} />
                <span>TypeScript SDK</span>
              </div>
            }
          >
            <div className="mt-6 space-y-4">
              <Card className={cardClass}>
                <CardBody className="p-6">
                  <h4 className="font-semibold mb-3 text-[#34445C] dark:text-[#F5F0E1]">
                    Installation
                  </h4>
                  <Snippet symbol="$" variant="flat" className="w-full">
                    npm install @leetgaming/scores-sdk
                  </Snippet>
                </CardBody>
              </Card>

              <Card className={cardClass}>
                <CardBody className="p-6">
                  <h4 className="font-semibold mb-3 text-[#34445C] dark:text-[#F5F0E1]">
                    Quick Start
                  </h4>
                  <Snippet symbol="" variant="flat" className="w-full text-xs whitespace-pre-wrap" hideCopyButton={false}>
                    {`import { LeetScores } from "@leetgaming/scores-sdk";

const scores = new LeetScores({
  apiKey: process.env.LEETSCORES_API_KEY,
  gameId: "cs2",
});

// Get live match scores
const match = await scores.getMatchScores("match-id");
console.log(match.team1.score, match.team2.score);

// Get player statistics
const stats = await scores.getPlayerStats("player-id");
console.log(stats.rating_2, stats.adr, stats.kast);

// Stream real-time updates
scores.onScoreUpdate("match-id", (update) => {
  console.log("Round", update.round, "Score:", update.scores);
});`}
                  </Snippet>
                </CardBody>
              </Card>

              <Card className={cardClass}>
                <CardBody className="p-6">
                  <h4 className="font-semibold mb-3 text-[#34445C] dark:text-[#F5F0E1]">
                    Available Methods
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { method: "getMatchScores(matchId)", desc: "Get scores for a specific match" },
                      { method: "getPlayerStats(playerId)", desc: "Get player statistics" },
                      { method: "getLeaderboard(gameId, opts)", desc: "Get game leaderboard" },
                      { method: "getMatchAnalytics(matchId)", desc: "Get detailed match analytics" },
                      { method: "getMatchHighlights(matchId)", desc: "Get auto-detected highlights" },
                      { method: "getMatchHeatmap(matchId)", desc: "Get positional heatmap data" },
                      { method: "getMatchTimeline(matchId)", desc: "Get round-by-round timeline" },
                      { method: "verifyScore(matchId)", desc: "Verify score on-chain (Polygon)" },
                      { method: "onScoreUpdate(matchId, cb)", desc: "Subscribe to real-time updates" },
                      { method: "getMatchEvents(matchId)", desc: "Get all match events/kills" },
                    ].map((item) => (
                      <div key={item.method} className="flex items-start gap-2 p-2 rounded bg-default-100">
                        <Code className="text-xs flex-shrink-0">{item.method}</Code>
                        <span className="text-xs text-default-600">{item.desc}</span>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </div>
          </Tab>

          {/* REST API Tab */}
          <Tab
            key="rest"
            title={
              <div className="flex items-center gap-2">
                <Icon icon="mdi:api" width={18} />
                <span>REST API</span>
              </div>
            }
          >
            <div className="mt-6 space-y-4">
              <Card className={cardClass}>
                <CardBody className="p-6">
                  <h4 className="font-semibold mb-3 text-[#34445C] dark:text-[#F5F0E1]">
                    Authentication
                  </h4>
                  <p className="text-sm text-default-600 mb-3">
                    All requests require an API key in the <Code>Authorization</Code> header.
                  </p>
                  <Snippet symbol="" variant="flat" className="w-full text-xs">
                    Authorization: Bearer YOUR_API_KEY
                  </Snippet>
                </CardBody>
              </Card>

              <Card className={cardClass}>
                <CardBody className="p-6">
                  <h4 className="font-semibold mb-4 text-[#34445C] dark:text-[#F5F0E1]">
                    Endpoints
                  </h4>
                  <div className="space-y-3">
                    {[
                      { method: "GET", path: "/v1/scores/{matchId}", desc: "Get match scores" },
                      { method: "GET", path: "/v1/players/{playerId}/stats", desc: "Get player statistics" },
                      { method: "GET", path: "/v1/leaderboards/{gameId}", desc: "Get game leaderboard" },
                      { method: "GET", path: "/v1/matches/{matchId}/analytics", desc: "Get match analytics" },
                      { method: "GET", path: "/v1/matches/{matchId}/highlights", desc: "Get match highlights" },
                      { method: "GET", path: "/v1/matches/{matchId}/heatmap", desc: "Get positional heatmap" },
                      { method: "GET", path: "/v1/matches/{matchId}/timeline", desc: "Get round timeline" },
                      { method: "POST", path: "/v1/scores/{matchId}/verify", desc: "Verify score on-chain" },
                      { method: "GET", path: "/v1/games", desc: "List supported games" },
                      { method: "GET", path: "/v1/games/{gameId}/config", desc: "Get game configuration" },
                    ].map((ep) => (
                      <div key={ep.path} className="flex items-center gap-3 p-2 rounded bg-default-100">
                        <Chip
                          size="sm"
                          variant="flat"
                          color={ep.method === "POST" ? "warning" : "primary"}
                          className="font-mono text-xs min-w-[50px] text-center"
                        >
                          {ep.method}
                        </Chip>
                        <Code className="text-xs">{ep.path}</Code>
                        <span className="text-xs text-default-500 hidden sm:inline">
                          {ep.desc}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>

              <Card className={cardClass}>
                <CardBody className="p-6">
                  <h4 className="font-semibold mb-3 text-[#34445C] dark:text-[#F5F0E1]">
                    Example: Get Match Scores
                  </h4>
                  <Snippet symbol="$" variant="flat" className="w-full text-xs whitespace-pre-wrap" hideCopyButton={false}>
                    {`curl -H "Authorization: Bearer YOUR_API_KEY" \\
  https://api.leetgaming.pro/v1/scores/match-001`}
                  </Snippet>
                </CardBody>
              </Card>
            </div>
          </Tab>

          {/* Webhooks Tab */}
          <Tab
            key="webhooks"
            title={
              <div className="flex items-center gap-2">
                <Icon icon="mdi:webhook" width={18} />
                <span>Webhooks</span>
              </div>
            }
          >
            <div className="mt-6 space-y-4">
              <Card className={cardClass}>
                <CardBody className="p-6">
                  <h4 className="font-semibold mb-4 text-[#34445C] dark:text-[#F5F0E1]">
                    Available Events
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { event: "score.updated", desc: "Score changes during a live match" },
                      { event: "score.verified", desc: "Score verified on-chain (Polygon/Solana)" },
                      { event: "match.completed", desc: "Match has ended with final scores" },
                      { event: "highlight.detected", desc: "New highlight auto-detected (ace, clutch, etc.)" },
                      { event: "round.completed", desc: "A round has ended with updated stats" },
                      { event: "player.stats_updated", desc: "Player statistics updated" },
                    ].map((wh) => (
                      <div key={wh.event} className="p-3 rounded bg-default-100">
                        <Code className="text-xs text-[#FF4654] dark:text-[#DCFF37]">
                          {wh.event}
                        </Code>
                        <p className="text-xs text-default-600 mt-1">{wh.desc}</p>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>

              <Card className={cardClass}>
                <CardBody className="p-6">
                  <h4 className="font-semibold mb-3 text-[#34445C] dark:text-[#F5F0E1]">
                    Payload Example
                  </h4>
                  <Snippet symbol="" variant="flat" className="w-full text-xs whitespace-pre-wrap" hideCopyButton={false}>
                    {`{
  "event": "highlight.detected",
  "match_id": "match-001",
  "timestamp": "2026-03-07T14:23:00Z",
  "data": {
    "type": "Ace",
    "player": "razr",
    "team": "PHANTOM",
    "weapon": "ak-47",
    "kill_count": 5,
    "round": 3,
    "time_span_ms": 4200
  }
}`}
                  </Snippet>
                </CardBody>
              </Card>
            </div>
          </Tab>

          {/* Embeddable Widgets Tab */}
          <Tab
            key="widgets"
            title={
              <div className="flex items-center gap-2">
                <Icon icon="solar:widget-bold" width={18} />
                <span>Widgets</span>
              </div>
            }
          >
            <div className="mt-6 space-y-4">
              <Card className={cardClass}>
                <CardBody className="p-6">
                  <h4 className="font-semibold mb-3 text-[#34445C] dark:text-[#F5F0E1]">
                    Embed Scoreboard Widget
                  </h4>
                  <p className="text-sm text-default-600 mb-3">
                    Drop a live scoreboard into any website with a single line of HTML.
                  </p>
                  <Snippet symbol="" variant="flat" className="w-full text-xs whitespace-pre-wrap" hideCopyButton={false}>
                    {`<iframe
  src="https://widgets.leetgaming.pro/scoreboard?matchId=match-001&theme=dark&game=cs2"
  width="100%"
  height="400"
  frameborder="0"
  allow="autoplay"
></iframe>`}
                  </Snippet>
                </CardBody>
              </Card>

              <Card className={cardClass}>
                <CardBody className="p-6">
                  <h4 className="font-semibold mb-4 text-[#34445C] dark:text-[#F5F0E1]">
                    Widget Types
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { widget: "Scoreboard", path: "/scoreboard", desc: "Live match scoreboard with player stats" },
                      { widget: "Leaderboard", path: "/leaderboard", desc: "Game leaderboard with rank tiers" },
                      { widget: "Match Card", path: "/match-card", desc: "Compact match result card" },
                      { widget: "Player Stats", path: "/player-stats", desc: "Individual player statistics" },
                      { widget: "Highlights", path: "/highlights", desc: "Auto-detected match highlights" },
                      { widget: "Heatmap", path: "/heatmap", desc: "Positional heatmap overlay" },
                    ].map((w) => (
                      <div key={w.widget} className="p-3 rounded bg-default-100">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm">{w.widget}</span>
                          <Code className="text-xs">{w.path}</Code>
                        </div>
                        <p className="text-xs text-default-600">{w.desc}</p>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>

              <Card className={cardClass}>
                <CardBody className="p-6">
                  <h4 className="font-semibold mb-3 text-[#34445C] dark:text-[#F5F0E1]">
                    Customization Parameters
                  </h4>
                  <div className="space-y-2">
                    {[
                      { param: "theme", values: "dark | light | auto", desc: "Color theme" },
                      { param: "game", values: "cs2 | valorant | lol | dota2 | ...", desc: "Game filter" },
                      { param: "compact", values: "true | false", desc: "Compact mode" },
                      { param: "locale", values: "en | pt-BR | es | fr | de | ...", desc: "Language" },
                      { param: "accent", values: "hex color code", desc: "Accent color override" },
                    ].map((p) => (
                      <div key={p.param} className="flex items-center gap-3 text-sm">
                        <Code className="text-xs min-w-[80px]">{p.param}</Code>
                        <span className="text-default-500 text-xs">{p.values}</span>
                        <span className="text-default-600 text-xs hidden sm:inline">— {p.desc}</span>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </div>
          </Tab>
        </Tabs>
      </div>

      {/* ================================================================== */}
      {/* SECTION 7: ARCHITECTURE HIGHLIGHTS */}
      {/* ================================================================== */}
      <div className="w-full max-w-7xl">
        <SectionHeader
          icon="solar:server-bold"
          label="Architecture"
          heading="How LeetScores Works"
          description="From game server to blockchain — a multi-stage pipeline with Byzantine fault tolerance."
        />

        <Card className={`${cardClass} overflow-hidden`}>
          <CardBody className="p-6 lg:p-8">
            {/* Pipeline flow */}
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-2">
              {[
                { icon: "solar:gamepad-bold", label: "Game Servers", sub: "6 Providers" },
                { icon: "solar:arrow-right-bold", label: "", sub: "" },
                { icon: "solar:shield-check-bold", label: "Consensus Engine", sub: "BFT Voting" },
                { icon: "solar:arrow-right-bold", label: "", sub: "" },
                { icon: "solar:database-bold", label: "Score Store", sub: "MongoDB + Kafka" },
                { icon: "solar:arrow-right-bold", label: "", sub: "" },
                { icon: "solar:link-circle-bold", label: "On-Chain", sub: "Chainlink Oracle" },
                { icon: "solar:arrow-right-bold", label: "", sub: "" },
                { icon: "solar:monitor-bold", label: "Client SDK", sub: "React + REST" },
              ].map((step, i) =>
                step.label === "" ? (
                  <Icon
                    key={i}
                    icon={step.icon}
                    width={20}
                    className="text-default-400 hidden md:block"
                  />
                ) : (
                  <div
                    key={i}
                    className="flex flex-col items-center gap-1 px-3 py-2 rounded bg-default-100 min-w-[100px]"
                  >
                    <Icon
                      icon={step.icon}
                      width={24}
                      className="text-[#FF4654] dark:text-[#DCFF37]"
                    />
                    <span className="text-xs font-semibold text-[#34445C] dark:text-[#F5F0E1]">
                      {step.label}
                    </span>
                    <span className="text-xs text-default-500">{step.sub}</span>
                  </div>
                ),
              )}
            </div>

            <Divider className="my-6" />

            {/* Key architecture points */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded bg-default-50">
                <h4 className="font-semibold text-sm mb-2 text-[#34445C] dark:text-[#F5F0E1]">
                  Dual-Level Consensus
                </h4>
                <p className="text-xs text-default-600">
                  Round-level consensus validates individual round results from 3+ providers.
                  Match-level consensus aggregates and cross-validates the full match outcome
                  before on-chain submission.
                </p>
              </div>
              <div className="p-4 rounded bg-default-50">
                <h4 className="font-semibold text-sm mb-2 text-[#34445C] dark:text-[#F5F0E1]">
                  Anomaly Detection
                </h4>
                <p className="text-xs text-default-600">
                  Statistical anomaly detection flags suspicious scores using z-score analysis,
                  historical comparison, and cross-provider divergence metrics. Flagged matches
                  require manual review before on-chain finalization.
                </p>
              </div>
              <div className="p-4 rounded bg-default-50">
                <h4 className="font-semibold text-sm mb-2 text-[#34445C] dark:text-[#F5F0E1]">
                  Cross-Chain Bridge
                </h4>
                <p className="text-xs text-default-600">
                  Verified scores on Polygon PoS are bridged to Solana via Wormhole for
                  cross-chain prize pool settlement. Variable-length Chainlink response encoding
                  supports per-map on-chain storage.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* ================================================================== */}
      {/* SECTION 8: CONSENSUS ENGINE DEEP DIVE */}
      {/* ================================================================== */}
      <div className="w-full max-w-7xl">
        <SectionHeader
          icon="solar:shield-check-bold"
          label="Consensus"
          heading="Multi-Provider Consensus Engine"
          description="How LeetScores achieves Byzantine-fault-tolerant scoring from 6 independent data providers."
        />

        {/* 60/30/10 formula + flow */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Left: Formula explanation */}
          <Card className={`${cardClass} overflow-hidden`}>
            <CardBody className="p-6 lg:p-8">
              <h3 className="text-lg font-bold mb-4 text-[#34445C] dark:text-[#F5F0E1]">
                Weighted Agreement Formula
              </h3>
              <p className="text-sm text-default-600 mb-6">
                Every score passes through a three-layer consensus check.
                Each layer is weighted by its importance to final outcome integrity.
              </p>

              <div className="space-y-4">
                {[
                  {
                    weight: "60%",
                    color: "bg-[#FF4654]",
                    label: "Series Winner",
                    desc: "Weighted-mode vote across all providers. Each provider's vote is scaled by its confidence weight (0.85–0.95).",
                  },
                  {
                    weight: "30%",
                    color: "bg-[#FFC700]",
                    label: "Series Score",
                    desc: "Score consensus with configurable tolerance (±1 round for FPS, exact for MOBA). Groups values within tolerance window.",
                  },
                  {
                    weight: "10%",
                    color: "bg-[#DCFF37]",
                    label: "Per-Game (Map) Scores",
                    desc: "Average agreement across all individual games in the series. Cross-validates map names, round scores, and durations.",
                  },
                ].map((item) => (
                  <div key={item.label} className="flex gap-3 items-start">
                    <div
                      className={`${item.color} text-white text-xs font-bold px-2 py-1 rounded-sm min-w-[48px] text-center mt-0.5`}
                    >
                      {item.weight}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-[#34445C] dark:text-[#F5F0E1]">
                        {item.label}
                      </h4>
                      <p className="text-xs text-default-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Divider className="my-5" />

              <div className="px-4 py-3 rounded bg-default-50 font-mono text-xs text-default-700">
                <span className="text-[#FF4654]">agreement</span> = winner×<span className="text-[#FF4654]">0.60</span> + score×<span className="text-[#FFC700]">0.30</span> + games×<span className="text-[#DCFF37] dark:text-[#34445C]">0.10</span>
              </div>
            </CardBody>
          </Card>

          {/* Right: Confidence levels + anomaly detection */}
          <div className="flex flex-col gap-6">
            <Card className={`${cardClass} overflow-hidden`}>
              <CardBody className="p-6 lg:p-8">
                <h3 className="text-lg font-bold mb-4 text-[#34445C] dark:text-[#F5F0E1]">
                  Confidence Levels
                </h3>
                <div className="space-y-3">
                  {[
                    { level: 3, label: "High", threshold: "≥ 95%", color: "text-green-500", desc: "All providers agree — auto-publish to chain" },
                    { level: 2, label: "Medium", threshold: "≥ 80%", color: "text-[#FFC700]", desc: "Minor divergence — publish with review flag" },
                    { level: 1, label: "Low", threshold: "≥ 60%", color: "text-orange-500", desc: "Significant divergence — manual review required" },
                    { level: 0, label: "None", threshold: "< 60%", color: "text-[#FF4654]", desc: "Consensus failed — score rejected, re-fetch triggered" },
                  ].map((c) => (
                    <div key={c.level} className="flex items-center gap-3">
                      <div className={`text-2xl font-bold w-8 text-center ${c.color}`}>{c.level}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-[#34445C] dark:text-[#F5F0E1]">{c.label}</span>
                          <Chip size="sm" variant="flat" className="text-xs">{c.threshold}</Chip>
                        </div>
                        <p className="text-xs text-default-500">{c.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            <Card className={`${cardClass} overflow-hidden`}>
              <CardBody className="p-6 lg:p-8">
                <h3 className="text-lg font-bold mb-3 text-[#34445C] dark:text-[#F5F0E1]">
                  Anomaly Detection
                </h3>
                <p className="text-xs text-default-500 mb-3">
                  Six automated checks flag suspicious scores before on-chain publication.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "Score Out of Range",
                    "Impossible Combination",
                    "Winner-Score Mismatch",
                    "Duplicate Submission",
                    "Outlier Score (2σ)",
                    "Stale Data (>24h)",
                  ].map((a) => (
                    <div
                      key={a}
                      className="flex items-center gap-2 text-xs px-3 py-2 rounded bg-[#FF4654]/5 dark:bg-[#FF4654]/10"
                    >
                      <Icon icon="solar:danger-triangle-bold" width={14} className="text-[#FF4654] shrink-0" />
                      <span className="text-default-700 dark:text-default-300">{a}</span>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Provider weights table */}
        <Card className={`${cardClass} overflow-hidden mt-6`}>
          <CardBody className="p-6 lg:p-8">
            <h3 className="text-lg font-bold mb-4 text-[#34445C] dark:text-[#F5F0E1]">
              Provider Confidence Weights
            </h3>
            <p className="text-sm text-default-500 mb-4">
              Each provider carries a base confidence weight. Dynamic adjustment reduces weight
              by 50% if accuracy drops below 70%.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-default-200">
                    <th className="text-left py-2 px-3 text-default-500 font-medium">Provider</th>
                    <th className="text-center py-2 px-3 text-default-500 font-medium">Weight</th>
                    <th className="text-center py-2 px-3 text-default-500 font-medium">Tier</th>
                    <th className="text-left py-2 px-3 text-default-500 font-medium">Coverage</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: "Steam Web API", weight: 0.95, tier: "Authoritative", games: "CS2 (Valve official)" },
                    { name: "GRID", weight: 0.92, tier: "Official", games: "CS2, Valorant, LoL, Dota 2" },
                    { name: "FACEIT Data API", weight: 0.90, tier: "Platform", games: "CS2 (FACEIT matches)" },
                    { name: "SportsDataIO", weight: 0.90, tier: "Premium", games: "CS2, LoL, Dota 2" },
                    { name: "PandaScore", weight: 0.85, tier: "Premium", games: "CS2, Valorant, LoL, Dota 2" },
                    { name: "Abios", weight: 0.85, tier: "Premium", games: "CS2, Valorant, LoL, Dota 2" },
                  ].map((p) => (
                    <tr key={p.name} className="border-b border-default-100 last:border-0">
                      <td className="py-2 px-3 font-medium text-[#34445C] dark:text-[#F5F0E1]">{p.name}</td>
                      <td className="py-2 px-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-20 h-2 bg-default-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#FF4654] dark:bg-[#DCFF37] rounded-full"
                              style={{ width: `${p.weight * 100}%` }}
                            />
                          </div>
                          <span className="text-xs font-mono text-default-500">{p.weight.toFixed(2)}</span>
                        </div>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <Chip size="sm" variant="flat" className="text-xs">{p.tier}</Chip>
                      </td>
                      <td className="py-2 px-3 text-xs text-default-500">{p.games}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* ================================================================== */}
      {/* SECTION 9: ORACLE ARCHITECTURE */}
      {/* ================================================================== */}
      <div className="w-full max-w-7xl">
        <SectionHeader
          icon="solar:link-circle-bold"
          label="Oracle"
          heading="Decentralized Score Oracle"
          description="On-chain publication to Polygon PoS and Solana with cross-chain bridging via Wormhole."
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Oracle pipeline card */}
          <Card className={`${cardClass} overflow-hidden lg:col-span-2`}>
            <CardBody className="p-6 lg:p-8">
              <h3 className="text-lg font-bold mb-4 text-[#34445C] dark:text-[#F5F0E1]">
                Oracle Pipeline
              </h3>

              {/* State machine flow */}
              <div className="flex flex-wrap items-center gap-2 mb-6">
                {[
                  { label: "Pending", color: "bg-default-200 text-default-700" },
                  { label: "→", color: "" },
                  { label: "Consensus", color: "bg-[#FFC700]/20 text-[#FFC700] dark:text-[#FFC700]" },
                  { label: "→", color: "" },
                  { label: "Publishing", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
                  { label: "→", color: "" },
                  { label: "Published", color: "bg-[#DCFF37]/20 text-[#34445C] dark:text-[#DCFF37]" },
                  { label: "→", color: "" },
                  { label: "Finalized", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
                ].map((s, i) =>
                  s.label === "→" ? (
                    <Icon key={i} icon="solar:arrow-right-bold" width={16} className="text-default-400" />
                  ) : (
                    <Chip key={i} size="sm" className={`${s.color} text-xs font-medium`}>
                      {s.label}
                    </Chip>
                  ),
                )}
              </div>

              <p className="text-sm text-default-600 mb-4">
                Disputed scores re-enter the consensus pipeline. A 72-hour dispute window allows
                on-chain challenges before finalization locks the result permanently.
              </p>

              <Divider className="my-4" />

              <h4 className="text-sm font-bold mb-3 text-[#34445C] dark:text-[#F5F0E1]">
                Chain Configuration
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded bg-default-50">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon icon="mdi:ethereum" width={20} className="text-[#8247E5]" />
                    <span className="text-sm font-bold text-[#34445C] dark:text-[#F5F0E1]">Polygon PoS</span>
                    <Chip size="sm" variant="flat" className="text-xs">eip155:137</Chip>
                  </div>
                  <ul className="text-xs text-default-500 space-y-1 list-disc list-inside">
                    <li>Chainlink Functions + Automation</li>
                    <li>128 block confirmations (~4 min)</li>
                    <li>LeetScoreOracle.sol + LeetVault</li>
                    <li>Wormhole sender for cross-chain</li>
                  </ul>
                </div>
                <div className="p-4 rounded bg-default-50">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon icon="simple-icons:solana" width={20} className="text-[#9945FF]" />
                    <span className="text-sm font-bold text-[#34445C] dark:text-[#F5F0E1]">Solana Mainnet</span>
                    <Chip size="sm" variant="flat" className="text-xs">solana:mainnet</Chip>
                  </div>
                  <ul className="text-xs text-default-500 space-y-1 list-disc list-inside">
                    <li>Anchor program (ed25519 sigs)</li>
                    <li>32 slot confirmations (~13s)</li>
                    <li>leet_score_oracle + leet_vault</li>
                    <li>Wormhole receiver for bridging</li>
                  </ul>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Key invariants sidebar */}
          <Card className={`${cardClass} overflow-hidden`}>
            <CardBody className="p-6 lg:p-8">
              <h3 className="text-lg font-bold mb-4 text-[#34445C] dark:text-[#F5F0E1]">
                Key Invariants
              </h3>
              <div className="space-y-3">
                {[
                  { label: "Min sources for consensus", value: "3" },
                  { label: "Min confidence threshold", value: "0.75" },
                  { label: "Dispute window", value: "72 hours" },
                  { label: "Max series length", value: "Bo5" },
                  { label: "Chainlink encoding limit", value: "256 bytes" },
                  { label: "FPS score tolerance", value: "±1 round" },
                  { label: "MOBA score tolerance", value: "Exact" },
                  { label: "Provider accuracy floor", value: "70%" },
                ].map((inv) => (
                  <div key={inv.label} className="flex justify-between items-center py-1 border-b border-default-100 last:border-0">
                    <span className="text-xs text-default-500">{inv.label}</span>
                    <span className="text-xs font-mono font-semibold text-[#34445C] dark:text-[#DCFF37]">{inv.value}</span>
                  </div>
                ))}
              </div>

              <Divider className="my-4" />

              <h4 className="text-sm font-bold mb-3 text-[#34445C] dark:text-[#F5F0E1]">
                Consensus Policies
              </h4>
              <div className="space-y-2">
                {[
                  { name: "Strict", sources: 3, conf: "90%", desc: "Zero tolerance, exact scores" },
                  { name: "Standard", sources: 3, conf: "75%", desc: "±1 round, ±2 stats" },
                  { name: "Relaxed", sources: 2, conf: "60%", desc: "±2 rounds, score-only" },
                ].map((p) => (
                  <div key={p.name} className="p-2 rounded bg-default-50">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-semibold text-[#34445C] dark:text-[#F5F0E1]">{p.name}</span>
                      <Chip size="sm" variant="flat" className="text-[10px]">{p.sources} src / {p.conf}</Chip>
                    </div>
                    <p className="text-[10px] text-default-500">{p.desc}</p>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* ================================================================== */}
      {/* SECTION 10: HOW TO CONTRIBUTE */}
      {/* ================================================================== */}
      <div className="w-full max-w-7xl">
        <SectionHeader
          icon="solar:users-group-rounded-bold"
          label="Open Source"
          heading="How to Contribute"
          description="LeetScores is built in the open. Here's how to get involved."
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Getting started */}
          <Card className={`${cardClass} overflow-hidden lg:col-span-2`}>
            <CardBody className="p-6 lg:p-8">
              <h3 className="text-lg font-bold mb-4 text-[#34445C] dark:text-[#F5F0E1]">
                Quick Start
              </h3>
              <div className="space-y-4">
                {[
                  {
                    step: 1,
                    title: "Clone & Setup",
                    code: "git clone https://github.com/leetgaming-pro/esap.git && cd esap && make up",
                    desc: "Clone the repo and spin up the full environment with Docker + Kind.",
                  },
                  {
                    step: 2,
                    title: "Pick an Issue",
                    code: "gh issue list --label \"good first issue\"",
                    desc: "Browse open issues labeled 'good first issue' or 'help wanted' on GitHub.",
                  },
                  {
                    step: 3,
                    title: "Create a Branch",
                    code: "git checkout -b feature/my-improvement",
                    desc: "Use the naming convention: feature/, fix/, or refactor/ prefix.",
                  },
                  {
                    step: 4,
                    title: "Run Tests & Submit PR",
                    code: "make ci-test && gh pr create --fill",
                    desc: "All PRs require passing lint, type-check, unit tests, build, and E2E tests.",
                  },
                ].map((s) => (
                  <div key={s.step} className="flex gap-4 items-start">
                    <div
                      className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C] text-white dark:text-[#34445C] text-sm font-bold rounded-sm shrink-0"
                      style={clipPathStyle(6)}
                    >
                      {s.step}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-[#34445C] dark:text-[#F5F0E1] mb-1">
                        {s.title}
                      </h4>
                      <p className="text-xs text-default-500 mb-2">{s.desc}</p>
                      <div className="px-3 py-2 rounded bg-default-50 font-mono text-xs text-default-700 overflow-x-auto">
                        <code>{s.code}</code>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Code standards + repo map */}
          <div className="flex flex-col gap-6">
            <Card className={`${cardClass} overflow-hidden`}>
              <CardBody className="p-6 lg:p-8">
                <h3 className="text-lg font-bold mb-3 text-[#34445C] dark:text-[#F5F0E1]">
                  Code Standards
                </h3>
                <div className="space-y-2">
                  {[
                    { icon: "mdi:language-typescript", label: "TypeScript strict — no any types" },
                    { icon: "mdi:language-go", label: "Go — Clean / Hexagonal Architecture" },
                    { icon: "solar:test-tube-bold", label: "E2E tests required for new features" },
                    { icon: "solar:shield-check-bold", label: "Validate() on all commands/queries" },
                    { icon: "solar:code-bold", label: "Use SDK hooks, never raw fetch()" },
                    { icon: "solar:copy-bold", label: "D.R.Y. — extract to lib/ and hooks/" },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center gap-2 text-xs">
                      <Icon icon={s.icon} width={16} className="text-[#FF4654] dark:text-[#DCFF37] shrink-0" />
                      <span className="text-default-600">{s.label}</span>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            <Card className={`${cardClass} overflow-hidden`}>
              <CardBody className="p-6 lg:p-8">
                <h3 className="text-lg font-bold mb-3 text-[#34445C] dark:text-[#F5F0E1]">
                  Repository Map
                </h3>
                <div className="space-y-1.5 font-mono text-xs text-default-600">
                  {[
                    { path: "leetgaming-pro-web/", desc: "Next.js frontend" },
                    { path: "replay-api/", desc: "Go API + domain logic" },
                    { path: "replay-api/pkg/domain/", desc: "Business logic (DDD)" },
                    { path: "replay-api/pkg/infra/", desc: "DB, Kafka, adapters" },
                    { path: "replay-common/", desc: "Shared Go packages" },
                    { path: "k8s/", desc: "Kubernetes manifests" },
                    { path: "e2e/", desc: "End-to-end tests" },
                    { path: "docs/", desc: "Architecture & guides" },
                  ].map((r) => (
                    <div key={r.path} className="flex items-baseline gap-2">
                      <span className="text-[#FF4654] dark:text-[#DCFF37]">{r.path}</span>
                      <span className="text-default-400">{r.desc}</span>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            <Card className={`${cardClass} overflow-hidden`}>
              <CardBody className="p-6">
                <h3 className="text-sm font-bold mb-2 text-[#34445C] dark:text-[#F5F0E1]">
                  CI Quality Gates
                </h3>
                <div className="flex flex-wrap gap-2">
                  {["Lint", "Type Check", "Unit Tests", "Build", "E2E Tests"].map((gate) => (
                    <Chip key={gate} size="sm" variant="flat" className="text-xs">
                      <span className="flex items-center gap-1">
                        <Icon icon="solar:check-circle-bold" width={12} className="text-green-500" />
                        {gate}
                      </span>
                    </Chip>
                  ))}
                </div>
                <p className="text-[10px] text-default-400 mt-2">
                  All gates must pass before a PR can be merged.
                </p>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>

      </div>{/* end content wrapper */}

      {/* ================================================================== */}
      {/* SECTION 11: COMPETITIVE COMPARISON — Full-bleed navy bg */}
      {/* ================================================================== */}
      <div className="relative w-full bg-[#34445C] overflow-hidden">
        <div className="absolute inset-0" style={gridOverlayStyle(true)} />
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-[#DCFF37]/5 blur-[150px] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-16 md:py-20 lg:py-24 sm:px-6 lg:px-12 xl:px-24 2xl:px-32">
          <div className="flex flex-col items-center text-center gap-4 mb-12">
            <div
              className="w-14 h-14 flex items-center justify-center bg-gradient-to-br from-[#DCFF37] to-[#DCFF37]/70"
              style={clipPathStyle(10)}
            >
              <Icon icon="solar:chart-square-bold" width={28} className="text-[#34445C]" />
            </div>
            <p className="text-[#DCFF37] font-semibold text-sm tracking-[0.3em] uppercase">
              Why LeetScores
            </p>
            <h2 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-[#F5F0E1]">
              More Than a Data Feed
            </h2>
            <p className="text-[#F5F0E1]/60 max-w-2xl text-base lg:text-lg">
              Traditional esports data providers charge per-game fees for raw API access.
              LeetScores bundles verified data, UI components, on-chain settlement,
              and auto-detected highlights into one competitive offering.
            </p>
          </div>

          {/* Comparison Table */}
          <Card className="rounded-none border border-[#DCFF37]/20 bg-[#34445C]/80 backdrop-blur-sm overflow-hidden">
            <CardBody className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#DCFF37]/20">
                      <th className="text-left p-4 text-[#F5F0E1]/60 font-medium">Feature</th>
                      <th className="text-center p-4">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-[#DCFF37] font-bold text-lg">LeetScores</span>
                          <Chip size="sm" className="bg-[#DCFF37]/20 text-[#DCFF37] border-0">from $0/mo</Chip>
                        </div>
                      </th>
                      <th className="text-center p-4">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-[#F5F0E1]/60 font-medium">Traditional Providers</span>
                          <Chip size="sm" variant="flat" className="bg-[#F5F0E1]/5 text-[#F5F0E1]/40 border-0">from €400/game/mo</Chip>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { feature: "Real-time WebSocket scores", leet: true, trad: "Paid add-on" },
                      { feature: "75+ statistics per player", leet: true, trad: "Limited" },
                      { feature: "Production-ready UI components", leet: true, trad: false },
                      { feature: "Auto-detected highlights (18 types)", leet: true, trad: false },
                      { feature: "On-chain score verification", leet: true, trad: false },
                      { feature: "Multi-provider consensus (BFT)", leet: true, trad: false },
                      { feature: "Embeddable widgets", leet: true, trad: false },
                      { feature: "Anomaly detection", leet: true, trad: false },
                      { feature: "Cross-chain bridge (Polygon ↔ Solana)", leet: true, trad: false },
                      { feature: "All 11 games included", leet: "Growth plan", trad: "Per-game pricing" },
                      { feature: "Play-by-play event feed", leet: true, trad: "Pro tier only" },
                      { feature: "Smart contract escrow integration", leet: true, trad: false },
                    ].map((row) => (
                      <tr key={row.feature} className="border-b border-[#DCFF37]/10 last:border-0">
                        <td className="p-4 text-[#F5F0E1]/80">{row.feature}</td>
                        <td className="p-4 text-center">
                          {row.leet === true ? (
                            <Icon icon="solar:check-circle-bold" width={22} className="text-[#DCFF37] mx-auto" />
                          ) : (
                            <span className="text-[#DCFF37]/80 text-xs">{row.leet}</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {row.trad === false ? (
                            <Icon icon="solar:close-circle-bold" width={22} className="text-[#FF4654]/50 mx-auto" />
                          ) : (
                            <span className="text-[#F5F0E1]/40 text-xs">{row.trad}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Content sections resume */}
      <div className="flex w-full flex-col items-center gap-16 md:gap-20 lg:gap-24 px-4 py-16 md:py-20 sm:px-6 lg:px-12 xl:px-24 2xl:px-32">

      {/* ================================================================== */}
      {/* SECTION 12: PRICING */}
      {/* ================================================================== */}
      <div className="w-full max-w-7xl" id="pricing">
        <SectionHeader
          icon="solar:tag-price-bold"
          label="Service Tiers"
          heading="LeetScores API Pricing"
          description="Start free, scale as you grow. Enterprise SLAs available."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          <PricingCard
            tier="Starter"
            price="Free"
            description="Explore the API and build your prototype."
            features={[
              "1,000 API calls/month",
              "2 games (CS2, Valorant)",
              "Basic score data (K/D/A, scores)",
              "Community support",
              "Scoreboard widget",
              "Test environment access",
            ]}
            cta="Get API Key"
          />
          <PricingCard
            tier="Growth"
            price="$49"
            period="/month"
            description="For production applications with real traffic."
            highlight
            badge="Most Popular"
            features={[
              "50,000 API calls/month",
              "All 11 games",
              "Full 75+ statistics engine",
              "Webhooks & real-time streams",
              "All embeddable widgets",
              "Email support (24h SLA)",
              "Analytics & heatmap data",
              "Highlight auto-detection",
            ]}
            cta="Start Growth Plan"
          />
          <PricingCard
            tier="Enterprise"
            price="Custom"
            description="Dedicated infrastructure with SLA guarantees."
            features={[
              "Unlimited API calls",
              "Dedicated infrastructure",
              "99.9% uptime SLA",
              "On-chain verification access",
              "Custom game integrations",
              "White-label UI components",
              "Priority support (1h SLA)",
              "Dedicated account manager",
            ]}
            cta="Contact Sales"
          />
        </div>
      </div>

      </div>{/* end content wrapper 2 */}

      {/* ================================================================== */}
      {/* SECTION 13: CTA FOOTER — Full-bleed branded */}
      {/* ================================================================== */}
      <div className="relative w-full bg-[#34445C] overflow-hidden">
        <div className="absolute inset-0" style={gridOverlayStyle(true)} />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-[#DCFF37]/8 blur-[150px] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-16 md:py-20 lg:py-24 sm:px-6 lg:px-12 flex flex-col items-center text-center gap-6">
          <div
            className="w-16 h-16 flex items-center justify-center bg-gradient-to-br from-[#DCFF37] to-[#DCFF37]/70"
            style={clipPathStyle(12)}
          >
            <Icon icon="solar:rocket-bold" width={32} className="text-[#34445C]" />
          </div>
          <h2 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-[#F5F0E1]">
            Ready to Integrate{" "}
            <span className="text-[#DCFF37]">LeetScores</span>?
          </h2>
          <p className="text-[#F5F0E1]/60 max-w-2xl text-lg">
            Join the next generation of esports platforms with verified,
            real-time score intelligence and award-winning UI components.
          </p>

          <div className="flex flex-wrap gap-3 justify-center">
            <Button
              variant="solid"
              size="lg"
              className="esports-btn esports-btn-action font-semibold uppercase tracking-wider"
              startContent={<Icon icon="solar:key-bold" width={20} />}
            >
              Get API Key
            </Button>
            <Button
              variant="bordered"
              size="lg"
              className="rounded-none font-semibold border-[#DCFF37] text-[#DCFF37] hover:bg-[#DCFF37]/10 uppercase tracking-wider"
              style={clipPathStyle(8)}
              startContent={<Icon icon="solar:chat-round-dots-bold" width={20} />}
            >
              Contact Sales
            </Button>
            <Button
              as={Link}
              href="/docs"
              variant="light"
              size="lg"
              className="font-semibold text-[#F5F0E1]/70 hover:text-[#F5F0E1]"
              startContent={<Icon icon="solar:book-bold" width={20} />}
            >
              Back to Docs
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 justify-center mt-2">
            {[
              "11 Games",
              "75+ Statistics",
              "On-Chain Verified",
              "Sub-2s Latency",
              "6 Data Providers",
              "Polygon + Solana",
            ].map((chip) => (
              <Chip key={chip} size="sm" className="bg-[#DCFF37]/10 text-[#DCFF37] border-0">
                {chip}
              </Chip>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

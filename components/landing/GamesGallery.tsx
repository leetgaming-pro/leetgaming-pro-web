/**
 * GamesGallery - Supported Games interactive gallery
 * 3D tilt cards with game-specific accent colors, animated counters, scroll reveals
 */

"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { LazyMotion, domAnimation, m, useMotionValue, useTransform } from 'framer-motion';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { Electrolize } from 'next/font/google';
import { scrollAnimations, scrollViewport, springs } from '@/lib/design/animations';
import { Icon } from '@iconify/react';
import { Button } from '@nextui-org/react';

const electrolize = Electrolize({ weight: "400", subsets: ["latin"] });

// ─── Game Data ──────────────────────────────────────────────────────────────

interface GameInfo {
  id: string;
  name: string;
  shortName: string;
  color: string;
  bgColor: string;
  description: string;
  players: string;
  hasReplayAnalysis: boolean;
  hasMatchmaking: boolean;
  hasTournaments: boolean;
}

const GAMES: GameInfo[] = [
  {
    id: 'cs2',
    name: 'Counter-Strike 2',
    shortName: 'CS2',
    color: '#FF9800',
    bgColor: 'from-[#FF9800]/20 to-[#F57C00]/5',
    description: 'Full demo parsing, HLTV ratings, economy analysis',
    players: '45M+',
    hasReplayAnalysis: true,
    hasMatchmaking: true,
    hasTournaments: true,
  },
  {
    id: 'valorant',
    name: 'Valorant',
    shortName: 'VAL',
    color: '#FF4654',
    bgColor: 'from-[#FF4654]/20 to-[#DC3D4B]/5',
    description: 'Agent stats, ability usage, round-by-round analysis',
    players: '28M+',
    hasReplayAnalysis: true,
    hasMatchmaking: true,
    hasTournaments: true,
  },
  {
    id: 'lol',
    name: 'League of Legends',
    shortName: 'LoL',
    color: '#C89B3C',
    bgColor: 'from-[#C89B3C]/20 to-[#A67C00]/5',
    description: 'Champion mastery, lane performance, team coordination',
    players: '150M+',
    hasReplayAnalysis: false,
    hasMatchmaking: true,
    hasTournaments: true,
  },
  {
    id: 'dota2',
    name: 'Dota 2',
    shortName: 'DOTA',
    color: '#A13D2D',
    bgColor: 'from-[#A13D2D]/20 to-[#8B2D1F]/5',
    description: 'Hero performance, team fight analysis, item builds',
    players: '12M+',
    hasReplayAnalysis: false,
    hasMatchmaking: true,
    hasTournaments: true,
  },
  {
    id: 'r6',
    name: 'Rainbow Six Siege',
    shortName: 'R6',
    color: '#4A90D9',
    bgColor: 'from-[#4A90D9]/20 to-[#2C5AA0]/5',
    description: 'Operator stats, map control, breach analysis',
    players: '90M+',
    hasReplayAnalysis: false,
    hasMatchmaking: true,
    hasTournaments: true,
  },
  {
    id: 'pubg',
    name: 'PUBG',
    shortName: 'PUBG',
    color: '#F2A900',
    bgColor: 'from-[#F2A900]/20 to-[#D69E00]/5',
    description: 'Survival stats, drop analysis, engagement tracking',
    players: '30M+',
    hasReplayAnalysis: false,
    hasMatchmaking: true,
    hasTournaments: true,
  },
  {
    id: 'apex',
    name: 'Apex Legends',
    shortName: 'APEX',
    color: '#DA292A',
    bgColor: 'from-[#DA292A]/20 to-[#B91C1C]/5',
    description: 'Legend performance, damage analysis, movement metrics',
    players: '25M+',
    hasReplayAnalysis: false,
    hasMatchmaking: true,
    hasTournaments: true,
  },
  {
    id: 'fortnite',
    name: 'Fortnite',
    shortName: 'FN',
    color: '#9D4DBB',
    bgColor: 'from-[#9D4DBB]/20 to-[#7C3AED]/5',
    description: 'Build battles, survival analysis, elimination tracking',
    players: '80M+',
    hasReplayAnalysis: false,
    hasMatchmaking: true,
    hasTournaments: true,
  },
];

// ─── Game Card with 3D Tilt ────────────────────────────────────────────────

function GameCard({ game, index }: { game: GameInfo; index: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-100, 100], [8, -8]);
  const rotateY = useTransform(x, [-100, 100], [-8, 8]);

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(event.clientX - centerX);
    y.set(event.clientY - centerY);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  }

  return (
    <m.div
      className="relative group cursor-pointer"
      style={{
        perspective: 800,
      }}
      variants={{
        offscreen: { opacity: 0, y: 30, scale: 0.9 },
        onscreen: { opacity: 1, y: 0, scale: 1, transition: { ...springs.gentle, delay: index * 0.06 } },
      }}
    >
      <m.div
        className={`relative overflow-hidden border border-default-200/30 dark:border-default-700/30 bg-gradient-to-br ${game.bgColor} backdrop-blur-sm`}
        style={{
          rotateX: isHovered ? rotateX : 0,
          rotateY: isHovered ? rotateY : 0,
          clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%)',
          transformStyle: 'preserve-3d',
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        whileHover={{ scale: 1.02, transition: springs.snappy }}
      >
        {/* Game banner */}
        <div className="relative h-28 sm:h-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60 z-10" />
          <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-10 z-0">
            <Icon icon="solar:gamepad-bold" width={80} className="text-white" />
          </div>

          {/* Players badge */}
          <div className="absolute top-3 right-3 z-20 px-2 py-0.5 bg-black/60 backdrop-blur-sm border"
            style={{ borderColor: `${game.color}40`, clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%)' }}
          >
            <span className={`${electrolize.className} text-[10px] uppercase tracking-wider`} style={{ color: game.color }}>
              {game.players} Players
            </span>
          </div>

          {/* Game short name */}
          <div className="absolute bottom-3 left-4 z-20">
            <span className={`${electrolize.className} text-2xl sm:text-3xl font-bold uppercase tracking-tight`} style={{ color: game.color }}>
              {game.shortName}
            </span>
          </div>
        </div>

        {/* Info section */}
        <div className="p-4">
          <h3 className={`${electrolize.className} text-sm font-bold text-foreground uppercase tracking-wide mb-1`}>
            {game.name}
          </h3>
          <p className="text-xs text-default-500 leading-relaxed mb-3">
            {game.description}
          </p>

          {/* Capability badges */}
          <div className="flex flex-wrap gap-1.5">
            {game.hasReplayAnalysis && (
              <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider border bg-[#DCFF37]/10 border-[#DCFF37]/20 text-[#DCFF37]"
                style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%)' }}
              >
                AI Analysis
              </span>
            )}
            {game.hasMatchmaking && (
              <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider border bg-[#FF4654]/10 border-[#FF4654]/20 text-[#FF4654] dark:text-[#FF4654]"
                style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%)' }}
              >
                Matchmaking
              </span>
            )}
            {game.hasTournaments && (
              <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider border bg-[#FFC700]/10 border-[#FFC700]/20 text-[#FFC700]"
                style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%)' }}
              >
                Tournaments
              </span>
            )}
          </div>
        </div>

        {/* Hover glow */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{ boxShadow: `inset 0 0 40px 0 ${game.color}15, 0 0 20px 0 ${game.color}10` }}
        />

        {/* Accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: game.color, opacity: 0.5 }} />
      </m.div>
    </m.div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function GamesGallery() {
  const { theme } = useTheme();
  const router = useRouter();

  return (
    <section className="landing-section relative py-24 md:py-32 overflow-hidden"
      style={{
        background: theme === 'dark'
          ? 'linear-gradient(180deg, #0a0a0a 0%, #0d1117 50%, #0a0a0a 100%)'
          : 'linear-gradient(180deg, #F5F0E1 0%, #ebe6d7 50%, #F5F0E1 100%)',
      }}
    >
      <div className="container mx-auto px-6 sm:px-8 lg:px-12 max-w-7xl relative z-10">
        <LazyMotion features={domAnimation}>
          {/* Header */}
          <m.div
            className="text-center mb-16"
            initial="offscreen"
            whileInView="onscreen"
            viewport={scrollViewport}
            variants={scrollAnimations.fadeInUp}
          >
            <span className={`${electrolize.className} text-xs sm:text-sm uppercase tracking-[0.3em] text-[#FF4654] dark:text-[#DCFF37] mb-4 block`}>
              GAMES
            </span>
            <h2 className={`${electrolize.className} text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 uppercase tracking-tight`}>
              <span className="text-[#FF4654] dark:text-[#DCFF37]">11</span> GAMES.{' '}
              ONE PLATFORM.
            </h2>
            <p className="text-default-500 text-base sm:text-lg max-w-2xl mx-auto">
              From tactical shooters to MOBAs and battle royales. Your competitive journey, across every title.
            </p>
          </m.div>

          {/* Games Grid */}
          <m.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5"
            initial="offscreen"
            whileInView="onscreen"
            viewport={scrollViewport}
            variants={{
              offscreen: {},
              onscreen: { transition: { staggerChildren: 0.06 } },
            }}
          >
            {GAMES.map((game, i) => (
              <GameCard key={game.id} game={game} index={i} />
            ))}
          </m.div>

          {/* More games indicator */}
          <m.div
            className="text-center mt-8"
            initial="offscreen"
            whileInView="onscreen"
            viewport={scrollViewport}
            variants={scrollAnimations.fadeInUp}
          >
            <p className="text-default-400 text-sm mb-4">
              + Overwatch 2, Free Fire, Tibia, and more coming soon
            </p>
            <Button
              className="h-10 px-6 text-sm font-medium border-1 border-[#FF4654]/30 dark:border-[#DCFF37]/30 text-[#FF4654] dark:text-[#DCFF37] rounded-none touch-target hover:bg-[#FF4654]/10 dark:hover:bg-[#DCFF37]/10 transition-colors"
              radius="none"
              variant="bordered"
              endContent={<Icon icon="solar:arrow-right-linear" width={16} className="text-[#FF4654] dark:text-[#DCFF37]" />}
              onPress={() => router.push("/games")}
            >
              View All Games
            </Button>
          </m.div>
        </LazyMotion>
      </div>
    </section>
  );
}

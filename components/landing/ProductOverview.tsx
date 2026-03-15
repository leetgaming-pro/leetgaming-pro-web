/**
 * ProductOverview - "What is LeetGaming.PRO?" section
 * 4 product pillars with 3D icon accents and scroll-triggered stagger animations
 */

"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import { Icon } from '@iconify/react';
import { useTheme } from 'next-themes';
import { Electrolize } from 'next/font/google';
import { scrollAnimations, scrollViewport, staggerAnimations, springs } from '@/lib/design/animations';

const electrolize = Electrolize({ weight: "400", subsets: ["latin"] });

const SceneWrapper = dynamic(() => import('@/lib/3d/scene-wrapper'), { ssr: false });
const FloatingElement = dynamic(() => import('@/lib/3d/floating-element'), { ssr: false });

// ─── Mini 3D Icon Scenes ────────────────────────────────────────────────────

function MiniReplayIcon() {
  return (
    <SceneWrapper cameraPosition={[0, 0, 3]} cameraFov={40} style={{ width: '100%', height: '100%' }}>
      <FloatingElement speed={2} rotationIntensity={0.8}>
        <mesh rotation={[0.3, 0.5, 0]}>
          <icosahedronGeometry args={[0.6, 1]} />
          <meshStandardMaterial color="#FF4654" emissive="#FF4654" emissiveIntensity={0.4} metalness={0.5} roughness={0.3} wireframe />
        </mesh>
        <mesh rotation={[0.3, 0.5, 0]}>
          <icosahedronGeometry args={[0.4, 0]} />
          <meshStandardMaterial color="#DCFF37" emissive="#DCFF37" emissiveIntensity={0.5} metalness={0.6} roughness={0.2} />
        </mesh>
      </FloatingElement>
    </SceneWrapper>
  );
}

function MiniMatchmakingIcon() {
  return (
    <SceneWrapper cameraPosition={[0, 0, 3]} cameraFov={40} style={{ width: '100%', height: '100%' }}>
      <FloatingElement speed={1.8} rotationIntensity={0.6}>
        <mesh>
          <torusGeometry args={[0.5, 0.15, 8, 32]} />
          <meshStandardMaterial color="#DCFF37" emissive="#DCFF37" emissiveIntensity={0.4} metalness={0.5} roughness={0.3} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.18, 8, 8]} />
          <meshStandardMaterial color="#FF4654" emissive="#FF4654" emissiveIntensity={0.6} metalness={0.3} roughness={0.4} />
        </mesh>
      </FloatingElement>
    </SceneWrapper>
  );
}

function MiniTournamentIcon() {
  return (
    <SceneWrapper cameraPosition={[0, 0, 3]} cameraFov={40} style={{ width: '100%', height: '100%' }}>
      <FloatingElement speed={1.5} rotationIntensity={0.4}>
        <mesh position={[0, -0.15, 0]}>
          <cylinderGeometry args={[0.3, 0.45, 0.3, 6]} />
          <meshStandardMaterial color="#FFC700" emissive="#FFC700" emissiveIntensity={0.3} metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0, 0.25, 0]}>
          <cylinderGeometry args={[0.45, 0.3, 0.5, 6]} />
          <meshStandardMaterial color="#FFC700" emissive="#FFC700" emissiveIntensity={0.3} metalness={0.9} roughness={0.1} />
        </mesh>
      </FloatingElement>
    </SceneWrapper>
  );
}

function MiniPrizeIcon() {
  return (
    <SceneWrapper cameraPosition={[0, 0, 3]} cameraFov={40} style={{ width: '100%', height: '100%' }}>
      <FloatingElement speed={2.2} rotationIntensity={0.7}>
        <mesh rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.5, 0.5, 0.08]} />
          <meshStandardMaterial color="#DCFF37" emissive="#DCFF37" emissiveIntensity={0.4} metalness={0.5} roughness={0.3} />
        </mesh>
        <mesh rotation={[0, Math.PI / 4, Math.PI / 4]}>
          <boxGeometry args={[0.5, 0.5, 0.08]} />
          <meshStandardMaterial color="#FF4654" emissive="#FF4654" emissiveIntensity={0.4} metalness={0.5} roughness={0.3} transparent opacity={0.7} />
        </mesh>
      </FloatingElement>
    </SceneWrapper>
  );
}

// ─── Pillar Data ────────────────────────────────────────────────────────────

const PILLARS = [
  {
    title: 'AI Replay Analysis',
    description: 'Upload your demos and get instant HLTV 2.0 ratings, ADR, KAST%, round-by-round economy breakdowns, and AI-powered improvement suggestions.',
    icon: 'solar:cpu-bolt-bold',
    scene: MiniReplayIcon,
    gradient: 'from-[#FF4654]/10 to-transparent',
    borderColor: 'border-[#FF4654]/20 dark:border-[#DCFF37]/20',
  },
  {
    title: 'Skill-Based Matchmaking',
    description: 'Elo/Glicko-2 powered rating system with tiered queues across 30+ global regions. Fair matches from casual to elite competition.',
    icon: 'solar:target-bold',
    scene: MiniMatchmakingIcon,
    gradient: 'from-[#DCFF37]/10 to-transparent',
    borderColor: 'border-[#DCFF37]/20 dark:border-[#DCFF37]/20',
  },
  {
    title: 'Automated Tournaments',
    description: 'Create or join bracket tournaments with automated scheduling, live spectating, anti-cheat protection, and verified prize distribution.',
    icon: 'solar:cup-star-bold',
    scene: MiniTournamentIcon,
    gradient: 'from-[#FFC700]/10 to-transparent',
    borderColor: 'border-[#FFC700]/20 dark:border-[#FFC700]/20',
  },
  {
    title: 'Transparent Prize Pools',
    description: 'Blockchain-verified escrow ensures fair payouts. Multi-currency support with instant withdrawals via Stripe, crypto, or in-platform wallet.',
    icon: 'solar:shield-check-bold',
    scene: MiniPrizeIcon,
    gradient: 'from-[#34445C]/10 dark:from-[#DCFF37]/10 to-transparent',
    borderColor: 'border-[#34445C]/20 dark:border-[#DCFF37]/20',
  },
];

// ─── Main Component ─────────────────────────────────────────────────────────

export default function ProductOverview() {
  const { theme } = useTheme();

  return (
    <section className="landing-section relative py-24 md:py-32 bg-background overflow-hidden">
      {/* Background grid pattern */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: `linear-gradient(rgba(${theme === 'dark' ? '220,255,55' : '52,68,92'}, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(${theme === 'dark' ? '220,255,55' : '52,68,92'}, 0.3) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="container mx-auto px-6 sm:px-8 lg:px-12 max-w-7xl relative z-10">
        <LazyMotion features={domAnimation}>
          {/* Section Header */}
          <m.div
            className="text-center mb-16 md:mb-20"
            initial="offscreen"
            whileInView="onscreen"
            viewport={scrollViewport}
            variants={scrollAnimations.fadeInUp}
          >
            <span className={`${electrolize.className} text-xs sm:text-sm uppercase tracking-[0.3em] text-[#FF4654] dark:text-[#DCFF37] mb-4 block`}>
              THE PLATFORM
            </span>
            <h2 className={`${electrolize.className} text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 uppercase tracking-tight`}>
              EVERYTHING YOU NEED TO{' '}
              <span className="text-[#FF4654] dark:text-[#DCFF37]">GO PRO</span>
            </h2>
            <p className="text-default-500 text-base sm:text-lg max-w-2xl mx-auto">
              One platform that replaces fragmented tools with an integrated competitive gaming ecosystem.
            </p>
          </m.div>

          {/* Pillars Grid */}
          <m.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8"
            initial="offscreen"
            whileInView="onscreen"
            viewport={scrollViewport}
            variants={{
              offscreen: {},
              onscreen: {
                transition: { staggerChildren: 0.1, delayChildren: 0.1 },
              },
            }}
          >
            {PILLARS.map((pillar, index) => (
              <m.div
                key={pillar.title}
                className={`relative group border ${pillar.borderColor} bg-gradient-to-br ${pillar.gradient} backdrop-blur-sm overflow-hidden transition-all duration-300 hover:shadow-lg`}
                style={{
                  clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)',
                }}
                variants={{
                  offscreen: { opacity: 0, y: 40, scale: 0.95 },
                  onscreen: { opacity: 1, y: 0, scale: 1, transition: { ...springs.gentle, duration: 0.6 } },
                }}
              >
                <div className="flex flex-col sm:flex-row items-start gap-4 p-6 sm:p-8">
                  {/* 3D Icon */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 relative">
                    <pillar.scene />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-8 h-8 flex items-center justify-center bg-[#FF4654]/10 dark:bg-[#DCFF37]/10"
                        style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)' }}
                      >
                        <Icon icon={pillar.icon} width={18} className="text-[#FF4654] dark:text-[#DCFF37]" />
                      </div>
                      <h3 className={`${electrolize.className} text-lg sm:text-xl font-bold text-foreground uppercase tracking-wide`}>
                        {pillar.title}
                      </h3>
                    </div>
                    <p className="text-default-500 text-sm sm:text-base leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                </div>

                {/* Hover glow edge */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    boxShadow: `inset 0 0 30px 0 ${theme === 'dark' ? 'rgba(220,255,55,0.05)' : 'rgba(255,70,84,0.05)'}`,
                  }}
                />
              </m.div>
            ))}
          </m.div>
        </LazyMotion>
      </div>
    </section>
  );
}

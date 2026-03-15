/**
 * TournamentsShowcase - Tournaments & Prize Distribution section
 * 3D trophy, animated bracket flow, revenue visualization
 */

"use client";

import React, { useRef } from 'react';
import dynamic from 'next/dynamic';
import { Button } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { Electrolize } from "next/font/google";
import { scrollAnimations, scrollViewport, springs } from '@/lib/design/animations';
import { useFrame } from '@react-three/fiber';
import { Float, MeshReflectorMaterial } from '@react-three/drei';
import * as THREE from 'three';

const electrolize = Electrolize({ weight: "400", subsets: ["latin"] });
const SceneWrapper = dynamic(() => import('@/lib/3d/scene-wrapper'), { ssr: false });

// ─── 3D Trophy Scene ────────────────────────────────────────────────────────

function TrophyModel() {
  const trophyRef = useRef<THREE.Group>(null);
  const sparklesRef = useRef<THREE.Points>(null);

  const sparklePositions = React.useMemo(() => {
    const arr = new Float32Array(60 * 3);
    for (let i = 0; i < 60; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 3;
      arr[i * 3 + 1] = Math.random() * 3;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 3;
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (!trophyRef.current || !sparklesRef.current) return;
    const time = state.clock.getElapsedTime();
    trophyRef.current.rotation.y = time * 0.3;
    sparklesRef.current.rotation.y = -time * 0.1;

    const posArr = sparklesRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < 60; i++) {
      posArr[i * 3 + 1] += Math.sin(time * 2 + i * 0.3) * 0.002;
    }
    sparklesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <>
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
        <group ref={trophyRef} position={[0, 0, 0]}>
          {/* Base */}
          <mesh position={[0, -1.2, 0]}>
            <cylinderGeometry args={[0.6, 0.8, 0.35, 6]} />
            <meshStandardMaterial color="#FFC700" emissive="#FFC700" emissiveIntensity={0.2} metalness={0.95} roughness={0.1} />
          </mesh>

          {/* Stem */}
          <mesh position={[0, -0.7, 0]}>
            <cylinderGeometry args={[0.12, 0.2, 0.65, 8]} />
            <meshStandardMaterial color="#FFC700" emissive="#FFC700" emissiveIntensity={0.15} metalness={0.95} roughness={0.1} />
          </mesh>

          {/* Cup body */}
          <mesh position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.55, 0.25, 0.9, 8, 1, true]} />
            <meshStandardMaterial color="#FFC700" emissive="#FFC700" emissiveIntensity={0.25} metalness={0.95} roughness={0.08} side={THREE.DoubleSide} />
          </mesh>

          {/* Cup rim */}
          <mesh position={[0, 0.5, 0]}>
            <torusGeometry args={[0.55, 0.05, 8, 32]} />
            <meshStandardMaterial color="#FFC700" emissive="#FFC700" emissiveIntensity={0.3} metalness={0.95} roughness={0.05} />
          </mesh>

          {/* Handles */}
          {[-1, 1].map((side) => (
            <mesh key={side} position={[side * 0.65, 0.1, 0]} rotation={[0, 0, side * 0.3]}>
              <torusGeometry args={[0.2, 0.04, 8, 16, Math.PI]} />
              <meshStandardMaterial color="#FFC700" emissive="#FFC700" emissiveIntensity={0.2} metalness={0.95} roughness={0.1} />
            </mesh>
          ))}

          {/* Star on front */}
          <mesh position={[0, 0.15, 0.26]} rotation={[0, 0, Math.PI / 10]}>
            <octahedronGeometry args={[0.12, 0]} />
            <meshStandardMaterial color="#DCFF37" emissive="#DCFF37" emissiveIntensity={0.8} metalness={0.3} roughness={0.2} toneMapped={false} />
          </mesh>
        </group>
      </Float>

      {/* Sparkles */}
      <points ref={sparklesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[sparklePositions, 3]} count={60} />
        </bufferGeometry>
        <pointsMaterial size={0.03} color="#FFC700" transparent opacity={0.6} sizeAttenuation blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>

      {/* Lighting */}
      <pointLight position={[0, 2, 2]} intensity={1} color="#FFC700" distance={8} />
      <pointLight position={[-2, 0, -1]} intensity={0.4} color="#DCFF37" distance={5} />
    </>
  );
}

function TrophyScene() {
  return (
    <SceneWrapper cameraPosition={[0, 0.5, 3.5]} cameraFov={45} style={{ width: '100%', height: '100%' }}>
      <TrophyModel />
    </SceneWrapper>
  );
}

// ─── Bracket Visualization ──────────────────────────────────────────────────

const BRACKET_TEAMS = [
  ['Team Alpha', 'Team Bravo'],
  ['Team Charlie', 'Team Delta'],
  ['Team Echo', 'Team Foxtrot'],
  ['Team Golf', 'Team Hotel'],
];

function BracketVisualization() {
  const { theme } = useTheme();
  const accentColor = theme === 'dark' ? '#DCFF37' : '#FF4654';
  const mutedColor = theme === 'dark' ? 'rgba(220,255,55,0.2)' : 'rgba(255,70,84,0.2)';

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Round of 8 */}
      <div className="flex flex-col gap-2 mb-4">
        {BRACKET_TEAMS.map((pair, i) => (
          <m.div
            key={i}
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 * i, duration: 0.4 }}
          >
            <div className="flex-1 space-y-1">
              {pair.map((team, j) => (
                <div key={j} className={`text-xs px-2 py-1 border ${j === 0 ? `border-[${accentColor}]/30 bg-[${accentColor}]/10` : 'border-default-200/30 bg-default-100/50'}`}
                  style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%)' }}
                >
                  <span className={`${electrolize.className} ${j === 0 ? 'text-[#FF4654] dark:text-[#DCFF37]' : 'text-default-500'} text-[10px] uppercase tracking-wider`}>
                    {team}
                  </span>
                </div>
              ))}
            </div>
            {i < 2 && (
              <div className="w-4 h-px" style={{ backgroundColor: accentColor, opacity: 0.3 }} />
            )}
          </m.div>
        ))}
      </div>

      {/* Semi-final connectors */}
      <m.div
        className="flex items-center justify-center gap-4 my-3"
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        <div className={`${electrolize.className} text-xs text-[#FF4654] dark:text-[#DCFF37] uppercase tracking-wider px-3 py-1 border border-[#FF4654]/20 dark:border-[#DCFF37]/20`}>
          SEMI-FINALS
        </div>
      </m.div>

      {/* Grand Final */}
      <m.div
        className="flex items-center justify-center py-2"
        initial={{ opacity: 0, scale: 0.5 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.7, duration: 0.5, type: 'spring' }}
      >
        <div className="px-4 py-2 border-2 border-[#B8860B]/40 dark:border-[#FFC700]/40 bg-[#B8860B]/10 dark:bg-[#FFC700]/10"
          style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)' }}
        >
          <span className={`${electrolize.className} text-sm text-[#B8860B] dark:text-[#FFC700] uppercase tracking-wider font-bold`}>
            🏆 GRAND FINAL
          </span>
        </div>
      </m.div>
    </div>
  );
}

// ─── Feature Cards ──────────────────────────────────────────────────────────

const TOURNAMENT_FEATURES = [
  { icon: 'solar:widget-5-bold', title: 'Automated Brackets', desc: 'Single/double elimination, Swiss, round-robin formats with automated seeding' },
  { icon: 'solar:shield-check-bold', title: 'Verified Prize Pools', desc: 'Blockchain-verified escrow ensures every dollar reaches the winners' },
  { icon: 'solar:lock-keyhole-bold', title: 'Anti-Cheat Protection', desc: 'Built-in anti-cheat with VAC, FACEIT AC, and proprietary detection' },
  { icon: 'solar:wallet-money-bold', title: 'Instant Payouts', desc: 'Winners receive prizes within minutes via Stripe, crypto, or wallet' },
];

// ─── Main Component ─────────────────────────────────────────────────────────

export default function TournamentsShowcase() {
  const { theme } = useTheme();
  const router = useRouter();

  return (
    <section className="landing-section relative py-24 md:py-32 bg-background overflow-hidden">
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
              COMPETE
            </span>
            <h2 className={`${electrolize.className} text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 uppercase tracking-tight`}>
              TOURNAMENTS &{' '}
              <span className="text-[#FFC700]">PRIZE POOLS</span>
            </h2>
            <p className="text-default-500 text-base sm:text-lg max-w-2xl mx-auto">
              From grassroots competitions to elite tournaments. Create, join, and compete with guaranteed payouts.
            </p>
          </m.div>

          {/* 3-column layout: trophy | bracket | features */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-6 items-start">
            {/* 3D Trophy */}
            <m.div
              className="h-[300px] sm:h-[350px] relative"
              initial="offscreen"
              whileInView="onscreen"
              viewport={scrollViewport}
              variants={scrollAnimations.scaleIn}
            >
              <TrophyScene />
            </m.div>

            {/* Bracket */}
            <m.div
              className="flex flex-col items-center justify-center"
              initial="offscreen"
              whileInView="onscreen"
              viewport={scrollViewport}
              variants={scrollAnimations.fadeInUp}
            >
              <h3 className={`${electrolize.className} text-sm uppercase tracking-wider text-default-500 mb-4`}>
                AUTOMATED BRACKETS
              </h3>
              <BracketVisualization />
            </m.div>

            {/* Feature cards */}
            <m.div
              className="space-y-4"
              initial="offscreen"
              whileInView="onscreen"
              viewport={scrollViewport}
              variants={{
                offscreen: {},
                onscreen: { transition: { staggerChildren: 0.1 } },
              }}
            >
              {TOURNAMENT_FEATURES.map((feature, i) => (
                <m.div
                  key={i}
                  className="flex items-start gap-3 p-4 border border-[#FFC700]/10 bg-[#FFC700]/5 hover:bg-[#FFC700]/10 transition-colors"
                  style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}
                  variants={{
                    offscreen: { opacity: 0, x: 30 },
                    onscreen: { opacity: 1, x: 0, transition: springs.gentle },
                  }}
                >
                  <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 bg-[#FFC700]/15"
                    style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%)' }}
                  >
                    <Icon icon={feature.icon} width={16} className="text-[#FFC700]" />
                  </div>
                  <div>
                    <h4 className={`${electrolize.className} text-sm font-bold text-foreground uppercase tracking-wide mb-1`}>
                      {feature.title}
                    </h4>
                    <p className="text-xs text-default-500 leading-relaxed">{feature.desc}</p>
                  </div>
                </m.div>
              ))}
            </m.div>
          </div>

          {/* CTA */}
          <m.div
            className="text-center mt-12"
            initial="offscreen"
            whileInView="onscreen"
            viewport={scrollViewport}
            variants={scrollAnimations.fadeInUp}
          >
            <Button
              className="h-12 px-8 text-base font-semibold rounded-none touch-target"
              style={{
                backgroundColor: '#FFC700',
                color: '#34445C',
                clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)',
              }}
              radius="none"
              endContent={<Icon icon="solar:arrow-right-linear" width={18} className="text-[#34445C]" />}
              onPress={() => router.push("/tournaments")}
            >
              Browse Tournaments
            </Button>
          </m.div>
        </LazyMotion>
      </div>
    </section>
  );
}
